// Message.tsx

import React from 'react';

type MessageProps = {
  sender: string;
  content: string;
  isUser: boolean;
};

export const ChatMessage: React.FC<MessageProps> = ({sender, content, isUser}) => (
  <div className={`flex w-full py-4 px-8 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-2xl flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shadow-medium ${
        isUser 
          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white' 
          : 'bg-gradient-to-br from-neutral-200 to-neutral-300 text-neutral-700'
      }`}>
        {isUser ? 'U' : 'AI'}
      </div>
      
      {/* Message Bubble */}
      <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl shadow-soft transition-all duration-200 ${
          isUser 
            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-md' 
            : 'bg-white text-neutral-800 border border-neutral-200/50 rounded-bl-md'
        }`}>
          <div className="text-sm font-medium mb-1 opacity-80">{sender}</div>
          <div className={`leading-relaxed whitespace-pre-wrap ${
            isUser ? 'text-white' : 'text-neutral-700'
          }`}>
            {content.toString().split('\n').map((line, index) => (
              line === '' ? <br key={index}/> : <div key={index}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
