/* ROLE: useAbortableRequest — помощен хук за заявки с таймаут и отменяне (AbortController). Без знание за чат протокола. */

/**
 * useAbortableRequest - General-purpose hook for making HTTP requests with timeout and abort capabilities.
 * Provides consistent request management with automatic cleanup and error handling.
 */
import { useRef, useCallback } from 'react';

export const useAbortableRequest = () => {
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  const makeRequest = useCallback(async (requestFn, options = {}) => {
    const { timeout = 30000, ...requestOptions } = options;

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Create new AbortController
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // Set timeout
    timeoutRef.current = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }, timeout);

    try {
      const result = await requestFn(signal, requestOptions);
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request was aborted');
      }
      throw error;
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      abortControllerRef.current = null;
    }
  }, []);

  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const isRequestActive = useCallback(() => {
    return abortControllerRef.current !== null;
  }, []);

  return {
    makeRequest,
    abortRequest,
    isRequestActive
  };
};
