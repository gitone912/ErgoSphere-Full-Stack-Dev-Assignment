// ChatInput.tsx

import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import styled from 'styled-components';
import { Message } from "../../data/Message";

type ChatInputProps = {
  onNewUserMessage: (chatId: number | null, message: Message) => void;
  onNewChatCreated: (chatId: number) => void;
  chatId: number | null;
};

export const ChatInput: React.FC<ChatInputProps> = ({onNewUserMessage, onNewChatCreated, chatId}) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();

      if (message.trim() === '') return;

      if (chatId) {
        // If there is a chatId, just send the message.
        const newMessage = {sender: 'USER', content: message};
        onNewUserMessage(chatId, newMessage)
      } else {
        // If there is no chatId, create a new conversation.
        createConversation()
      }
      setMessage(''); // Clear the input message
    }

    const createConversation = () => {
      fetch('http://localhost:8000/api/conversations/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({})
      })
        .then((response) => response.json())
        .then((newConversation) => {
          // Update listeners that a new conversation was created.
          onNewChatCreated(newConversation.id)

          // Send the message after a timeout to ensure that the Conversation has been created
          setTimeout(function () {
            // This block of code will be executed after 0.5 seconds
            onNewUserMessage(newConversation.id, {sender: 'USER', content: message})
          }, 500);
        });
    };

    return (
      <Form onSubmit={handleSubmit}>
        <InputWrapper>
          <StyledTextareaAutosize
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
            maxRows={10}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" disabled={!message.trim()}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Send</span>
          </Button>
        </InputWrapper>
      </Form>
    );
  }
;

const Form = styled.form`
  display: flex;
  width: 100%;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  width: 100%;
  background: white;
  border: 2px solid #e5e5e5;
  border-radius: 16px;
  padding: 12px 16px;
  transition: all 0.2s ease;
  
  &:focus-within {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }
`;

const StyledTextareaAutosize = styled(TextareaAutosize)`
  flex-grow: 1;
  border: none;
  border-radius: 0;
  padding: 0;
  margin: 0;
  resize: none;
  overflow: auto;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.5;
  color: #262626;
  background: transparent;
  min-height: 24px;
  max-height: 200px;
  
  &::placeholder {
    color: #a3a3a3;
  }
  
  &:focus {
    outline: none;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 10px 20px;
  border: none;
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
  cursor: pointer;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  align-self: flex-end;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
    box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;
