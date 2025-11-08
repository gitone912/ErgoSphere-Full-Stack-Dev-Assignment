from django.http import JsonResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from datetime import datetime

from .models import Agent, Chat, ChatMessage, Conversation, Message, MessageSender
from .serializers import (
    AgentSerializer, ChatSerializer, ChatMessageSerializer,
    ConversationSerializer, ConversationDetailSerializer, MessageSerializer
)
from .ai.conversation_analyzer import ConversationAnalyzer


class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data)

    def perform_destroy(self, instance):
        # Also delete related chat messages
        ChatMessage.objects.filter(chat=instance).delete()
        instance.delete()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse({"chats": serializer.data})

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        chat = self.get_object()
        messages = ChatMessage.objects.filter(chat=chat).order_by('timestamp')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)


class ConversationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing conversations.
    GET /api/conversations/ - List all conversations
    GET /api/conversations/{id}/ - Get specific conversation with messages
    POST /api/conversations/ - Create new conversation
    POST /api/conversations/{id}/end/ - End conversation and generate summary
    POST /api/conversations/{id}/send_message/ - Send message in conversation
    """
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ConversationDetailSerializer
        return ConversationSerializer

    def list(self, request, *args, **kwargs):
        """GET: Retrieve all conversations with basic info"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Filter by status if provided
        status_filter = request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Search by title if provided
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(Q(title__icontains=search))
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """GET: Get a specific conversation with full message history"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """POST: Create new conversation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        """POST: End conversation and trigger AI summary generation"""
        conversation = self.get_object()
        
        if conversation.status == 'ENDED':
            return Response(
                {"error": "Conversation is already ended."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all messages
        messages = conversation.messages.all()
        messages_data = [
            {
                'content': msg.content,
                'sender': msg.sender,
                'timestamp': msg.timestamp.isoformat()
            }
            for msg in messages
        ]
        
        # Generate summary using AI
        analyzer = ConversationAnalyzer()
        summary = analyzer.generate_summary(messages_data)
        
        # End conversation and save summary
        conversation.end_conversation()
        conversation.summary = summary
        conversation.save()
        
        serializer = self.get_serializer(conversation)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """POST: Send a message in a conversation"""
        conversation = self.get_object()
        
        if conversation.status == 'ENDED':
            return Response(
                {"error": "Cannot send message to an ended conversation."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        content = request.data.get('content', '')
        sender = request.data.get('sender', MessageSender.USER.value)
        
        if not content:
            return Response(
                {"error": "Message content is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create message
        message = Message.objects.create(
            conversation=conversation,
            content=content,
            sender=sender
        )
        
        # Update conversation title if it's the first user message
        if not conversation.title and sender == MessageSender.USER.value:
            # Use first 50 characters as title
            conversation.title = content[:50] if len(content) > 50 else content
            conversation.save()
        
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConversationQueryView(APIView):
    """
    POST: Query AI about past conversations
    """
    def post(self, request):
        query = request.data.get('query', '')
        date_from = request.data.get('date_from', None)
        date_to = request.data.get('date_to', None)
        topics = request.data.get('topics', [])
        keywords = request.data.get('keywords', [])
        max_results = int(request.data.get('max_results', 5))
        
        if not query:
            return Response(
                {"error": "Query is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get conversations based on filters - include both ACTIVE and ENDED conversations
        # Only include conversations that have at least one message
        conversations_qs = Conversation.objects.filter(messages__isnull=False).distinct()
        
        # Optionally filter by status if provided
        status_filter = request.data.get('status', None)
        if status_filter:
            conversations_qs = conversations_qs.filter(status=status_filter)
        
        if date_from:
            try:
                date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                conversations_qs = conversations_qs.filter(start_timestamp__gte=date_from_obj)
            except:
                pass
        
        if date_to:
            try:
                date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                conversations_qs = conversations_qs.filter(start_timestamp__lte=date_to_obj)
            except:
                pass
        
        # Convert to list of dicts with messages - only use Conversation/Message model
        conversations_data = []
        for conv in conversations_qs:
            messages = conv.messages.all()
            # Only include conversations that have messages
            if not messages.exists():
                continue
                
            messages_data = [
                {
                    'content': msg.content,
                    'sender': msg.sender,
                    'timestamp': msg.timestamp.isoformat()
                }
                for msg in messages
            ]
            
            conversations_data.append({
                'id': conv.id,
                'title': conv.title or f"Conversation {conv.id}",
                'start_timestamp': conv.start_timestamp.isoformat(),
                'summary': conv.summary,
                'messages': messages_data
            })
        
        # Log for debugging
        print(f"Found {len(conversations_data)} conversations with messages")
        for conv in conversations_data:
            print(f"  Conversation {conv['id']}: {len(conv['messages'])} messages")
        
        # Query AI about past conversations
        analyzer = ConversationAnalyzer()
        result = analyzer.query_past_conversations(query, conversations_data, max_results)
        
        return Response(result)


class AgentViewSet(viewsets.ModelViewSet):
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
    lookup_field = 'token'

    def destroy(self, request, *args, **kwargs):
        agent = self.get_object()
        agent.is_active = False
        agent.save()
        return Response(status=204)

    def update(self, request, *args, **kwargs):
        agent = self.get_object()
        agent.agent_type = request.data.get('agent_type')
        agent.save()
        return Response(AgentSerializer(agent).data)
