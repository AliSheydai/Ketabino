'use client';
// File Path: app/(auth)/otp/page.tsx

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

type Step = 'otp' | 'register';

const OTP_LENGTH = 5;
const RESEND_SECONDS = 90;

export default function OtpPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<Step>('otp');
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Reader' | 'Author'>('Reader');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get phone from session
  useEffect(() => {
    const stored = sessionStorage.getItem('auth_phone');
    if (!stored) {
      router.replace('/login');
      return;
    }
    setPhone(stored);
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const otp = digits.join('');

  function handleDigitChange(index: number, value: string) {
    const v = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = v;
    setDigits(next);
    if (error) setError('');
    if (v && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (v && index === OTP_LENGTH - 1) {
      const fullOtp = [...digits.slice(0, OTP_LENGTH - 1), v].join('');
      if (fullOtp.length === OTP_LENGTH) {
        setTimeout(() => submitOtp(fullOtp), 120);
      }
    }
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
      }
    }
    if (e.key === 'ArrowLeft' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (e.key === 'ArrowRight' && index > 0) inputRefs.current[index - 1]?.focus();
  }

  function handleDigitPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === OTP_LENGTH) {
      setTimeout(() => submitOtp(pasted), 120);
    }
  }

  const submitOtp = useCallback(async (code: string) => {
    setIsLoading(true);
    setError('');
    try {
      await login(phone, code);
      setSuccess(true);
      setTimeout(() => {
        sessionStorage.removeItem('auth_phone');
        router.push('/home');
      }, 800);
    } catch (err: unknown) {
      const e = err as Error & { status?: number };
      if (e.status === 404) {
        setStep('register');
      } else {
        setError(e.message || 'کد وارد شده صحیح نیست');
        // shake all inputs
        inputRefs.current.forEach((inp) =>
          inp?.animate(
            [
              { transform: 'translateX(0)' },
              { transform: 'translateX(-6px)' },
              { transform: 'translateX(6px)' },
              { transform: 'translateX(-4px)' },
              { transform: 'translateX(0)' },
            ],
            { duration: 360, easing: 'ease-out' }
          )
        );
        setDigits(Array(OTP_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } finally {
      setIsLoading(false);
    }
  }, [phone, login, router]);

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < OTP_LENGTH) {
      setError('کد ۵ رقمی را کامل وارد کنید');
      return;
    }
    await submitOtp(otp);
  }

  async function handleResend() {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    try {
      // await api.post('/auth/send-otp', { phoneNumber: phone });
      await new Promise((r) => setTimeout(r, 500));
      setCountdown(RESEND_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(''));
      setError('');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError('خطا در ارسال مجدد کد');
    } finally {
      setIsResending(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('لطفاً نام خود را وارد کنید');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { phoneNumber: phone, name, role });
      await login(phone, otp);
      setSuccess(true);
      setTimeout(() => {
        sessionStorage.removeItem('auth_phone');
        router.push('/home');
      }, 800);
    } catch (err: unknown) {
      setError((err as Error).message || 'خطایی رخ داد');
    } finally {
      setIsLoading(false);
    }
  }

  const maskedPhone = phone
    ? phone.slice(0, 4) + '***' + phone.slice(-4)
    : '';

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full" style={{ maxWidth: 420, padding: '0 20px' }}>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', marginBottom: 36 }}
      >
        <motion.div
          whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #C9A84C 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(201,168,76,0.35)',
          }}
        >
          📚
        </motion.div>
        <h1 className="text-gradient-gold" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          کتابینو
        </h1>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="glass"
        style={{
          borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
          border: '1px solid rgba(201,168,76,0.12)',
        }}
      >
        {/* Step dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, justifyContent: 'center' }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={
                i === (step === 'otp' ? 1 : 2)
                  ? { width: 28, opacity: 1, background: 'var(--accent-gold)' }
                  : i < (step === 'otp' ? 1 : 2)
                  ? { width: 8, opacity: 0.6, background: 'var(--accent-gold)' }
                  : { width: 8, opacity: 0.25, background: 'var(--border-default)' }
              }
              style={{ height: 4, borderRadius: 2 }}
              transition={{ duration: 0.35 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* OTP Step */}
          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>
                کد تأیید
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 6, lineHeight: 1.7 }}>
                کد ۵ رقمی ارسال شده به{' '}
                <span
                  style={{
                    color: 'var(--accent-gold)',
                    fontFamily: 'monospace',
                    direction: 'ltr',
                    display: 'inline-block',
                    background: 'rgba(201,168,76,0.08)',
                    padding: '1px 6px',
                    borderRadius: 6,
                    fontSize: '0.82rem',
                  }}
                >
                  {maskedPhone}
                </span>{' '}
                را وارد کنید.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 28 }}>
                (برای تست از کد «12345» استفاده کنید)
              </p>

              <form onSubmit={handleOtpSubmit}>
                {/* OTP digit boxes */}
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    justifyContent: 'center',
                    direction: 'ltr',
                    marginBottom: 8,
                  }}
                  onPaste={handleDigitPaste}
                >
                  {digits.map((d, i) => (
                    <motion.div
                      key={i}
                      animate={
                        d
                          ? { scale: [1, 1.08, 1], borderColor: 'rgba(201,168,76,0.8)' }
                          : { scale: 1, borderColor: 'var(--border-default)' }
                      }
                      transition={{ duration: 0.2 }}
                      style={{ position: 'relative' }}
                    >
                      <input
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(i, e)}
                        disabled={isLoading || success}
                        style={{
                          width: 54,
                          height: 62,
                          borderRadius: 13,
                          border: `1.5px solid ${error ? 'rgba(239,68,68,0.5)' : d ? 'rgba(201,168,76,0.7)' : 'var(--border-default)'}`,
                          background: d ? 'rgba(201,168,76,0.08)' : 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontSize: '1.6rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          outline: 'none',
                          cursor: 'text',
                          transition: 'border-color 0.15s, background 0.15s',
                          fontFamily: 'monospace',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'rgba(201,168,76,0.9)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = d ? 'rgba(201,168,76,0.7)' : 'var(--border-default)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      {/* Filled dot indicator */}
                      {!d && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 14,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--border-default)',
                            opacity: 0.5,
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        color: 'var(--accent-rose)',
                        fontSize: '0.82rem',
                        textAlign: 'center',
                        marginBottom: 12,
                        marginTop: 8,
                      }}
                    >
                      ⚠️ {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={isLoading || success || otp.length < OTP_LENGTH}
                  whileHover={!isLoading && !success && otp.length === OTP_LENGTH ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  style={{
                    width: '100%',
                    padding: '14px',
                    marginTop: 16,
                    borderRadius: 13,
                    border: 'none',
                    background:
                      success
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : otp.length < OTP_LENGTH
                        ? 'rgba(201,168,76,0.3)'
                        : 'linear-gradient(135deg, #C9A84C 0%, #8A6F2E 100%)',
                    color: otp.length < OTP_LENGTH && !success ? 'rgba(201,168,76,0.6)' : '#0A0A0F',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: isLoading || success || otp.length < OTP_LENGTH ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: otp.length === OTP_LENGTH ? '0 4px 20px rgba(201,168,76,0.3)' : 'none',
                    transition: 'all 0.25s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <AnimatePresence mode="wait">
                    {success ? (
                      <motion.span
                        key="success"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        ✓ ورود موفق!
                      </motion.span>
                    ) : isLoading ? (
                      <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          style={{ display: 'inline-block' }}
                        >
                          ⟳
                        </motion.span>
                        در حال تأیید…
                      </motion.span>
                    ) : (
                      <motion.span key="idle">تأیید و ورود ←</motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>

              {/* Bottom row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 18,
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    padding: '4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  → ویرایش شماره
                </button>

                <motion.button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || isResending}
                  whileHover={countdown === 0 && !isResending ? { scale: 1.03 } : {}}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: countdown > 0 ? 'var(--text-muted)' : 'var(--accent-gold)',
                    fontSize: '0.82rem',
                    cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    padding: '4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'color 0.2s',
                  }}
                >
                  {isResending ? (
                    '⟳ در حال ارسال…'
                  ) : countdown > 0 ? (
                    <>
                      ارسال مجدد{' '}
                      <span
                        style={{
                          fontFamily: 'monospace',
                          background: 'rgba(201,168,76,0.1)',
                          padding: '1px 5px',
                          borderRadius: 4,
                          fontSize: '0.78rem',
                        }}
                      >
                        {formatCountdown(countdown)}
                      </span>
                    </>
                  ) : (
                    '↺ ارسال مجدد کد'
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Register Step */}
          {step === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  marginBottom: 16,
                }}
              >
                👋
              </div>
              <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>
                خوش آمدید!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24, lineHeight: 1.7 }}>
                به نظر می‌رسد اولین بار است. برای تکمیل ثبت‌نام، اطلاعات زیر را وارد کنید.
              </p>

              <form onSubmit={handleRegister}>
                {/* Name input */}
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <div
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '1rem',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                  >
                    👤
                  </div>
                  <input
                    type="text"
                    placeholder="نام و نام خانوادگی"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    style={{
                      width: '100%',
                      padding: '13px 44px 13px 14px',
                      borderRadius: 13,
                      border: '1.5px solid var(--border-default)',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(201,168,76,0.7)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-default)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Role selector */}
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: 10 }}>
                  نقش شما در کتابینو:
                </p>
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  {(['Reader', 'Author'] as const).map((r) => (
                    <motion.button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        flex: 1,
                        padding: '12px 8px',
                        borderRadius: 13,
                        border: `1.5px solid ${role === r ? 'rgba(201,168,76,0.7)' : 'var(--border-default)'}`,
                        background: role === r ? 'rgba(201,168,76,0.08)' : 'var(--bg-elevated)',
                        color: role === r ? 'var(--accent-gold)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        fontWeight: role === r ? 600 : 400,
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        boxShadow: role === r ? '0 2px 12px rgba(201,168,76,0.15)' : 'none',
                      }}
                    >
                      <span style={{ fontSize: '1.3rem' }}>{r === 'Reader' ? '📖' : '✍️'}</span>
                      <span>{r === 'Reader' ? 'خواننده' : 'نویسنده'}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                        {r === 'Reader' ? 'مطالعه و دریافت کتاب' : 'انتشار و فروش کتاب'}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        color: 'var(--accent-rose)',
                        fontSize: '0.82rem',
                        marginBottom: 12,
                      }}
                    >
                      ⚠️ {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={isLoading || success}
                  whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 8px 32px rgba(201,168,76,0.5)' } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 13,
                    border: 'none',
                    background: success
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : 'linear-gradient(135deg, #C9A84C 0%, #8A6F2E 100%)',
                    color: '#0A0A0F',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: isLoading || success ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <AnimatePresence mode="wait">
                    {success ? (
                      <motion.span key="s" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        ✓ ثبت‌نام موفق!
                      </motion.span>
                    ) : isLoading ? (
                      <motion.span key="l" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>⟳</motion.span>
                        در حال ثبت‌نام…
                      </motion.span>
                    ) : (
                      <motion.span key="i">ثبت‌نام و ورود ←</motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Back link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ textAlign: 'center', marginTop: 20 }}
      >
        <button
          onClick={() => router.push('/login')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          → بازگشت به صفحه ورود
        </button>
      </motion.div>
    </div>
  );
}