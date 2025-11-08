import os
from typing import List

import django
from channels.db import database_sync_to_async

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from chat.models import Conversation, Message


class ChatMessageRepository:

    @database_sync_to_async
    def get_chat_messages(self, conversation_id: str, order_by='timestamp') -> List[Message]:
        # Retrieve the conversation history for `conversation_id` from the database
        # Convert conversation_id to int and use conversation__id for filtering
        try:
            conversation_id_int = int(conversation_id)
            return list(Message.objects.filter(conversation__id=conversation_id_int).order_by(order_by))
        except (ValueError, TypeError):
            return []

    @database_sync_to_async
    def save_message(self, message: str, sender: str, conversation_id: str):
        # Save the message to the database
        # The conversation should already exist (created by frontend via API)
        try:
            conversation_id_int = int(conversation_id)
            # Get the Conversation object - it should exist
            try:
                conversation = Conversation.objects.get(pk=conversation_id_int)
            except Conversation.DoesNotExist:
                # If conversation doesn't exist, log error and don't save message
                # This shouldn't happen if frontend creates conversation first
                print(f"Warning: Conversation {conversation_id_int} does not exist. Message not saved.")
                return
            # Create the message with the Conversation object
            Message.objects.create(sender=sender, content=message, conversation=conversation)
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid conversation_id: {conversation_id}") from e
