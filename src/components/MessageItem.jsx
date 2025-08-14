/**
 * MessageItem - Displays a single chat message with role, content, and timestamp.
 * Handles different message types (user, assistant, system) with appropriate styling.
 */
import React from 'react';

const MessageItem = ({ message }) => {
  const { role, content, timestamp } = message;
  
  return (
    <div className={`message-item message-${role}`}>
      <div className="message-header">
        <span className="message-role">{role}</span>
        <span className="message-timestamp">{timestamp}</span>
      </div>
      <div className="message-content">{content}</div>
    </div>
  );
};

export default MessageItem;
