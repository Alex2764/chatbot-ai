/* ROLE: useLocalStorage — четене/запис на локална история и настройки, само ако persistHistory е включено. Без логика за API/модел. */

/**
 * useLocalStorage - Hook for persisting data in browser localStorage with error handling.
 * Provides save/load functionality for chat history and user preferences.
 */
import { useState, useEffect, useCallback } from 'react';

export const useLocalStorage = (key, initialValue = null) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(null);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key]);

  const saveHistory = useCallback((data) => {
    setValue(data);
  }, [setValue]);

  const loadHistory = useCallback(() => {
    return storedValue;
  }, [storedValue]);

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return {
    storedValue,
    setValue,
    removeValue,
    saveHistory,
    loadHistory
  };
};
