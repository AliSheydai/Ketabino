'use client';

import { motion } from 'framer-motion';
import { Link } from 'next-view-transitions';
import { Home, BookOpen, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #151522 0%, #0A0A0F 100%)',
        padding: '20px',
        color: 'var(--text-primary)',
        fontFamily: 'Vazirmatn, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: '48px 32px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Animated Icon Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'var(--accent-gold-glow)',
            border: '2px solid var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            color: 'var(--accent-gold)',
          }}
        >
          <AlertCircle size={40} />
        </motion.div>

        {/* 404 Title */}
        <motion.h1
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            fontSize: '4.5rem',
            fontWeight: 900,
            lineHeight: 1,
            margin: 0,
            background: 'linear-gradient(135deg, var(--accent-gold), #FFF 60%, var(--accent-violet))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '2px',
          }}
        >
          ۴۰۴
        </motion.h1>

        {/* Message */}
        <motion.h2
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            marginTop: 12,
            marginBottom: 8,
          }}
        >
          صفحه مورد نظر پیدا نشد
        </motion.h2>

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          متأسفانه صفحه‌ای که به دنبال آن بودید وجود ندارد یا آدرس آن تغییر کرده است.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <Link href="/home" style={{ textDecoration: 'none' }}>
            <Button size="lg" style={{ width: '100%', gap: 8 }}>
              <Home size={16} />
              بازگشت به صفحه اصلی
            </Button>
          </Link>

          <Link href="/library" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="lg" style={{ width: '100%', gap: 8 }}>
              <BookOpen size={16} />
              کتابخانه من
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
