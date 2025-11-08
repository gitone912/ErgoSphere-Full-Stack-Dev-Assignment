from django.contrib import admin
from .models import Conversation, Message, Chat, ChatMessage, Agent


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'status', 'start_timestamp', 'end_timestamp', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'summary']
    readonly_fields = ['start_timestamp', 'created_at', 'updated_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'timestamp']
    list_filter = ['sender', 'timestamp']
    search_fields = ['content']
    readonly_fields = ['timestamp']


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'created_at', 'updated_at']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'chat', 'sender', 'timestamp']
    list_filter = ['sender', 'timestamp']


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ['name', 'agent_type', 'token', 'is_active', 'created_at']
    list_filter = ['is_active', 'agent_type']
    search_fields = ['name', 'token']
