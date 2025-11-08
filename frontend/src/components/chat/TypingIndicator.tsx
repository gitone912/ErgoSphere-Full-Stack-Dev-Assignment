import React from 'react';

interface TypingIndicatorProps {
  isTyping: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({isTyping}) => {
  if (!isTyping) return null;

  return (
    <div className="flex w-full py-4 px-8 justify-start animate-fade-in">
      <div className="max-w-2xl flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shadow-medium bg-gradient-to-br from-neutral-200 to-neutral-300 text-neutral-700">
          AI
        </div>
        
        {/* Typing Indicator Bubble */}
        <div className="flex flex-col gap-1 items-start">
          <div className="px-4 py-3 rounded-2xl shadow-soft bg-white text-neutral-800 border border-neutral-200/50 rounded-bl-md">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-typing-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-typing-bounce" style={{ animationDelay: '200ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-typing-bounce" style={{ animationDelay: '400ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
