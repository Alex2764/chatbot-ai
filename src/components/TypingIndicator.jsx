/**
 * TypingIndicator - Shows animated "bot is typing..." indicator during AI responses.
 * Displays three bouncing dots with text to indicate active processing.
 */
import React from 'react';

const TypingIndicator = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span className="typing-text">Bot is typing...</span>
    </div>
  );
};

export default TypingIndicator;
