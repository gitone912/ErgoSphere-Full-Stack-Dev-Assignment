import React, { useEffect, useRef, useState } from 'react';
import ReconnectingWebSocket from "reconnecting-websocket";
import { Message } from "../data/Message";
import { ChatBox } from "../components/chat/ChatBox";
import { ChatInput } from "../components/chat/ChatInput";

export const ChatInterface: React.FC = () => {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const webSocket = useRef<ReconnectingWebSocket | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set up websocket connection when currentConversationId changes
  useEffect(() => {
    if (currentConversationId) {
      webSocket.current = new ReconnectingWebSocket(`ws://localhost:8000/ws/chat/${currentConversationId}/`);
      
      webSocket.current.onopen = () => {
        console.log('WebSocket connection opened');
      };

      webSocket.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === "debug") {
            // Debug message - ignore for now
          } else {
            // Entire message received
            setLoading(false);
            const newMessage: Message = {sender: 'AI', content: data['message'] || data.message || ''};
            setMessages(prevMessages => [...prevMessages, newMessage]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, event.data);
        }
      };

      webSocket.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      webSocket.current.onclose = (event) => {
        console.log('Chat socket closed:', event.code, event.reason);
      };
      
      // Fetch conversation messages
      fetchMessages(currentConversationId);
    }
    return () => {
      webSocket.current?.close();
    };
  }, [currentConversationId]);

  const fetchMessages = (conversationId: number) => {
    fetch(`http://localhost:8000/api/conversations/${conversationId}/`)
      .then(response => response.json())
      .then(data => {
        const formattedMessages: Message[] = (data.messages || []).map((msg: any) => ({
          sender: msg.sender,
          content: msg.content
        }));
        setMessages(formattedMessages);
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
      });
  };

  const onNewUserMessage = (conversationId: number | null, message: Message) => {
    if (!conversationId) {
      // Create new conversation
      createNewConversation(message);
      return;
    }

    // Send message via WebSocket
    webSocket.current?.send(
      JSON.stringify({
        message: message.content,
        chat_id: conversationId,
      })
    );
    setMessages(prevMessages => [...prevMessages, message]);
    setLoading(true);
  };

  const createNewConversation = (firstMessage: Message) => {
    fetch('http://localhost:8000/api/conversations/', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({})
    })
      .then(response => response.json())
      .then(newConversation => {
        setCurrentConversationId(newConversation.id);
        // Send the first message
        onNewUserMessage(newConversation.id, firstMessage);
      })
      .catch(error => {
        console.error('Error creating conversation:', error);
      });
  };

  const handleEndConversation = () => {
    if (currentConversationId) {
      fetch(`http://localhost:8000/api/conversations/${currentConversationId}/end/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
      })
        .then(response => response.json())
        .then(data => {
          alert('Conversation ended. Summary: ' + (data.summary || 'No summary generated'));
          setCurrentConversationId(null);
          setMessages([]);
        })
        .catch(error => {
          console.error('Error ending conversation:', error);
        });
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">AI Chat Portal</h1>
        <div className="flex gap-2">
          <button
            onClick={handleNewConversation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Conversation
          </button>
          {currentConversationId && (
            <button
              onClick={handleEndConversation}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              End Conversation
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ChatBox messages={messages} isLoading={loading} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <ChatInput 
          onNewUserMessage={onNewUserMessage} 
          onNewChatCreated={(id) => setCurrentConversationId(id)} 
          chatId={currentConversationId}
        />
      </div>
    </div>
  );
};

