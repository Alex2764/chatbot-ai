/* ROLE: useChat — оркестрация на чат потока (изпращане → стрийм → tool-call → tool-result → финален отговор). Няма UI/DOM логика; работи само със store-ове и помощни функции. */

/**
 * useChat - High-level chat management hook that orchestrates message sending, receiving, and tool flow.
 * Integrates streaming, local storage, and tool execution for complete chat functionality.
 */
import { useState, useCallback } from 'react';
import useMessagesStore from '../state/messagesStore';
import useRuntimeStore from '../state/runtimeStore';
import useSettingsStore from '../state/settingsStore';
import OpenAIClient from '../lib/openaiClient';
import { toolRegistry } from '../lib/toolRegistry';
import { toolValidators } from '../lib/toolValidators';
import { MAX_INPUT_LENGTH, STREAM_TIMEOUT_MS, RETRY_COUNT } from '../config/constants';

export const useChat = () => {
  const { messages, addMessage, updateLastMessage } = useMessagesStore();
  const { 
    isStreaming, 
    startStreaming, 
    stopStreaming, 
    setError, 
    startToolExecution, 
    completeToolExecution 
  } = useRuntimeStore();
  const { apiKey, systemPrompt, temperature } = useSettingsStore();

  const sendMessage = useCallback(async (text) => {
    // Validation
    if (!text || !text.trim()) {
      throw new Error('Please enter a message');
    }
    
    if (text.length > MAX_INPUT_LENGTH) {
      throw new Error(`Message too long (max ${MAX_INPUT_LENGTH} characters)`);
    }

    if (!apiKey) {
      throw new Error('API key not configured. Please set it in Settings.');
    }

    try {
      // Add user message to store
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString()
      };
      addMessage(userMessage);

      // Add initial assistant message
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      };
      addMessage(assistantMessage);

      // Start streaming
      startStreaming();

      // Create OpenAI client
      const client = new OpenAIClient(apiKey);
      
      // Prepare messages for API (excluding the empty assistant message)
      const apiMessages = [
        ...messages.filter(msg => msg.role !== 'assistant'),
        userMessage
      ];

      // Get tools catalog
      const toolsCatalog = toolRegistry.getTools();

      // Start streaming chat completion
      const stream = await client.chat({
        messages: apiMessages,
        systemPrompt,
        temperature,
        toolsCatalog
      });

      let finalContent = '';
      let toolCalls = [];

      // Process streaming response
      for await (const chunk of stream) {
        if (chunk.type === 'text') {
          finalContent += chunk.content;
          updateLastMessage({ content: finalContent });
        } else if (chunk.type === 'tool_call') {
          toolCalls.push(chunk);
        }
      }

      // Handle tool calls if any
      if (toolCalls.length > 0) {
        for (const toolCall of toolCalls) {
          try {
            // Validate tool call
            const validation = toolValidators.validateToolCall(toolCall.name, toolCall.args);
            if (!validation.valid) {
              throw new Error(`Tool validation failed: ${validation.error}`);
            }

            // Mark tool execution start
            startToolExecution(toolCall.name);

            // Execute tool
            const tool = toolRegistry.getTool(toolCall.name);
            if (!tool) {
              throw new Error(`Tool '${toolCall.name}' not found`);
            }

            // Check if tool requires confirmation
            if (tool.requiresConfirm) {
              // For now, we'll skip tools that require confirmation
              // In a full implementation, this would show a ConfirmDialog
              continue;
            }

            const toolResult = await tool.execute(toolCall.args);

            // Add tool result message
            const toolMessage = {
              id: Date.now().toString(),
              role: 'tool',
              content: JSON.stringify(toolResult),
              toolName: toolCall.name,
              timestamp: new Date().toISOString()
            };
            addMessage(toolMessage);

            // Run second pass with tool result
            const secondPassMessages = [
              ...apiMessages,
              { role: 'assistant', content: finalContent, tool_calls: toolCalls },
              { role: 'tool', content: JSON.stringify(toolResult), tool_call_id: toolCall.id }
            ];

            const secondStream = await client.chat({
              messages: secondPassMessages,
              systemPrompt,
              temperature,
              toolsCatalog
            });

            let secondPassContent = '';
            for await (const chunk of secondStream) {
              if (chunk.type === 'text') {
                secondPassContent += chunk.content;
                updateLastMessage({ content: secondPassContent });
              }
            }

            finalContent = secondPassContent;

          } catch (toolError) {
            setError(`Tool execution failed: ${toolError.message}`);
            break;
          } finally {
            completeToolExecution();
          }
        }
      }

      // Update final message content
      updateLastMessage({ content: finalContent });

    } catch (error) {
      // Parse structured error response if available
      let errorMessage = error.message;
      try {
        const parsedError = JSON.parse(error.message);
        if (parsedError.humanMessage) {
          errorMessage = parsedError.humanMessage;
        }
      } catch {
        // Not a JSON error, use the original message
      }
      
      setError(errorMessage || 'Failed to send message');
      
      // Remove the empty assistant message if there was an error
      if (messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !messages[messages.length - 1].content) {
        // This would require a removeMessage method in the store
        // For now, we'll just update it with an error message
        updateLastMessage({ 
          content: `Error: ${errorMessage}`,
          error: true 
        });
      }
    } finally {
      stopStreaming();
    }
  }, [messages, addMessage, updateLastMessage, startStreaming, stopStreaming, setError, startToolExecution, completeToolExecution, apiKey, systemPrompt, temperature]);

  const stopMessage = useCallback(() => {
    stopStreaming();
  }, [stopStreaming]);

  return {
    messages,
    isStreaming,
    sendMessage,
    stopMessage
  };
};
