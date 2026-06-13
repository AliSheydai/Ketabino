'use client';
// File: hooks/useBook.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Book, Chapter, Review, Comment } from '@/types';

export function useBook(id: number) {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api.get<Book>(`/book/${id}`)
      .then(setBook)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { book, isLoading, error };
}

export function useBookChapters(bookId: number) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!bookId) return;
    api.get<Chapter[]>(`/chapter/book/${bookId}`)
      .then(setChapters)
      .catch(() => setChapters([]))
      .finally(() => setIsLoading(false));
  }, [bookId]);

  return { chapters, isLoading };
}

export function useBookReviews(bookId: number) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = useCallback(() => {
    api.get<Review[]>(`/book/${bookId}/review`)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setIsLoading(false));
  }, [bookId]);

  useEffect(() => { if (bookId) fetchReviews(); }, [bookId, fetchReviews]);

  const submitReview = useCallback(async (rating: number, title: string, content: string) => {
    await api.post(`/book/${bookId}/review`, { rating, title, content });
    fetchReviews();
  }, [bookId, fetchReviews]);

  return { reviews, isLoading, submitReview };
}

export function useBookComments(bookId: number) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(() => {
    api.get<Comment[]>(`/book/${bookId}/comment`)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setIsLoading(false));
  }, [bookId]);

  useEffect(() => { if (bookId) fetchComments(); }, [bookId, fetchComments]);

  const submitComment = useCallback(async (content: string, chapterId?: number, parentCommentId?: number) => {
    await api.post(`/book/${bookId}/comment`, { content, chapterId, parentCommentId });
    fetchComments();
  }, [bookId, fetchComments]);

  return { comments, isLoading, submitComment };
}

export function useLike(bookId: number, initialLiked: boolean = false) {
  const [liked, setLiked] = useState(initialLiked);

  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  const toggleLike = useCallback(async () => {
    try {
      if (liked) {
        await api.delete(`/book/${bookId}/like`);
        setLiked(false);
      } else {
        await api.post(`/book/${bookId}/like`);
        setLiked(true);
      }
    } catch {
      // ignore
    }
  }, [bookId, liked]);

  return { liked, toggleLike };
}
