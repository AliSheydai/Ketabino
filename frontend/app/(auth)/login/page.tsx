'use client';
// File Path: app/(auth)/login/page.tsx

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Auto-focus on mount with slight delay for animation
    const t = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (!clean || clean.length < 10) {
      setError('شماره موبایل معتبر وارد کنید');
      // Shake animation via ref
      inputRef.current?.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-8px)' },
          { transform: 'translateX(8px)' },
          { transform: 'translateX(-6px)' },
          { transform: 'translateX(6px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 400, easing: 'ease-out' }
      );
      return;
    }
    setError('');
    setIsLoading(true);

    // Simulate sending OTP (replace with real API call)
    try {
      // await api.post('/auth/send-otp', { phoneNumber: clean });
      await new Promise((r) => setTimeout(r, 600)); // mock delay
      // Store phone in sessionStorage to pass to OTP page
      sessionStorage.setItem('auth_phone', clean);
      router.push('/otp');
    } catch {
      setError('ارسال کد با خطا مواجه شد. دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setPhone(val);
    if (error) setError('');
  }

  const isValid = phone.replace(/\D/g, '').length >= 10;

  return (
    <div className="w-full" style={{ maxWidth: 420, padding: '0 20px' }}>
      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, y: -32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', marginBottom: 40 }}
      >
        <motion.div
          whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
          transition={{ duration: 0.5 }}
          style={{
            width: 72,
            height: 72,
            borderRadius: '22px',
            background: 'linear-gradient(135deg, #C9A84C 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            margin: '0 auto 20px',
            boxShadow: '0 8px 32px rgba(201,168,76,0.4), 0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          📚
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gradient-gold"
          style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}
        >
          کتابینو
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}
        >
          دروازهٔ دنیای کتاب‌های دیجیتال
        </motion.p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="glass"
        style={{
          borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
          border: '1px solid rgba(201,168,76,0.12)',
        }}
      >
        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, justifyContent: 'center' }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={i === 0 ? { width: 28, opacity: 1, background: 'var(--accent-gold)' } : { width: 8, opacity: 0.3, background: 'var(--border-default)' }}
              style={{ height: 4, borderRadius: 2 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <h2
            style={{
              fontWeight: 700,
              fontSize: '1.25rem',
              marginBottom: 8,
              color: 'var(--text-primary)',
            }}
          >
            ورود به حساب کاربری
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 28, lineHeight: 1.6 }}>
            شماره موبایل خود را وارد کنید تا کد تأیید برایتان ارسال شود.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Phone input */}
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <motion.div
                animate={isFocused ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  inset: -1,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.5), rgba(139,92,246,0.3))',
                  zIndex: 0,
                  filter: 'blur(1px)',
                }}
              />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '1.1rem',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                >
                  📱
                </div>
                <input
                  ref={inputRef}
                  type="tel"
                  dir="ltr"
                  inputMode="numeric"
                  placeholder="09xxxxxxxxx"
                  value={phone}
                  onChange={handlePhoneChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={{
                    width: '100%',
                    padding: '15px 48px 15px 16px',
                    borderRadius: 13,
                    border: `1.5px solid ${error ? 'var(--accent-rose)' : isFocused ? 'rgba(201,168,76,0.6)' : 'var(--border-default)'}`,
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: '1.15rem',
                    textAlign: 'center',
                    letterSpacing: 3,
                    outline: 'none',
                    transition: 'border-color 0.2s, background 0.2s',
                    fontFamily: 'monospace, inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Error */}
            <motion.div
              initial={false}
              animate={error ? { opacity: 1, height: 'auto', marginBottom: 16 } : { opacity: 0, height: 0, marginBottom: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <p
                style={{
                  color: 'var(--accent-rose)',
                  fontSize: '0.82rem',
                  paddingTop: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>⚠️</span> {error}
              </p>
            </motion.div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 8px 32px rgba(201,168,76,0.5)' } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              style={{
                width: '100%',
                padding: '14px',
                marginTop: 20,
                borderRadius: 13,
                border: 'none',
                background: isLoading
                  ? 'linear-gradient(135deg, #9a7d3a, #6a4f20)'
                  : 'linear-gradient(135deg, #C9A84C 0%, #8A6F2E 100%)',
                color: '#0A0A0F',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {isLoading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'inline-block', fontSize: '0.9rem' }}
                  >
                    ⟳
                  </motion.span>
                  در حال ارسال کد…
                </>
              ) : (
                <>
                  دریافت کد تأیید
                  <span style={{ fontSize: '0.9rem' }}>←</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
          marginTop: 24,
          lineHeight: 1.7,
        }}
      >
        با ورود، <span style={{ color: 'var(--accent-gold)' }}>قوانین و مقررات</span> کتابینو را می‌پذیرید.
      </motion.p>
    </div>
  );
}