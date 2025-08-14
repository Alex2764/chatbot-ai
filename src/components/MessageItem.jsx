/**
 * MessageItem - Displays a single chat message with role, content, and timestamp.
 * Handles different message types (user, assistant, system, tool) with appropriate styling.
 */
import React from 'react';

const MessageItem = ({ message }) => {
  const { role, content, timestamp, toolName } = message;
  
  // Format tool name for display
  const getDisplayRole = () => {
    if (role === 'tool' && toolName) {
      return `Tool: ${toolName.replace(/_/g, ' ')}`;
    }
    return role;
  };
  
  // Format content for tool messages
  const getDisplayContent = () => {
    if (role === 'tool') {
      try {
        const parsed = JSON.parse(content);
        if (typeof parsed === 'object') {
          return JSON.stringify(parsed, null, 2);
        }
        return parsed;
      } catch {
        return content;
      }
    }
    return content;
  };
  
  return (
    <div className={`message-item message-${role}`}>
      <div className="message-header">
        <span className="message-role">{getDisplayRole()}</span>
        <span className="message-timestamp">{timestamp}</span>
      </div>
      <div className="message-content">{getDisplayContent()}</div>
    </div>
  );
};

export default MessageItem;
