'use client';
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export function useReport() {
  const [isReporting, setIsReporting] = useState(false);

  const submitReport = useCallback(async (targetType: 'Book' | 'Chapter' | 'Comment', targetId: number, reason: string, description?: string) => {
    setIsReporting(true);
    try {
      await api.post('/report', { targetType, targetId, reason, description });
      return true;
    } catch {
      return false;
    } finally {
      setIsReporting(false);
    }
  }, []);

  return { submitReport, isReporting };
}
