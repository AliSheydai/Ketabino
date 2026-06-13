'use client';
// File: hooks/useWallet.ts
import { useWalletContext } from '@/context/WalletContext';

export function useWallet() {
  return useWalletContext();
}
