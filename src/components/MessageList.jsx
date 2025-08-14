/**
 * MessageList - Renders the complete chat history as a scrollable list.
 * Maps through messages array and renders individual MessageItem components.
 */
import React from 'react';
import MessageItem from './MessageItem';

const MessageList = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};

export default MessageList;
