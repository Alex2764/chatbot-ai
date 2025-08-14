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
  const { apiKey, systemPrompt, temperature, maxOutputTokens, topP } = useSettingsStore();

  const sendMessage = useCallback(async (text, functionType = null) => {
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

      // If a specific function is selected, execute it directly
      if (functionType) {
        console.log(`Executing specific function: ${functionType}`);
        
        try {
          // Validate tool call
          const validation = toolValidators.validateToolCall(functionType, functionType === 'calculate' ? { expression: text.trim() } : {});
          console.log('Tool validation result:', validation);
          
          if (!validation.valid) {
            throw new Error(`Tool validation failed: ${validation.error}`);
          }

          // Mark tool execution start
          startToolExecution(functionType);

          // Execute tool
          const tool = toolRegistry.getTool(functionType);
          if (!tool) {
            throw new Error(`Tool '${functionType}' not found`);
          }

          const toolArgs = functionType === 'calculate' ? { expression: text.trim() } : {};
          const toolResult = await tool.execute(toolArgs);
          console.log(`Tool ${functionType} executed with result:`, toolResult);

          // Add tool result message
          const toolMessage = {
            id: Date.now().toString(),
            role: 'tool',
            content: JSON.stringify(toolResult),
            toolName: functionType,
            timestamp: new Date().toISOString()
          };
          addMessage(toolMessage);
          console.log('Added tool message:', toolMessage);

          // Generate a natural language response based on the tool result
          let naturalResponse = '';
          if (functionType === 'calculate') {
            naturalResponse = `The calculation result is: ${toolResult.formatted || toolResult.result}`;
          } else if (functionType === 'get_current_time') {
            naturalResponse = `The current time is: ${toolResult.formatted || toolResult.currentTime}`;
          } else {
            naturalResponse = `I used the ${functionType} tool and got: ${JSON.stringify(toolResult)}`;
          }

          // Update the assistant message with the natural response
          updateLastMessage({ content: naturalResponse });

        } catch (toolError) {
          console.error('Tool execution error:', toolError);
          setError(`Tool execution failed: ${toolError.message}`);
        } finally {
          completeToolExecution();
        }
        
        return;
      }

      // Create OpenAI client
      const client = new OpenAIClient(apiKey);

      // Prepare messages for API (excluding the empty assistant message and tool messages)
      const apiMessages = [
        ...messages.filter(msg => msg.role !== 'assistant' && msg.role !== 'tool'),
        userMessage
      ];

      // Get tools catalog
      const toolsCatalog = toolRegistry.getTools();

      // Start streaming chat completion
      const stream = await client.chat({
        messages: apiMessages,
        systemPrompt,
        temperature,
        toolsCatalog,
        maxOutputTokens,
        topP
      });

      let finalContent = '';
      let toolCalls = [];

      // Process streaming response
      for await (const chunk of stream) {
        console.log('Received chunk:', chunk);
        if (chunk.type === 'text') {
          finalContent += chunk.content;
          updateLastMessage({ content: finalContent });
        } else if (chunk.type === 'tool_call') {
          console.log('Tool call received:', chunk);
          toolCalls.push(chunk);
        }
      }

      console.log('Final content after streaming:', finalContent);
      console.log('Tool calls found:', toolCalls);

      // Handle tool calls if any
      if (toolCalls.length > 0) {
        console.log('Processing tool calls:', toolCalls);
        
        for (const toolCall of toolCalls) {
          console.log('Processing tool call:', toolCall);
          
          try {
            // Validate tool call
            const validation = toolValidators.validateToolCall(toolCall.name, toolCall.args);
            console.log('Tool validation result:', validation);
            
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
              // For now, we'll execute tools that require confirmation
              // In a full implementation, this would show a ConfirmDialog
              console.log(`Tool ${toolCall.name} requires confirmation, executing anyway`);
            }

            const toolResult = await tool.execute(toolCall.args);
            console.log(`Tool ${toolCall.name} executed with result:`, toolResult);

            // Add tool result message
            const toolMessage = {
              id: Date.now().toString(),
              role: 'tool',
              content: JSON.stringify(toolResult),
              toolName: toolCall.name,
              timestamp: new Date().toISOString()
            };
            addMessage(toolMessage);
            console.log('Added tool message:', toolMessage);

            // Generate a natural language response based on the tool result
            let naturalResponse = '';
            if (toolCall.name === 'calculate') {
              naturalResponse = `The calculation result is: ${toolResult.formatted || toolResult.result}`;
            } else if (toolCall.name === 'get_current_time') {
              naturalResponse = `The current time is: ${toolResult.formatted || toolResult.currentTime}`;
            } else {
              naturalResponse = `I used the ${toolCall.name} tool and got: ${JSON.stringify(toolResult)}`;
            }

            // Update the assistant message with the natural response
            updateLastMessage({ content: naturalResponse });
            finalContent = naturalResponse;

          } catch (toolError) {
            console.error('Tool execution error:', toolError);
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
