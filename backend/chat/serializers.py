from rest_framework import serializers

from .models import Agent, Chat, ChatMessage, Conversation, Message


class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id', 'name', 'created_at', 'updated_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'content', 'chat', 'sender', 'timestamp']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'content', 'conversation', 'sender', 'timestamp']


class ConversationSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'title', 'status', 'start_timestamp', 'end_timestamp',
            'summary', 'created_at', 'updated_at', 'message_count', 'duration'
        ]

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_duration(self, obj):
        return obj.duration


class ConversationDetailSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'title', 'status', 'start_timestamp', 'end_timestamp',
            'summary', 'created_at', 'updated_at', 'messages', 'duration'
        ]

    def get_duration(self, obj):
        return obj.duration


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = ['name', 'agent_type', 'token', 'created_at', 'updated_at', 'is_active']
