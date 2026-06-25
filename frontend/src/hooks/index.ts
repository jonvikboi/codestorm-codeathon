'use client';

import { useState, useCallback } from 'react';

/**
 * Generic async data-fetching hook.
 * Backend team can use this with real API service methods.
 */
export function useAsync<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<{ data: T; success: boolean; message: string }>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      return { data: null as unknown as T, success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * Media query hook for responsive logic.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  if (typeof window !== 'undefined') {
    const mql = window.matchMedia(query);
    if (mql.matches !== matches) {
      setMatches(mql.matches);
    }
  }

  return matches;
}

/**
 * Toggle hook for boolean state.
 */
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  return { value, toggle, setTrue, setFalse };
}
