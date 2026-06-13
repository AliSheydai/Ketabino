'use client';
// File: app/(reader)/books/[id]/page.tsx
import { use, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'next-view-transitions';
import { useRouter } from 'next/navigation';
import { Heart, Star, BookOpen, Lock, Unlock, MessageCircle, Send, Flag } from 'lucide-react';
import { useBook, useBookChapters, useBookReviews, useBookComments, useLike } from '@/hooks/useBook';
import { useReport } from '@/hooks/useReport';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton, ChapterSkeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { formatCoins, formatDate, formatRelativeTime } from '@/utils/format';

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const bookId = Number(id);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const { book, isLoading } = useBook(bookId);
  const { chapters, isLoading: chaptersLoading } = useBookChapters(bookId);
  const { reviews, submitReview } = useBookReviews(bookId);
  const { comments, submitComment } = useBookComments(bookId);
  const { liked, toggleLike } = useLike(bookId, book?.isLiked ?? false);
  const { submitReport, isReporting } = useReport();

  const [reviewModal, setReviewModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [commentText, setCommentText] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  async function handleSubmitReview() {
    if (!isAuthenticated) { router.push('/login'); return; }
    setSubmittingReview(true);
    try { await submitReview(rating, reviewTitle, reviewContent); setReviewModal(false); }
    catch { } finally { setSubmittingReview(false); }
  }

  async function handleSubmitComment() {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try { await submitComment(commentText); setCommentText(''); }
    catch { } finally { setSubmittingComment(false); }
  }

  async function handleReportBook() {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!reportReason.trim()) return;
    const success = await submitReport('Book', bookId, reportReason, reportDesc);
    if (success) {
      setReportModal(false);
      setReportReason('');
      setReportDesc('');
      alert('گزارش شما با موفقیت ثبت شد.');
    } else {
      alert('خطا در ثبت گزارش.');
    }
  }

  if (isLoading) return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--fixed-header-content-offset) 20px 40px' }}>
      <Skeleton className="h-64 w-full mb-6" />
      <Skeleton className="h-8 w-1/2 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );

  if (!book) return (
    <div style={{ textAlign: 'center', padding: 'var(--fixed-header-content-offset) 20px 80px', color: 'var(--text-muted)' }}>
      <p>کتاب یافت نشد.</p>
    </div>
  );

  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '—';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--fixed-header-content-offset) 20px 32px' }}>

      {/* Banner + Meta */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="book-details-grid" style={{ marginBottom: 40 }}>
        
        {/* Cover */}
        <div style={{ width: 160, height: 220, borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0, boxShadow: 'var(--shadow-card)' }}>
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>📖</div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 8 }}>{book.title}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
            نوشته <strong style={{ color: 'var(--accent-gold)' }}>{book.authorName}</strong>
          </p>

          <div className="badge-container" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {book.genres.map(g => <Badge key={g.id}>{g.name}</Badge>)}
          </div>

          <div className="stats-container" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 18, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={15} fill="var(--accent-gold)" stroke="none" />
              <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{avgRating}</span>
              ({reviews.length} نظر)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Heart size={15} />{book.likesCount} پسندیدن
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={15} />{book.chaptersCount} فصل
            </span>
          </div>

          {book.description && (
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20, fontSize: '0.9rem' }}>
              {book.description}
            </p>
          )}

          <div className="button-container" style={{ display: 'flex', gap: 10 }}>
            {isAuthenticated && (
              <Button variant={liked ? 'gold' : 'outline'} size="sm" onClick={toggleLike}>
                <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                {liked ? 'پسندیدم' : 'پسندیدن'}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setReviewModal(true)}>
              <Star size={14} />ثبت نظر
            </Button>
            <Button variant="outline" size="sm" onClick={() => setReportModal(true)} style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
              <Flag size={14} />گزارش
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Chapter List */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={18} style={{ color: 'var(--accent-gold)' }} />فهرست فصل‌ها
        </h2>
        {chaptersLoading ? <ChapterSkeleton /> : chapters.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'var(--bg-card)',
            border: '1px dashed var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-muted)',
            fontSize: '0.9rem'
          }}>
            <BookOpen size={24} style={{ marginBottom: 8, opacity: 0.5, display: 'inline-block' }} />
            <p>فعلا محتوای موجود نیست</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chapters.map((ch, i) => (
              <motion.div key={ch.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={`/books/${bookId}/chapters/${ch.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'border-color 0.2s, background 0.2s',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                  >
                    {/* Sequence */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: ch.isPurchased || ch.isFree ? 'var(--accent-gold-glow)' : 'var(--bg-elevated)',
                      border: `1px solid ${ch.isPurchased || ch.isFree ? 'var(--accent-gold-dim)' : 'var(--border-default)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.82rem', fontWeight: 700,
                      color: ch.isPurchased || ch.isFree ? 'var(--accent-gold)' : 'var(--text-muted)',
                    }}>
                      {ch.sequenceNumber}
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{ch.title}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>فصل {ch.sequenceNumber}</p>
                    </div>

                    {/* Lock / Price */}
                    {ch.isFree ? (
                      <Badge variant="emerald">رایگان</Badge>
                    ) : ch.isPurchased ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-gold)', fontSize: '0.82rem' }}>
                        <Unlock size={13} />خریداری شده
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        <Lock size={13} />{formatCoins(ch.price)}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={16} style={{ color: 'var(--accent-gold)' }} />نظرات ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>هنوز نظری ثبت نشده است.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <strong style={{ fontSize: '0.9rem' }}>{r.userName}</strong>
                  <span className="stars" style={{ fontSize: '0.85rem' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginRight: 'auto' }}>{formatRelativeTime(r.createdAt)}</span>
                </div>
                {r.title && <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{r.title}</p>}
                {r.content && <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>{r.content}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Comments */}
      <section>
        <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageCircle size={16} style={{ color: 'var(--accent-gold)' }} />دیدگاه‌ها ({comments.length})
        </h2>
        {isAuthenticated && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input
              value={commentText} onChange={e => setCommentText(e.target.value)}
              placeholder="دیدگاه خود را بنویسید…"
              style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', fontSize: '0.9rem' }}
            />
            <Button size="sm" isLoading={submittingComment} onClick={handleSubmitComment}>
              <Send size={14} />ارسال
            </Button>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {comments.map(c => (
            <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <strong style={{ fontSize: '0.88rem' }}>{c.userName}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginRight: 'auto' }}>{formatRelativeTime(c.createdAt)}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>{c.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Review Modal */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="ثبت نظر و امتیاز">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>امتیاز</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)}
                  style={{ fontSize: '1.4rem', background: 'none', border: 'none', cursor: 'pointer', color: s <= rating ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                  ★
                </button>
              ))}
            </div>
          </div>
          <input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} placeholder="عنوان نظر" style={inputStyle} />
          <textarea value={reviewContent} onChange={e => setReviewContent(e.target.value)} placeholder="متن کامل نظر…" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          <Button isLoading={submittingReview} onClick={handleSubmitReview}>ثبت نظر</Button>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={reportModal} onClose={() => setReportModal(false)} title="گزارش کتاب">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>در صورت مشاهده محتوای نامناسب، کپی‌رایت یا سایر تخلفات، می‌توانید این کتاب را گزارش دهید.</p>
          <input value={reportReason} onChange={e => setReportReason(e.target.value)} placeholder="علت تخلف (الزامی)" style={inputStyle} />
          <textarea value={reportDesc} onChange={e => setReportDesc(e.target.value)} placeholder="توضیحات بیشتر (اختیاری)…" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          <Button isLoading={isReporting} onClick={handleReportBook} style={{ background: 'var(--accent-rose)', color: '#fff', border: 'none' }}>ثبت تخلف</Button>
        </div>
      </Modal>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none',
};
