import { useEffect, useRef } from 'react';
import type { Script } from '@/types/script';
import { STORAGE_KEY } from '@/types/script';

export function useAutoSave(script: Script) {
  const timeoutRef = useRef<number>();

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(script));
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [script]);
}
