# models.py
from enum import Enum
import uuid

from django.db import models
from django.utils import timezone


class MessageSender(Enum):
    USER = 'USER'
    AI = 'AI'


class ConversationStatus(Enum):
    ACTIVE = 'ACTIVE'
    ENDED = 'ENDED'


class Conversation(models.Model):
    title = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(
        max_length=10,
        choices=[(tag.value, tag.name) for tag in ConversationStatus],
        default=ConversationStatus.ACTIVE.value
    )
    start_timestamp = models.DateTimeField(auto_now_add=True)
    end_timestamp = models.DateTimeField(null=True, blank=True)
    summary = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title or f"Conversation {self.id}"

    def end_conversation(self):
        """Mark conversation as ended and set end timestamp"""
        self.status = ConversationStatus.ENDED.value
        self.end_timestamp = timezone.now()
        self.save()

    @property
    def duration(self):
        """Calculate conversation duration in seconds"""
        if self.end_timestamp:
            return (self.end_timestamp - self.start_timestamp).total_seconds()
        return (timezone.now() - self.start_timestamp).total_seconds()


class Message(models.Model):
    content = models.TextField()
    conversation = models.ForeignKey(Conversation, related_name="messages", on_delete=models.CASCADE)
    sender = models.CharField(max_length=10, choices=[(tag.value, tag.name) for tag in MessageSender])
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender}: {self.content[:50]}"


# Keep Chat and ChatMessage for backward compatibility (will be deprecated)
class Chat(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ChatMessage(models.Model):
    content = models.TextField()
    chat = models.ForeignKey(Chat, related_name="messages", on_delete=models.CASCADE)
    sender = models.CharField(max_length=10, choices=[(tag.value, tag.name) for tag in MessageSender])
    timestamp = models.DateTimeField(auto_now_add=True)


class Agent(models.Model):
    name = models.CharField(max_length=255)
    agent_type = models.CharField(max_length=255)
    token = models.CharField(max_length=255, default='a_' + str(uuid.uuid4()), unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
