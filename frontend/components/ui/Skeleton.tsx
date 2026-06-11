'use client';
// File: components/ui/Skeleton.tsx
import { cn } from '@/utils/cn';

interface SkeletonProps { className?: string; }

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />;
}

export function BookCardSkeleton() {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', padding: 0 }}>
      <Skeleton className="h-52 w-full rounded-none" />
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

export function ChapterSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
