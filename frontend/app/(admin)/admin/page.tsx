'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Shield, Users, BookOpen, AlertTriangle, Coins, 
  Trash2, Check, X, ShieldAlert, Award, UserCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCoins } from '@/utils/format';

interface AdminStats {
  totalUsers: number;
  totalAuthors: number;
  totalBooks: number;
  totalReports: number;
  totalCoinsDeposited: number;
}

interface AdminReport {
  id: number;
  userId: number;
  userName: string;
  targetType: string;
  targetId: number;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
}

interface AdminUser {
  id: number;
  phoneNumber: string;
  name: string;
  role: string;
  createdAt: string;
  balance: number;
}

interface AdminBook {
  id: number;
  authorId: number;
  authorName: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  status: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports' | 'books'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || (user && user.role !== 'Admin')) {
        router.push('/home');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchTabDetails = async (tab: typeof activeTab) => {
    if (!isAuthenticated || user?.role !== 'Admin') return;
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const data = await api.get<AdminStats>('/admin/stats');
        setStats(data);
      } else if (tab === 'users') {
        const data = await api.get<AdminUser[]>('/admin/users');
        setUsers(data);
      } else if (tab === 'reports') {
        const data = await api.get<AdminReport[]>('/admin/reports');
        setReports(data);
      } else if (tab === 'books') {
        // We can get all books using the standard books list endpoint for convenience
        const data = await api.get<AdminBook[]>('/book');
        setBooks(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'Admin') {
      fetchTabDetails(activeTab);
    }
  }, [activeTab, isAuthenticated, user]);

  const handleResolveReport = async (reportId: number, status: 'Resolved' | 'Dismissed') => {
    setActionLoading(reportId);
    try {
      await api.post(`/admin/reports/${reportId}/resolve`, { status });
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateRole = async (userId: number, currentRole: string) => {
    setActionLoading(userId);
    const newRole = currentRole === 'Author' ? 'Reader' : 'Author';
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!confirm('آیا از حذف این کتاب اطمینان دارید؟')) return;
    setActionLoading(bookId);
    try {
      await api.delete(`/admin/books/${bookId}`);
      setBooks(prev => prev.filter(b => b.id !== bookId));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!isAuthenticated || (user && user.role !== 'Admin')) {
    return null;
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ padding: 10, background: 'var(--accent-gold-glow)', border: '1px solid var(--accent-gold-dim)', borderRadius: 'var(--radius-md)' }}>
          <ShieldAlert size={24} style={{ color: 'var(--accent-gold)' }} />
        </div>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.6rem', marginBottom: 4 }}>
            <span className="text-gradient-gold">پنل مدیریت سیستم</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>خوش آمدید، {user?.name}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-default)', paddingBottom: 1, marginBottom: 28 }}>
        {[
          { id: 'dashboard', label: 'داشبورد', icon: <Shield size={16} /> },
          { id: 'users', label: 'کاربران', icon: <Users size={16} /> },
          { id: 'reports', label: 'گزارش‌ها', icon: <AlertTriangle size={16} /> },
          { id: 'books', label: 'کتاب‌ها', icon: <BookOpen size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              color: activeTab === tab.id ? 'var(--accent-gold)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-gold)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.95rem',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ minHeight: 400 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                  {[
                    { label: 'کل کاربران', value: stats.totalUsers, icon: <Users size={20} />, color: '#8B5CF6' },
                    { label: 'نویسندگان', value: stats.totalAuthors, icon: <Award size={20} />, color: '#10B981' },
                    { label: 'کتاب‌های منتشر شده', value: stats.totalBooks, icon: <BookOpen size={20} />, color: '#C9A84C' },
                    { label: 'گزارش‌های تخلف', value: stats.totalReports, icon: <AlertTriangle size={20} />, color: '#F43F5E' },
                    { label: 'کل تراکنش‌های واریزی', value: `${formatCoins(stats.totalCoinsDeposited)}`, icon: <Coins size={20} />, color: '#10B981', wide: true }
                  ].map((card, i) => (
                    <div key={i} style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '24px 20px',
                      gridColumn: card.wide ? 'span 2' : 'auto'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{card.label}</span>
                        <div style={{ color: card.color }}>{card.icon}</div>
                      </div>
                      <p style={{ fontSize: '1.8rem', fontWeight: 900, color: card.color }}>{card.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'users' && (
                <div style={{ overflowX: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
                        <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>شناسه</th>
                        <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>نام کاربر</th>
                        <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>شماره تماس</th>
                        <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>نقش</th>
                        <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>کیف پول</th>
                        <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{u.id}</td>
                          <td style={{ padding: '16px 20px', fontWeight: 700 }}>{u.name}</td>
                          <td style={{ padding: '16px 20px', direction: 'ltr' }}>{u.phoneNumber}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <Badge variant={u.role === 'Admin' ? 'rose' : u.role === 'Author' ? 'emerald' : 'default'}>
                              {u.role === 'Admin' ? 'مدیر' : u.role === 'Author' ? 'نویسنده' : 'خواننده'}
                            </Badge>
                          </td>
                          <td style={{ padding: '16px 20px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                            {formatCoins(u.balance)}
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            {u.role !== 'Admin' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleUpdateRole(u.id, u.role)}
                                disabled={actionLoading === u.id}
                              >
                                <UserCheck size={14} />
                                {u.role === 'Author' ? 'تغییر به خواننده' : 'ارتقا به نویسنده'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reports' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {reports.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                      <AlertTriangle size={36} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                      <p style={{ color: 'var(--text-secondary)' }}>گزارش تخلفی ثبت نشده است.</p>
                    </div>
                  ) : (
                    reports.map(r => (
                      <div key={r.id} style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Badge variant="rose">گزارش {r.targetType === 'Book' ? 'کتاب' : r.targetType === 'Chapter' ? 'فصل' : 'دیدگاه'}</Badge>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>شناسه هدف: {r.targetId}</span>
                          </div>
                          <Badge variant={r.status === 'Pending' ? 'default' : r.status === 'Resolved' ? 'emerald' : 'rose'}>
                            {r.status === 'Pending' ? 'در انتظار بررسی' : r.status === 'Resolved' ? 'حل شده' : 'رد شده'}
                          </Badge>
                        </div>
                        
                        <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>علت: {r.reason}</p>
                        {r.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>توضیحات: {r.description}</p>}
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 12, marginTop: 4 }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>گزارش‌دهنده: {r.userName}</span>
                          
                          {r.status === 'Pending' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                style={{ color: 'var(--accent-rose)' }}
                                onClick={() => handleResolveReport(r.id, 'Dismissed')}
                                disabled={actionLoading === r.id}
                              >
                                <X size={14} /> رد کردن
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleResolveReport(r.id, 'Resolved')}
                                disabled={actionLoading === r.id}
                              >
                                <Check size={14} /> تایید و حل‌وفصل
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'books' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {books.map(b => (
                    <div key={b.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: 16,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      <div style={{ width: 44, height: 60, borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', overflow: 'hidden', flexShrink: 0 }}>
                        {b.coverImage ? (
                          <img src={b.coverImage} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📖</div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{b.title}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>نویسنده: {b.authorName}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        style={{ color: 'var(--accent-rose)' }}
                        onClick={() => handleDeleteBook(b.id)}
                        disabled={actionLoading === b.id}
                      >
                        <Trash2 size={14} /> حذف کتاب
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
