'use client';
// File: components/shared/BookCard.tsx
import { Link } from 'next-view-transitions';
import { motion } from 'framer-motion';
import { Star, Heart, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { truncate, formatCoins } from '@/utils/format';
import type { Book } from '@/types';

interface BookCardProps { book: Book; }

export function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          cursor: 'pointer',
          height: '100%',
        }}
      >
        {/* Cover Image */}
        <div style={{ position: 'relative', height: 200, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-card))', fontSize: 48 }}>
              📖
            </div>
          )}
          {/* Rating overlay */}
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px 8px',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Star size={12} fill="#C9A84C" stroke="none" />
            <span style={{ color: '#C9A84C', fontSize: '0.78rem', fontWeight: 600 }}>
              {book.averageRating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }} className="line-clamp-2">
            {book.title}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{book.authorName}</p>
          {book.description && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }} className="line-clamp-2">
              {book.description}
            </p>
          )}

          {/* Genres */}
          {book.genres.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              {book.genres.slice(0, 2).map(g => (
                <Badge key={g.id} variant="default">{g.name}</Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              <Heart size={12} />{book.likesCount}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              <BookOpen size={12} />{book.chaptersCount} فصل
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
