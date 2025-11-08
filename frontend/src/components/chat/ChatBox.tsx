// ChatBox.tsx

import React from 'react';
import TypingIndicator from "./TypingIndicator";
import { ChatMessage } from "./ChatMessage";

type Message = {
  sender: string;
  content: string;
};

type ChatBoxProps = {
  messages: Message[];
  isLoading: boolean;
};

export const ChatBox: React.FC<ChatBoxProps> = ({messages, isLoading}) => {
  return (
    <div className="flex-grow overflow-y-auto py-8">
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full px-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-large mb-6">
            <span className="text-white font-bold text-3xl">E</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Welcome to ErgoSphere</h2>
          <p className="text-neutral-500 text-center max-w-md">
            Start a conversation with our AI assistant. Ask questions, get insights, and explore intelligent conversations.
          </p>
        </div>
      )}
      {messages.map((message, index) => (
        <ChatMessage 
          key={index} 
          sender={message.sender} 
          content={message.content} 
          isUser={message.sender.toLowerCase() === 'user'}
        />
      ))}
      <TypingIndicator isTyping={isLoading}/>
    </div>
  );
};
