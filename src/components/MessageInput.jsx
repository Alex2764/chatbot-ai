/**
 * MessageInput - Input field with Send/Stop buttons for user message entry.
 * Manages input state and handles form submission for sending messages.
 */
import React, { useState } from 'react';

const MessageInput = ({ onSend, onStop, isStreaming, disabled }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSend(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type your message..."
        disabled={disabled}
        className="message-input-field"
      />
      <div className="message-input-buttons">
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="btn btn-stop"
            disabled={disabled}
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            className="btn btn-send"
            disabled={disabled || !inputValue.trim()}
          >
            Send
          </button>
        )}
      </div>
    </form>
  );
};

export default MessageInput;
