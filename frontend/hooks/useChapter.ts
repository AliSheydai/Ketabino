'use client';
// File: hooks/useChapter.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Chapter } from '@/types';

export function useChapter(chapterId: number) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChapter = useCallback(async () => {
    if (!chapterId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<Chapter>(`/chapter/${chapterId}`);
      setChapter(data);
      setIsLocked(false);
    } catch (e: unknown) {
      const err = e as Error & { status?: number; data?: any };
      if (err.status === 402) {
        setIsLocked(true);
        if (err.data && err.data.chapterDetails) {
          setChapter(err.data.chapterDetails);
        }
        setError(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [chapterId]);

  useEffect(() => { fetchChapter(); }, [fetchChapter]);

  const purchase = useCallback(async (): Promise<boolean> => {
    try {
      await api.post(`/chapter/${chapterId}/purchase`);
      await fetchChapter();
      return true;
    } catch (e: unknown) {
      throw e;
    }
  }, [chapterId, fetchChapter]);

  return { chapter, isLoading, isLocked, error, purchase, refetch: fetchChapter };
}
