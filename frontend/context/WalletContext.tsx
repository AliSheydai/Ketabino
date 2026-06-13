'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Wallet, Transaction, CoinPackage } from '@/types';

interface WalletContextValue {
  wallet: Wallet | null;
  transactions: Transaction[];
  packages: CoinPackage[];
  isLoading: boolean;
  buyCoins: (coinPackageId: number) => Promise<void>;
  refetch: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallet = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      setWallet(null);
      setTransactions([]);
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

  const value = useMemo(() => ({
    wallet,
    transactions,
    packages,
    isLoading,
    buyCoins,
    refetch: fetchWallet
  }), [wallet, transactions, packages, isLoading, buyCoins, fetchWallet]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    return {
      wallet: null,
      transactions: [],
      packages: [],
      isLoading: true,
      buyCoins: async () => {},
      refetch: async () => {},
    };
  }
  return ctx;
}
