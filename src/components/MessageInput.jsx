/* ROLE: MessageInput — поле за въвеждане на съобщения + бутони за изпращане/спиране + бутони за функции (калкулатор/време). */

/**
 * MessageInput - Input field and control buttons for sending messages and stopping streaming.
 * Handles text input, Enter key submission, streaming state management, and function-specific buttons.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import useRuntimeStore from '../state/runtimeStore';
import { MAX_INPUT_LENGTH } from '../config/constants';

const MessageInput = ({ onSend, onStop, isStreaming, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [selectedFunction, setSelectedFunction] = useState(null); // 'calculate' or 'get_current_time'
  const textareaRef = useRef(null);
  const { sendMessage } = useChat();
  const { isStreaming: runtimeStreaming } = useRuntimeStore();

  // Use runtime store streaming state if available, fallback to prop
  const isCurrentlyStreaming = runtimeStreaming !== undefined ? runtimeStreaming : isStreaming;

  const handleSubmit = async (functionType = null) => {
    const trimmedText = inputValue.trim();
    
    // Validation
    if (!trimmedText) {
      setError('Please enter a message');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (trimmedText.length > MAX_INPUT_LENGTH) {
      setError(`Message too long (max ${MAX_INPUT_LENGTH} characters)`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      // Clear any previous errors
      setError('');
      
      // Send message through useChat hook with function type
      await sendMessage(trimmedText, functionType);
      
      // Clear input and function selection after successful send
      setInputValue('');
      setSelectedFunction(null);
      
      // Focus back to input for next message
      textareaRef.current?.focus();
      
    } catch (error) {
      setError(error.message || 'Failed to send message');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isCurrentlyStreaming && !disabled) {
        handleSubmit(selectedFunction);
      }
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleStopClick = () => {
    if (onStop) {
      onStop();
    }
  };

  const handleFunctionButtonClick = (functionType) => {
    setSelectedFunction(functionType);
    // If there's already text, send immediately
    if (inputValue.trim()) {
      handleSubmit(functionType);
    } else {
      // Focus the input for user to type
      textareaRef.current?.focus();
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  return (
    <div className="message-input">
      {/* Error Display */}
      {error && (
        <div className="message-input-error">
          <span>⚠️ {error}</span>
        </div>
      )}
      
      {/* Function Buttons */}
      <div className="message-input-function-buttons">
        <button
          className={`btn btn-function ${selectedFunction === 'calculate' ? 'btn-function-active' : ''}`}
          onClick={() => handleFunctionButtonClick('calculate')}
          disabled={disabled || isCurrentlyStreaming}
          title="Use calculator function"
        >
          🧮 Calculator
        </button>
        <button
          className={`btn btn-function ${selectedFunction === 'get_current_time' ? 'btn-function-active' : ''}`}
          onClick={() => handleFunctionButtonClick('get_current_time')}
          disabled={disabled || isCurrentlyStreaming}
          title="Get current time"
        >
          🕐 Time
        </button>
      </div>
      
      {/* Input Field */}
      <textarea
        ref={textareaRef}
        className="message-input-field"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={selectedFunction === 'calculate' 
          ? "Enter calculation (e.g., 2+2*3)... (Enter to send)" 
          : selectedFunction === 'get_current_time'
          ? "Ask about time... (Enter to send)"
          : "Type your message... (Enter to send, Shift+Enter for new line)"}
        disabled={disabled || isCurrentlyStreaming}
        rows={1}
        maxLength={MAX_INPUT_LENGTH}
      />
      
      {/* Character Count */}
      <div className="message-input-counter">
        {inputValue.length}/{MAX_INPUT_LENGTH}
      </div>
      
      {/* Control Buttons */}
      <div className="message-input-buttons">
        {isCurrentlyStreaming ? (
          <button
            className="btn btn-stop"
            onClick={handleStopClick}
            disabled={disabled}
          >
            Stop
          </button>
        ) : (
          <button
            className="btn btn-send"
            onClick={() => handleSubmit(selectedFunction)}
            disabled={disabled || !inputValue.trim() || inputValue.length > MAX_INPUT_LENGTH}
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
