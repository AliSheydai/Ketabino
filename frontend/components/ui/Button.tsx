'use client';
// File: components/ui/Button.tsx
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'gold', size = 'md', isLoading, children, className, disabled, ...rest
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-[Vazirmatn]';

  const variants = {
    gold: 'bg-gradient-to-l from-[var(--accent-gold-dim)] to-[var(--accent-gold)] text-[#0A0A0F] shadow-[0_4px_20px_rgba(201,168,76,0.35)] hover:shadow-[0_6px_28px_rgba(201,168,76,0.5)] hover:scale-[1.02]',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
    outline: 'bg-transparent border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]',
    danger: 'bg-[var(--accent-rose)] text-white hover:opacity-90',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      style={{ transform: 'scale(1)', transition: 'transform 0.1s' }}
      onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      {...rest}
    >
      {isLoading ? (
        <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      ) : children}
    </button>
  );
}
