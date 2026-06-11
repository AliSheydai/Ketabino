'use client';
// File: hooks/useReadingProgress.ts
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ReadingProgress, Bookmark, Highlight } from '@/types';

export function useReadingProgress(bookId: number) {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);

  const updateProgress = useCallback(async (lastReadChapterId: number, lastReadPosition: number) => {
    try {
      await api.post(`/readingprogress/${bookId}`, { lastReadChapterId, lastReadPosition });
    } catch { /* silent */ }
  }, [bookId]);

  const fetchProgress = useCallback(async () => {
    try {
      const data = await api.get<ReadingProgress>(`/readingprogress/${bookId}`);
      setProgress(data);
    } catch { /* not found */ }
  }, [bookId]);

  return { progress, fetchProgress, updateProgress };
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const fetchBookmarks = useCallback(async () => {
    try {
      const data = await api.get<Bookmark[]>('/readingprogress/bookmarks');
      setBookmarks(data);
    } catch { setBookmarks([]); }
  }, []);

  const addBookmark = useCallback(async (chapterId: number, position: number, note?: string) => {
    await api.post('/readingprogress/bookmark', { chapterId, position, note });
    await fetchBookmarks();
  }, [fetchBookmarks]);

  const removeBookmark = useCallback(async (id: number) => {
    await api.delete(`/readingprogress/bookmark/${id}`);
    await fetchBookmarks();
  }, [fetchBookmarks]);

  return { bookmarks, fetchBookmarks, addBookmark, removeBookmark };
}

export function useHighlights(chapterId: number) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const fetchHighlights = useCallback(async () => {
    try {
      const data = await api.get<Highlight[]>(`/readingprogress/highlights/${chapterId}`);
      setHighlights(data);
    } catch { setHighlights([]); }
  }, [chapterId]);

  const addHighlight = useCallback(async (
    startChar: number, endChar: number,
    textContent: string, color: string, note?: string
  ) => {
    await api.post('/readingprogress/highlight', { chapterId, startChar, endChar, textContent, color, note });
    await fetchHighlights();
  }, [chapterId, fetchHighlights]);

  const removeHighlight = useCallback(async (id: number) => {
    await api.delete(`/readingprogress/highlight/${id}`);
    await fetchHighlights();
  }, [fetchHighlights]);

  return { highlights, fetchHighlights, addHighlight, removeHighlight };
}
