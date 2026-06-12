'use client';
// File: app/(reader)/home/page.tsx
import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { useBooks, useGenres } from '@/hooks/useBooks';
import { BookCard } from '@/components/shared/BookCard';
import { BookCardSkeleton } from '@/components/ui/Skeleton';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedGenre, setSelectedGenre] = useState<number | undefined>();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [inputValue, setInputValue] = useState(searchParams.get('search') || '');

  const { books, isLoading } = useBooks(selectedGenre, search);
  const { genres } = useGenres();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(inputValue);
  }

  const featured = books.slice(0, 3);
  const rest = books.slice(3);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px' }}>

      {/* Hero */}
      {!search && !selectedGenre && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 48 }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-gold-glow)', border: '1px solid var(--accent-gold-dim)', borderRadius: 99, padding: '5px 14px', marginBottom: 18 }}>
            {/* <Sparkles size={14} style={{ color: 'var(--accent-gold)' }} /> */}
            <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 600 }}>مدل پرداخت فصل به فصل</span>
          </motion.div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900, lineHeight: 1.3, marginBottom: 16 }}>
            <span className="text-gradient-gold">کتاب‌هایی</span> که{' '}
            <span style={{ color: 'var(--text-primary)' }}>فصل به فصل</span>
            <br />در دلت جا می‌گیرند
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto 28px' }}>
            فقط فصل‌هایی که می‌خوای بخر. بدون هزینه اضافه، بدون تعهد.
          </p>

          <form onSubmit={handleSearch} style={{ maxWidth: 500, margin: '0 auto', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', top: '50%', right: 16, transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="جستجو در بین صدها کتاب…" value={inputValue} onChange={e => setInputValue(e.target.value)}
              style={{ width: '100%', padding: '14px 50px 14px 60px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-default)'} />
            <button type="submit" style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', background: 'linear-gradient(135deg, #C9A84C, #8A6F2E)', border: 'none', borderRadius: 'var(--radius-md)', padding: '8px 14px', color: '#0A0A0F', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}>
              جستجو
            </button>
          </form>
        </motion.section>
      )}

      {/* Genre Chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        <button onClick={() => { setSelectedGenre(undefined); setSearch(''); setInputValue(''); }}
          style={{ padding: '7px 18px', borderRadius: 99, border: `1px solid ${!selectedGenre && !search ? 'var(--accent-gold)' : 'var(--border-default)'}`, background: !selectedGenre && !search ? 'var(--accent-gold-glow)' : 'var(--bg-elevated)', color: !selectedGenre && !search ? 'var(--accent-gold)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
          همه کتاب‌ها
        </button>
        {genres.map(g => (
          <button key={g.id} onClick={() => setSelectedGenre(g.id === selectedGenre ? undefined : g.id)}
            style={{ padding: '7px 18px', borderRadius: 99, border: `1px solid ${selectedGenre === g.id ? 'var(--accent-gold)' : 'var(--border-default)'}`, background: selectedGenre === g.id ? 'var(--accent-gold-glow)' : 'var(--bg-elevated)', color: selectedGenre === g.id ? 'var(--accent-gold)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
            {g.name}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
          {Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)}
        </div>
      ) : books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <p>هیچ کتابی یافت نشد</p>
        </div>
      ) : (
        <>
          {!search && !selectedGenre && featured.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <SectionTitle icon={<TrendingUp size={18} />} title="پرطرفدارترین‌ها" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {featured.map((book, i) => (
                  <motion.div key={book.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <BookCard book={book} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}
          <section>
            {!search && !selectedGenre && rest.length > 0 && <SectionTitle icon={<Clock size={18} />} title="جدیدترین کتاب‌ها" />}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
              {(search || selectedGenre ? books : rest).map((book, i) => (
                <motion.div key={book.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
      <span style={{ color: 'var(--accent-gold)' }}>{icon}</span>
      <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{title}</h2>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, maxWidth: 1280, margin: '32px auto', padding: '0 20px' }}>
        {Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)}
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
