import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Initialize state with a callback to avoid unnecessary initial localStorage access
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      // Only parse stored json if it exists
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      // Initialize localStorage with initial value on error
      window.localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    }
  });

  // Memoize the setValue function to avoid unnecessary re-renders
  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  // Set initial value in localStorage if it doesn't exist
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      }
    } catch (error) {
      console.warn(`Error initializing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
