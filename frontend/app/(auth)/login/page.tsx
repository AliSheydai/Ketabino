'use client';
// File Path: app/(auth)/login/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from 'next-view-transitions';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { Metadata } from 'next';

type Step = 'phone' | 'otp' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Reader' | 'Author'>('Reader');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || phone.length < 10) {
      setError('شماره موبایل معتبر وارد کنید');
      return;
    }
    setError('');
    setStep('otp');
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(phone, otp);
      router.push('/home');
    } catch (err: unknown) {
      const e = err as Error & { status?: number };
      if (e.status === 404) {
        // User doesn't exist — go to register
        setStep('register');
      } else {
        setError(e.message || 'خطایی رخ داد');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('نام الزامی است');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { phoneNumber: phone, name, role });
      // Now login
      await login(phone, otp);
      router.push('/home');
    } catch (err: unknown) {
      setError((err as Error).message || 'خطایی رخ داد');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md px-4">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #C9A84C, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto 16px',
            boxShadow: 'var(--shadow-glow-gold)',
          }}
        >
          📚
        </div>
        <h1 className="text-gradient-gold" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
          کتابینو
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: '0.9rem' }}>
          ورود به دنیای کتاب‌های دیجیتال
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass"
        style={{
          borderRadius: 'var(--radius-xl)',
          padding: '32px 28px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <AnimatePresence mode="wait">
          {/* STEP: Phone */}
          {step === 'phone' && (
            <motion.form
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handlePhoneSubmit}
            >
              <h2 style={{ fontWeight: 600, marginBottom: 6, fontSize: '1.1rem' }}>
                شماره موبایل
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                شماره موبایل خود را وارد کنید
              </p>
              <input
                type="tel"
                dir="ltr"
                placeholder="09xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  textAlign: 'center',
                  letterSpacing: 2,
                  outline: 'none',
                  marginBottom: 20,
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
              />
              {error && (
                <p style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', marginBottom: 12 }}>
                  {error}
                </p>
              )}
              <button type="submit" style={btnStyle}>
                دریافت کد تأیید
              </button>
            </motion.form>
          )}

          {/* STEP: OTP */}
          {step === 'otp' && (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleOtpSubmit}
            >
              <h2 style={{ fontWeight: 600, marginBottom: 6, fontSize: '1.1rem' }}>
                کد تأیید
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                کد ارسالی به{' '}
                <span style={{ color: 'var(--accent-gold)', direction: 'ltr', display: 'inline-block' }}>
                  {phone}
                </span>{' '}
                را وارد کنید
                <br />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  (برای تست از کد «12345» استفاده کنید)
                </span>
              </p>
              <input
                type="text"
                dir="ltr"
                placeholder="12345"
                value={otp}
                maxLength={6}
                onChange={(e) => setOtp(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '1.4rem',
                  textAlign: 'center',
                  letterSpacing: 8,
                  outline: 'none',
                  marginBottom: 20,
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
              />
              {error && (
                <p style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', marginBottom: 12 }}>
                  {error}
                </p>
              )}
              <button type="submit" disabled={isLoading} style={btnStyle}>
                {isLoading ? 'در حال ورود…' : 'ورود'}
              </button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                style={btnGhostStyle}
              >
                ویرایش شماره
              </button>
            </motion.form>
          )}

          {/* STEP: Register */}
          {step === 'register' && (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRegister}
            >
              <h2 style={{ fontWeight: 600, marginBottom: 6, fontSize: '1.1rem' }}>
                ثبت‌نام
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                حساب کاربری ندارید. اطلاعات خود را تکمیل کنید.
              </p>
              <input
                type="text"
                placeholder="نام و نام خانوادگی"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ ...inputStyle, marginBottom: 14 }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
              />
              {/* Role selector */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {(['Reader', 'Author'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${role === r ? 'var(--accent-gold)' : 'var(--border-default)'}`,
                      background: role === r ? 'var(--accent-gold-glow)' : 'var(--bg-elevated)',
                      color: role === r ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    {r === 'Reader' ? '📖 خواننده' : '✍️ نویسنده'}
                  </button>
                ))}
              </div>
              {error && (
                <p style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', marginBottom: 12 }}>
                  {error}
                </p>
              )}
              <button type="submit" disabled={isLoading} style={btnStyle}>
                {isLoading ? 'در حال ثبت‌نام…' : 'ثبت‌نام و ورود'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── Inline Styles ─────────────────────────────────────────────────────────────
const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  background: 'linear-gradient(135deg, #C9A84C, #8A6F2E)',
  color: '#0A0A0F',
  fontWeight: 700,
  fontSize: '1rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
  transition: 'opacity 0.2s',
  marginBottom: 10,
};

const btnGhostStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-default)',
  background: 'transparent',
  color: 'var(--text-secondary)',
  fontSize: '0.9rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-default)',
  background: 'var(--bg-elevated)',
  color: 'var(--text-primary)',
  fontSize: '1rem',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};
