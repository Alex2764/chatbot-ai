/* ROLE: ChatLayout — рамка на екрана. Подредба на секции без бизнес логика: MessageList, MessageInput, TypingIndicator, UiPortal. */

/**
 * ChatLayout - Main container component that wraps the entire chat interface.
 * Provides the overall structure and layout for the chat application.
 * 
 * TODO: Layout Implementation Requirements
 * 
 * Components to Integrate:
 * - MessageList: Display area for chat message history with scrollable container
 * - MessageInput: Input field and control buttons at the bottom of the chat
 * - TypingIndicator: Shows when AI is processing/typing a response
 * - UiPortal: Container for modals, toasts, and overlay components
 * 
 * Layout Structure to Implement:
 * - Header section with app title and settings button
 * - Main chat area with MessageList (flexible height, scrollable)
 * - Fixed footer with MessageInput and send/stop controls
 * - Overlay area for TypingIndicator (positioned above input)
 * - Modal/portal area for UiPortal components (settings, confirmations)
 * - Responsive design for different screen sizes
 * - Proper spacing and visual hierarchy between sections
 * - Loading states and error boundaries
 */
import React, { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import SettingsPanel from './SettingsPanel';
import { useChat } from '../hooks/useChat';

const ChatLayout = () => {
  const { messages, isStreaming, sendMessage, stopMessage } = useChat();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSendMessage = (content) => {
    sendMessage(content);
  };

  const handleStopMessage = () => {
    stopMessage();
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className="chat-layout">
      <div className="chat-container">
        <div className="chat-header">
          <h1>Chatbot AI</h1>
          <button className="settings-button" onClick={openSettings}>
            ⚙️
          </button>
        </div>
        
        <div className="chat-main">
          <MessageList messages={messages} />
          <TypingIndicator isVisible={isStreaming} />
        </div>
        
        <div className="chat-footer">
          <MessageInput 
            onSend={handleSendMessage}
            onStop={handleStopMessage}
            isStreaming={isStreaming}
            disabled={false}
          />
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={isSettingsOpen}
        onClose={closeSettings}
      />
    </div>
  );
};

export default ChatLayout;
