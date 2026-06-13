'use client';
// File: app/(reader)/profile/page.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Wallet, TrendingUp, Clock, CreditCard, BookmarkIcon, Star, BookOpen, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { useSubscription } from '@/hooks/useSubscription';
import { useMyLibrary } from '@/hooks/useBooks';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCoins, formatPrice, formatDate, formatRelativeTime } from '@/utils/format';
import { Link } from 'next-view-transitions';

type Tab = 'library' | 'wallet' | 'transactions' | 'subscriptions';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { wallet, transactions, packages, isLoading, buyCoins } = useWallet();
  const { plans, active, purchasePlan } = useSubscription();
  const { books: libraryBooks, isLoading: isLoadingLibrary } = useMyLibrary();

  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tab');
      if (t === 'library' || t === 'wallet' || t === 'transactions' || t === 'subscriptions') return t as Tab;
    }
    return 'library';
  });
  const [buyModal, setBuyModal] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<number | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [subModal, setSubModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [isPurchasingSub, setIsPurchasingSub] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  async function handleBuyCoins() {
    if (!selectedPkg) return;
    setIsBuying(true); setBuyError('');
    try { await buyCoins(selectedPkg); setBuyModal(false); }
    catch (e: unknown) { setBuyError((e as Error).message); }
    finally { setIsBuying(false); }
  }

  async function handlePurchaseSub() {
    if (!selectedPlan) return;
    setIsPurchasingSub(true);
    try { await purchasePlan(selectedPlan); setSubModal(false); }
    catch { } finally { setIsPurchasingSub(false); }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--fixed-header-content-offset) 20px 40px'}}>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center gap-5 mb-9 p-6 sm:p-7 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-xl)] text-center sm:text-right">
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
          👤
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <h1 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: 4 }}>{user?.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{user?.phoneNumber}</p>
          <Badge variant={user?.role === 'Author' ? 'violet' : 'default'} className="mt-1">
            {user?.role === 'Author' ? '✍️ نویسنده' : '📖 خواننده'}
          </Badge>
        </div>
        {wallet && (
          <div className="w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-dashed border-[var(--border-default)] sm:border-0 sm:mr-auto text-center sm:text-left">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 4 }}>موجودی کیف پول</p>
            <p className="text-gradient-gold" style={{ fontSize: '1.6rem', fontWeight: 900 }}>{formatCoins(wallet.balance)}</p>
          </div>
        )}
      </motion.div>

      <div style={{
        display: 'flex',
        gap: 4,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 4,
        marginBottom: 28,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }} className="no-scrollbar">
        {([['library', <BookOpen size={15} />, 'کتابخانه'], ['wallet', <Wallet size={15} />, 'کیف پول'], ['transactions', <Clock size={15} />, 'تراکنش‌ها'], ['subscriptions', <Star size={15} />, 'اشتراک']] as const).map(([key, icon, label]) => (
          <button key={key} onClick={() => setTab(key as Tab)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '9px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              background: tab === key ? 'var(--bg-elevated)' : 'transparent',
              color: tab === key ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: tab === key ? 600 : 400,
            }}>{icon}{label}
          </button>
        ))}
      </div>

      {/* Tab: Library */}
      {tab === 'library' && (
        <div>
          {isLoadingLibrary ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
            </div>
          ) : libraryBooks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border-default)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-muted)' }}>
                <BookOpen size={28} />
              </div>
              <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>کتابخانه‌ی شما خالی است!</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>شما هنوز هیچ کتابی را به کتابخانه‌ی خود اضافه نکرده‌اید.</p>
              <Button onClick={() => router.push('/home')}>کاوش کتاب‌ها</Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {libraryBooks.map(book => (
                <Link key={book.id} href={`/books/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <motion.div whileHover={{ y: -5 }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', paddingTop: '140%', background: 'var(--bg-elevated)' }}>
                      {book.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={book.coverImage} alt={book.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>بدون تصویر</div>
                      )}
                      {book.status !== 'Published' && (
                        <div style={{ position: 'absolute', top: 8, right: 8 }}>
                          <Badge variant="violet">در حال انتشار</Badge>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '14px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 12 }}>{book.authorName}</p>
                      
                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <span>مشاهده</span>
                        <ChevronLeft size={14} />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Wallet */}
      {tab === 'wallet' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <Button onClick={() => setBuyModal(true)}>
              <CreditCard size={15} />خرید سکه
            </Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {packages.map(pkg => (
              <motion.div key={pkg.id} whileHover={{ y: -3 }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '20px 18px', cursor: 'pointer', textAlign: 'center' }}
                onClick={() => { setSelectedPkg(pkg.id); setBuyModal(true); }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🪙</div>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-gold)' }}>{formatCoins(pkg.coins)}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>{pkg.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 6 }}>{formatPrice(pkg.price)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Transactions */}
      {tab === 'transactions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {isLoading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />) :
            transactions.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>هیچ تراکنشی یافت نشد</p> :
            transactions.map(tx => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: tx.amount > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)', fontSize: 16, flexShrink: 0 }}>
                  {tx.amount > 0 ? '⬆' : '⬇'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tx.description || tx.type}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{formatRelativeTime(tx.createdAt)}</p>
                </div>
                <span style={{ fontWeight: 700, color: tx.amount > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontSize: '0.95rem' }}>
                  {tx.amount > 0 ? '+' : ''}{formatCoins(Math.abs(tx.amount))}
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Tab: Subscription */}
      {tab === 'subscriptions' && (
        <div>
          {active && (
            <div style={{ background: 'var(--accent-gold-glow)', border: '1px solid var(--accent-gold-dim)', borderRadius: 'var(--radius-lg)', padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Star size={20} fill="var(--accent-gold)" stroke="none" />
              <div>
                <p style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>اشتراک فعال: {active.planName}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>تا {formatDate(active.endDate)}</p>
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {plans.map(plan => (
              <motion.div key={plan.id} whileHover={{ y: -4 }} style={{ background: 'var(--bg-card)', border: `1px solid ${selectedPlan === plan.id ? 'var(--accent-gold)' : 'var(--border-default)'}`, borderRadius: 'var(--radius-lg)', padding: '22px 20px', cursor: 'pointer' }}
                onClick={() => { setSelectedPlan(plan.id); setSubModal(true); }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <p style={{ fontWeight: 700, fontSize: '1rem' }}>{plan.name}</p>
                  <Badge variant="gold">{plan.durationDays} روز</Badge>
                </div>
                {plan.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.7, marginBottom: 14 }}>{plan.description}</p>}
                <p style={{ color: 'var(--accent-gold)', fontWeight: 900, fontSize: '1.2rem' }}>{formatCoins(plan.price)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Buy Coins Modal */}
      <Modal isOpen={buyModal} onClose={() => setBuyModal(false)} title="خرید سکه">
        {selectedPkg && (() => {
          const pkg = packages.find(p => p.id === selectedPkg);
          return pkg ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🪙</div>
              <p style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--accent-gold)' }}>{formatCoins(pkg.coins)}</p>
              <p style={{ color: 'var(--text-secondary)', margin: '8px 0' }}>{pkg.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>مبلغ پرداختی: {formatPrice(pkg.price)}</p>
              {buyError && <p style={{ color: 'var(--accent-rose)', marginBottom: 12, fontSize: '0.85rem' }}>{buyError}</p>}
              <Button isLoading={isBuying} onClick={handleBuyCoins} size="lg">تأیید خرید</Button>
            </div>
          ) : null;
        })()}
      </Modal>

      {/* Subscribe Modal */}
      <Modal isOpen={subModal} onClose={() => setSubModal(false)} title="خرید اشتراک">
        {selectedPlan && (() => {
          const plan = plans.find(p => p.id === selectedPlan);
          return plan ? (
            <div style={{ textAlign: 'center' }}>
              <Star size={44} fill="var(--accent-gold)" stroke="none" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>{plan.name}</p>
              <p style={{ color: 'var(--accent-gold)', fontSize: '1.4rem', fontWeight: 900, margin: '12px 0' }}>{formatCoins(plan.price)}</p>
              {plan.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 20 }}>{plan.description}</p>}
              <Button isLoading={isPurchasingSub} onClick={handlePurchaseSub} size="lg">خرید اشتراک</Button>
            </div>
          ) : null;
        })()}
      </Modal>
    </div>
  );
}
