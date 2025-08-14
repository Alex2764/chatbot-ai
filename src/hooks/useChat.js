/* ROLE: useChat — оркестрация на чат потока (изпращане → стрийм → tool-call → tool-result → финален отговор). Няма UI/DOM логика; работи само със store-ове и помощни функции. */

/**
 * useChat - High-level chat management hook that orchestrates message sending, receiving, and tool flow.
 * Integrates streaming, local storage, and tool execution for complete chat functionality.
 */
import { useState, useCallback } from 'react';
import { useStreaming } from './useStreaming';
import { useLocalStorage } from './useLocalStorage';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isBusyTool, setIsBusyTool] = useState(false);
  const [pendingToolCall, setPendingToolCall] = useState(null);
  
  const { startStream, stopStream } = useStreaming();
  const { saveHistory, loadHistory } = useLocalStorage('chat-history');

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateLastMessage = useCallback((updates) => {
    setMessages(prev => {
      if (prev.length === 0) return prev;
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], ...updates };
      return newMessages;
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (content) => {
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    addMessage(userMessage);

    // Start streaming response
    setIsStreaming(true);
    try {
      await startStream(content, {
        onMessage: (content) => updateLastMessage({ content }),
        onToolCall: (toolCall) => {
          setPendingToolCall(toolCall);
          setIsBusyTool(true);
        },
        onComplete: () => {
          setIsStreaming(false);
          setIsBusyTool(false);
          setPendingToolCall(null);
        }
      });
    } catch (error) {
      setIsStreaming(false);
      setIsBusyTool(false);
      setPendingToolCall(null);
      console.error('Chat error:', error);
    }
  }, [addMessage, updateLastMessage, startStream]);

  const stopMessage = useCallback(() => {
    stopStream();
    setIsStreaming(false);
    setIsBusyTool(false);
    setPendingToolCall(null);
  }, [stopStream]);

  const executeTool = useCallback(async (toolCall) => {
    // Tool execution logic would go here
    setIsBusyTool(false);
    setPendingToolCall(null);
  }, []);

  return {
    messages,
    isStreaming,
    isBusyTool,
    pendingToolCall,
    sendMessage,
    stopMessage,
    executeTool,
    addMessage,
    updateLastMessage,
    clearMessages,
    saveHistory,
    loadHistory
  };
};
