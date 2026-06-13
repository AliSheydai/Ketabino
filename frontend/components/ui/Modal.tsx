'use client';
// File: components/ui/Modal.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: number;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 480 }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
            }}
          />

          {/* Panel Wrapper */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 101,
              pointerEvents: 'none',
            }}
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              style={{
                pointerEvents: 'auto',
                width: `min(${maxWidth}px, calc(100vw - 32px))`,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-card)',
                padding: '28px',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              {title && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{title}</h3>
                  <button
                    onClick={onClose}
                    style={{
                      background: 'var(--bg-elevated)', border: 'none',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)', padding: 6, display: 'flex',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
