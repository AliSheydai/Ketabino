// File: app/(reader)/layout.tsx
import { Header } from '@/components/shared/Header';

export default function ReaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
      <Header />
      <main className="flex-1" style={{ paddingTop: '115px', paddingBottom: '40px' }}>
        {children}
      </main>
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
        کتابینو © ۱۴۰۴ — مطالعه فصل به فصل
      </footer>
    </div>
  );
}
