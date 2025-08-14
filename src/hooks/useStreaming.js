/* ROLE: useStreaming — управлява ReadableStream и AbortController за входящите отговори. Носи само стрийм логика, без бизнес правила. */

/**
 * useStreaming - Manages streaming responses and AbortController for cancellable HTTP requests.
 * Handles real-time data flow and provides abort functionality for user-initiated stops.
 */
import { useRef, useCallback } from 'react';

export const useStreaming = () => {
  const abortControllerRef = useRef(null);

  const startStream = useCallback(async (content, callbacks) => {
    // Abort any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      // Simulate streaming response (replace with actual API call)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        if (signal.aborted) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // Parse chunk and call appropriate callbacks
        try {
          const parsed = JSON.parse(chunk);
          if (parsed.type === 'message') {
            callbacks.onMessage?.(parsed.content);
          } else if (parsed.type === 'tool_call') {
            callbacks.onToolCall?.(parsed.toolCall);
          }
        } catch (e) {
          // Handle non-JSON chunks
          callbacks.onMessage?.(chunk);
        }
      }

      callbacks.onComplete?.();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        throw error;
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    startStream,
    stopStream
  };
};
