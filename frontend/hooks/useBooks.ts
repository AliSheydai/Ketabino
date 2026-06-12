'use client';
// File: hooks/useBooks.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Book, Genre } from '@/types';

export function useBooks(genreId?: number, search?: string) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (genreId) params.set('genreId', String(genreId));
      if (search) params.set('search', search);
      const query = params.toString() ? `?${params}` : '';
      const data = await api.get<Book[]>(`/book${query}`);
      setBooks(data);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [genreId, search]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  return { books, isLoading, error, refetch: fetchBooks };
}

export function useMyLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<Book[]>('/book/library')
      .then(setBooks)
      .catch(() => setBooks([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { books, isLoading };
}

export function useGenres() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<Genre[]>('/genre')
      .then(setGenres)
      .catch(() => setGenres([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { genres, isLoading };
}
