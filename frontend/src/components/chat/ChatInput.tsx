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
        <StyledTextareaAutosize
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          maxRows={10}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit">Send</Button>
      </Form>
    );
  }
;

const Form = styled.form`
  display: flex;
  align-items: flex-start;
  padding: 10px;
  border-top: 1px solid #eee;
`;

const StyledTextareaAutosize = styled(TextareaAutosize)`
  flex-grow: 1;
  border: 1px solid #eee;
  border-radius: 3px;
  padding: 10px;
  margin-right: 10px;
  resize: none;
  overflow: auto;
  font-family: inherit;
  font-size: 16px;
  min-height: 14px; // Initial height
  max-height: 500px; // Max height
  &:focus,
  &:active {
    border-color: #1C1C1C;
    outline: none;
  }
`;

const Button = styled.button`
  height: 40px;
  padding: 10px 20px;
  border: none;
  background-color: #1C1C1C;
  color: white;
  cursor: pointer;
  border-radius: 3px;
  font-size: 1em;
  align-self: flex-end;
  &:hover {
    background-color: #333333; /* Change this to the desired lighter shade */
  }
`;
