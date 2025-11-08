import json
import os

import django

from chat.agents.agent_factory import AgentFactory
from chat.agents.callbacks import AsyncStreamingCallbackHandler
from chat.messages.chat_message_repository import ChatMessageRepository

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from channels.generic.websocket import AsyncWebsocketConsumer
from langchain.agents import AgentExecutor

from chat.models import MessageSender


class ChatConsumer(AsyncWebsocketConsumer):
    # The LLM agent for this chat application
    agent: AgentExecutor

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.agent_factory = AgentFactory()
        self.chat_message_repository = ChatMessageRepository()

    async def connect(self):
        # Get the conversation_id from the client (URL parameter is chat_id for backward compatibility)
        conversation_id = self.scope['url_route']['kwargs'].get('chat_id')

        # Create the agent when the websocket connection with the client is established
        self.agent = await self.agent_factory.create_agent(
            tool_names=["llm-math"],
            conversation_id=conversation_id,
            streaming=True,
            callback_handlers=[AsyncStreamingCallbackHandler(self)],
        )

        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            # Support both chat_id and conversation_id for backward compatibility
            conversation_id = text_data_json.get('conversation_id') or text_data_json.get('chat_id')

            # Forward the message to LangChain
            response = await self.message_agent(message, conversation_id)

            # Send the response from the OpenAI Chat API to the frontend client
            if response:
                await self.send(text_data=json.dumps({'message': response, 'type': 'answer'}))
            else:
                await self.send(text_data=json.dumps({'message': 'No response from agent', 'type': 'answer'}))
        except Exception as e:
            # Send error message to frontend
            error_message = f'Error processing message: {str(e)}'
            print(f"Error in receive: {error_message}")
            await self.send(text_data=json.dumps({'message': error_message, 'type': 'answer'}))

    async def message_agent(self, message: str, conversation_id: str):
        try:
            # Save the user message to the database
            await self.chat_message_repository.save_message(message=message, sender=MessageSender.USER.value, conversation_id=conversation_id)

            # Call the agent with callbacks
            print(f"Calling agent with message: {message}")
            callback_handler = AsyncStreamingCallbackHandler(self)
            response = await self.agent.arun(message, callbacks=[callback_handler])
            print(f"Agent response: {response}")

            # Save the AI message to the database
            if response:
                await self.chat_message_repository.save_message(message=response, sender=MessageSender.AI.value, conversation_id=conversation_id)

            return response
        except Exception as e:
            error_msg = f"Error in agent execution: {str(e)}"
            print(f"Error in message_agent: {error_msg}")
            import traceback
            traceback.print_exc()
            raise

    def my_callback(self, message):
        print("Callback received:", message)
