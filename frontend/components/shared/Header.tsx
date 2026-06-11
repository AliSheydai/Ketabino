'use client';
// File: components/shared/Header.tsx
import { useState } from 'react';
import { Link } from 'next-view-transitions';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, Wallet, User, LogOut, BookOpen, LayoutDashboard, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { formatCoins } from '@/utils/format';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { wallet } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/home?search=${encodeURIComponent(searchQuery)}`);
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-default)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
        
        {/* Logo */}
        <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            📚
          </div>
          <span className="text-gradient-gold" style={{ fontWeight: 700, fontSize: '1.1rem' }}>کتابینو</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 420 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="search"
              placeholder="جستجوی کتاب یا نویسنده…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '9px 40px 9px 14px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </form>

        <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {isAuthenticated ? (
            <>
              {/* Wallet balance pill */}
              {wallet && (
                <Link href="/profile" style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--accent-gold-glow)',
                    border: '1px solid var(--accent-gold-dim)',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 12px',
                    cursor: 'pointer',
                  }}>
                    <Wallet size={14} style={{ color: 'var(--accent-gold)' }} />
                    <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 600 }}>
                      {formatCoins(wallet.balance)}
                    </span>
                  </div>
                </Link>
              )}

              {/* User dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '7px 14px',
                    cursor: 'pointer', color: 'var(--text-primary)',
                    fontFamily: 'inherit', fontSize: '0.9rem',
                  }}
                >
                  <User size={15} />
                  <span>{user?.name}</span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      style={{
                        position: 'absolute', top: '100%', left: 0, marginTop: 8,
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        padding: 8, minWidth: 180,
                        boxShadow: 'var(--shadow-card)',
                        zIndex: 200,
                      }}
                    >
                      {[
                        { icon: <BookOpen size={15} />, label: 'کتابخانه من', href: '/profile' },
                        ...(user?.role === 'Author' ? [{ icon: <LayoutDashboard size={15} />, label: 'استودیوی نویسنده', href: '/author' }] : []),
                        ...(user?.role === 'Admin' ? [{ icon: <LayoutDashboard size={15} />, label: 'پنل مدیریت', href: '/admin' }] : []),
                      ].map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          {item.icon}{item.label}
                        </Link>
                      ))}
                      <div style={{ margin: '6px 0', borderTop: '1px solid var(--border-subtle)' }} />
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); router.push('/login'); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 'var(--radius-sm)', color: 'var(--accent-rose)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit', fontSize: '0.9rem' }}
                      >
                        <LogOut size={15} />خروج
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link href="/login" style={{
              padding: '8px 18px', background: 'linear-gradient(135deg, #C9A84C, #8A6F2E)',
              borderRadius: 'var(--radius-md)', color: '#0A0A0F', fontWeight: 700,
              textDecoration: 'none', fontSize: '0.9rem',
            }}>
              ورود
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
