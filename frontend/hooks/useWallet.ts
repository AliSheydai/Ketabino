'use client';
// File: hooks/useWallet.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Wallet, Transaction, CoinPackage } from '@/types';

export function useWallet() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallet = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      const [w, tx, pkgs] = await Promise.all([
        api.get<Wallet>('/wallet'),
        api.get<Transaction[]>('/wallet/transactions'),
        api.get<CoinPackage[]>('/wallet/packages'),
      ]);
      setWallet(w);
      setTransactions(tx);
      setPackages(pkgs);
    } catch {
      // not authenticated
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      fetchWallet();
    }
  }, [fetchWallet, authLoading]);

  const buyCoins = useCallback(async (coinPackageId: number) => {
    if (!isAuthenticated) return;
    await api.post('/wallet/buy-coins', { coinPackageId });
    await fetchWallet();
  }, [fetchWallet, isAuthenticated]);

  return { wallet, transactions, packages, isLoading, buyCoins, refetch: fetchWallet };
}
