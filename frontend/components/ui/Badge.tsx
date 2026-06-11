'use client';
// File: components/ui/Badge.tsx
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'violet' | 'emerald' | 'rose' | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    gold: 'bg-[var(--accent-gold-glow)] text-[var(--accent-gold)] border border-[var(--accent-gold-dim)]',
    violet: 'bg-[var(--accent-violet-dim)] text-[var(--accent-violet)] border border-[var(--accent-violet)]',
    emerald: 'bg-[rgba(16,185,129,0.15)] text-[var(--accent-emerald)] border border-[var(--accent-emerald)]',
    rose: 'bg-[rgba(244,63,94,0.15)] text-[var(--accent-rose)] border border-[var(--accent-rose)]',
    default: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)]',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant], className
    )}>
      {children}
    </span>
  );
}
