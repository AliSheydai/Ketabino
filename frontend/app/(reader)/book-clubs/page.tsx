'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, MessageSquare, ArrowLeft, Send, BookOpen, LogOut, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/utils/format';

interface Book {
  id: number;
  title: string;
  coverImage?: string;
  authorName: string;
}

interface Club {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  bookTitle: string;
  bookCover?: string;
  memberCount: number;
  isMember: boolean;
}

interface ClubMessage {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  userName: string;
}

interface ClubMember {
  id: number;
  name: string;
  role: string;
}

interface ClubDetails {
  club: {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    creatorId: number;
    bookId: number;
    bookTitle: string;
    bookCover?: string;
  };
  members: ClubMember[];
  messages: ClubMessage[];
  isMember: boolean;
}

export default function BookClubsPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [clubDetails, setClubDetails] = useState<ClubDetails | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubDesc, setNewClubDesc] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string>('');

  // Chat
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchClubs();
    fetchBooks();
  }, []);

  useEffect(() => {
    if (clubDetails?.messages && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [clubDetails?.messages]);

  // Poll for messages in active club
  useEffect(() => {
    if (!selectedClubId) return;
    const interval = setInterval(() => {
      refreshMessages();
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedClubId]);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchClubs() {
    try {
      setLoading(true);
      const data = await api.get<Club[]>('/bookclub');
      setClubs(data);
    } catch {
      showToast('خطا در دریافت لیست حلقه‌ها', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchBooks() {
    try {
      const data = await api.get<Book[]>('/book');
      setBooks(data);
    } catch {
      // ignore
    }
  }

  async function fetchClubDetails(clubId: number) {
    try {
      setDetailsLoading(true);
      const data = await api.get<ClubDetails>(`/bookclub/${clubId}`);
      setClubDetails(data);
      setSelectedClubId(clubId);
    } catch {
      showToast('خطا در دریافت جزئیات حلقه', 'error');
    } finally {
      setDetailsLoading(false);
    }
  }

  async function refreshMessages() {
    if (!selectedClubId) return;
    try {
      const data = await api.get<ClubDetails>(`/bookclub/${selectedClubId}`);
      setClubDetails(prev => {
        if (!prev) return data;
        return {
          ...prev,
          messages: data.messages,
          members: data.members
        };
      });
    } catch {
      // ignore
    }
  }

  async function handleJoin(id: number) {
    try {
      setActionLoading(id);
      const res = await api.post<{ message: string }>(`/bookclub/${id}/join`, {});
      showToast(res.message, 'success');
      await fetchClubs();
      if (selectedClubId === id) {
        await fetchClubDetails(id);
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در عضویت', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLeave(id: number) {
    try {
      setActionLoading(id);
      const res = await api.post<{ message: string }>(`/bookclub/${id}/leave`, {});
      showToast(res.message, 'success');
      setSelectedClubId(null);
      setClubDetails(null);
      await fetchClubs();
    } catch (err: any) {
      showToast(err.message || 'خطا در خروج از گروه', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreateClub(e: React.FormEvent) {
    e.preventDefault();
    if (!newClubName.trim() || !selectedBookId) {
      showToast('لطفا اطلاعات را کامل وارد کنید', 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await api.post<{ message: string; clubId: number }>('/bookclub', {
        name: newClubName,
        description: newClubDesc,
        bookId: parseInt(selectedBookId)
      });
      showToast(res.message, 'success');
      setShowCreateModal(false);
      setNewClubName('');
      setNewClubDesc('');
      setSelectedBookId('');
      await fetchClubs();
      await fetchClubDetails(res.clubId);
    } catch (err: any) {
      showToast(err.message || 'خطا در ایجاد حلقه', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClubId || sendingMsg) return;
    try {
      setSendingMsg(true);
      await api.post(`/bookclub/${selectedClubId}/message`, { content: newMessage });
      setNewMessage('');
      await refreshMessages();
    } catch {
      showToast('خطا در ارسال پیام', 'error');
    } finally {
      setSendingMsg(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '110px auto 40px', padding: '0 20px', direction: 'rtl' }}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: 24,
              left: 24,
              zIndex: 999,
              background: toast.type === 'success' ? 'var(--accent-emerald-glow)' : 'var(--accent-rose-glow)',
              border: `1.5px solid ${toast.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '12px 24px',
              color: toast.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
              fontWeight: 600,
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.92rem'
            }}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedClubId ? (
        <>
          {/* Header section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={28} style={{ color: 'var(--accent-gold)' }} />
                <h1 style={{ fontSize: '1.75rem', fontWeight: 850 }} className="text-gradient-gold">حلقه‌های کتابخوانی</h1>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                گروه تشکیل دهید، با دیگران همخوانی کنید و دیدگاه‌های خود را به اشتراک بگذارید.
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} /> ایجاد حلقه جدید
            </Button>
          </div>

          {/* List of Clubs */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 32, height: 32, border: '3px solid var(--border-default)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%' }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {clubs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                  <Users size={36} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                  <p style={{ color: 'var(--text-secondary)' }}>هنوز هیچ حلقه کتابخوانی تشکیل نشده است. اولین حلقه را شما بسازید!</p>
                </div>
              ) : (
                clubs.map(c => (
                  <div key={c.id} style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                  }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 style={{ fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>{c.name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                          تعداد اعضا: {c.memberCount} نفر • ایجاد شده در {new Date(c.createdAt).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                      <Badge variant={c.isMember ? 'emerald' : 'default'}>
                        {c.isMember ? 'عضو گروه' : 'عدم عضویت'}
                      </Badge>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>{c.description}</p>

                    {/* Book detail bar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px'
                    }}>
                      <BookOpen size={16} style={{ color: 'var(--accent-gold)' }} />
                      <div style={{ flex: 1, fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>کتاب در حال خوانش: </span>
                        <span style={{ fontWeight: 700 }}>{c.bookTitle}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      {c.isMember ? (
                        <Button onClick={() => fetchClubDetails(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="w-full sm:w-auto">
                          <MessageSquare size={14} /> ورود به اتاق گفتگو
                        </Button>
                      ) : (
                        <Button onClick={() => handleJoin(c.id)} disabled={actionLoading === c.id} className="w-full sm:w-auto">
                          {actionLoading === c.id ? 'در حال عضویت…' : 'عضویت در حلقه'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      ) : (
        /* Chat View / Club Details */
        <div>
          {detailsLoading || !clubDetails ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 32, height: 32, border: '3px solid var(--border-default)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%' }}
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
              
              {/* Main Chat Board */}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                height: 520,
                overflow: 'hidden'
              }}>
                {/* Chat Header */}
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border-default)',
                  background: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={() => { setSelectedClubId(null); setClubDetails(null); fetchClubs(); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <h2 style={{ fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>{clubDetails.club.name}</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>کتاب: {clubDetails.club.bookTitle}</p>
                    </div>
                  </div>

                  {clubDetails.club.creatorId !== user?.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      style={{ color: 'var(--accent-rose)' }}
                      onClick={() => handleLeave(clubDetails.club.id)}
                      disabled={actionLoading === clubDetails.club.id}
                    >
                      <LogOut size={14} /> ترک گروه
                    </Button>
                  )}
                </div>

                {/* Messages Body */}
                <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {clubDetails.messages.length === 0 ? (
                    <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <Sparkles size={24} style={{ color: 'var(--accent-gold)', margin: '0 auto 8px', opacity: 0.6 }} />
                      پیامی در این حلقه ارسال نشده است. آغازگر گفتگو باشید!
                    </div>
                  ) : (
                    clubDetails.messages.map(m => {
                      const isMe = m.userId === user?.id;
                      return (
                        <div key={m.id} style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-start' : 'flex-end',
                          alignSelf: isMe ? 'flex-start' : 'flex-end',
                          maxWidth: '75%'
                        }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 3, padding: '0 4px' }}>
                            {m.userName} • {formatRelativeTime(m.createdAt)}
                          </span>
                          <div style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            background: isMe ? 'var(--accent-gold-glow)' : 'var(--bg-elevated)',
                            border: isMe ? '1px solid var(--accent-gold-dim)' : '1px solid var(--border-subtle)',
                            color: isMe ? 'var(--accent-gold)' : 'var(--text-primary)',
                            fontSize: '0.88rem',
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                            borderBottomRightRadius: isMe ? 2 : 'var(--radius-md)',
                            borderBottomLeftRadius: isMe ? 'var(--radius-md)' : 2
                          }}>
                            {m.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input area */}
                <form onSubmit={handleSendMessage} style={{
                  padding: 16,
                  borderTop: '1px solid var(--border-default)',
                  background: 'var(--bg-elevated)',
                  display: 'flex',
                  gap: 8
                }}>
                  <input
                    type="text"
                    placeholder="پیام خود را بنویسید…"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                  <Button type="submit" disabled={sendingMsg || !newMessage.trim()} style={{ padding: '0 16px' }}>
                    <Send size={16} />
                  </Button>
                </form>
              </div>

              {/* Sidebar: Details & Members */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Book Circle Info Card */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                  <h3 style={{ fontWeight: 800, fontSize: '0.95rem', margin: '0 0 10px' }}>درباره حلقه</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                    {clubDetails.club.description || 'توضیحاتی برای این حلقه ثبت نشده است.'}
                  </p>
                </div>

                {/* Members List Card */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 330,
                  overflowY: 'auto'
                }}>
                  <h3 style={{ fontWeight: 800, fontSize: '0.95rem', margin: '0 0 12px' }}>اعضا ({clubDetails.members.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {clubDetails.members.map(m => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: m.role === 'Admin' ? 'var(--accent-rose-glow)' : m.role === 'Author' ? 'var(--accent-emerald-glow)' : 'var(--bg-elevated)',
                          border: `1px solid ${m.role === 'Admin' ? 'var(--accent-rose)' : m.role === 'Author' ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                          color: m.role === 'Admin' ? 'var(--accent-rose)' : m.role === 'Author' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.75rem'
                        }}>
                          {m.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600 }}>{m.name}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {m.role === 'Admin' ? 'مدیر' : m.role === 'Author' ? 'نویسنده' : 'خواننده'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Create New Club Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: 480,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }} className="text-gradient-gold">ایجاد حلقه کتابخوانی جدید</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <ArrowLeft size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateClub} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Club Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>نام حلقه</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: همخوانی بوف کور صادق هدایت"
                  value={newClubName}
                  onChange={e => setNewClubName(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Club Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>توضیحات حلقه</label>
                <textarea
                  placeholder="درباره این گروه، قوانین همخوانی و فواصل مطالعاتی بنویسید…"
                  value={newClubDesc}
                  onChange={e => setNewClubDesc(e.target.value)}
                  rows={3}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Book Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>انتخاب کتاب برای همخوانی</label>
                <select
                  required
                  value={selectedBookId}
                  onChange={e => setSelectedBookId(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  <option value="">-- یک کتاب انتخاب کنید --</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.title} (نویسنده: {b.authorName})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>
                  انصراف
                </Button>
                <Button type="submit" style={{ flex: 1 }}>
                  ایجاد حلقه و شروع
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
