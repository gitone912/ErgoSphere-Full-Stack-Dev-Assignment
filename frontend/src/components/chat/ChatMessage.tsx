// Message.tsx

import React from 'react';

type MessageProps = {
  sender: string;
  content: string;
  isUser: boolean;
};

export const ChatMessage: React.FC<MessageProps> = ({sender, content, isUser}) => (
  <div className={`flex justify-center w-full py-2 border-t border-gray-300 ${isUser ? 'bg-white' : 'bg-gray-50'}`}>
    <div className={`mx-2 p-3 rounded-lg w-1/2 flex items-baseline font-sans text-base ${
      isUser ? 'bg-blue-100' : 'bg-gray-200'
    }`}>
      <div className="font-bold font-sans text-base min-w-[50px]">{sender}</div>
      <div className="ml-3 leading-relaxed text-base whitespace-pre-wrap">
        {content.toString().split('\n').map((line, index) => (
          line === '' ? <br key={index}/> : <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  </div>
);
