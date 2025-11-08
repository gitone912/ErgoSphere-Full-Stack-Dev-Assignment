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
    <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
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
