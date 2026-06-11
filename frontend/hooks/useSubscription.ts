'use client';
// File: hooks/useSubscription.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { SubscriptionPlan, UserSubscription } from '@/types';

export function useSubscription() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [active, setActive] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [p, a] = await Promise.all([
        api.get<SubscriptionPlan[]>('/subscription/plans'),
        api.get<UserSubscription | { message: string }>('/subscription/active'),
      ]);
      setPlans(p);
      setActive('id' in a ? a as UserSubscription : null);
    } catch { /* not auth */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const purchasePlan = useCallback(async (planId: number) => {
    await api.post('/subscription/purchase', { planId });
    await fetchAll();
  }, [fetchAll]);

  return { plans, active, isLoading, purchasePlan };
}
