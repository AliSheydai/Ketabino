// File: app/(author)/layout.tsx
import { Header } from '@/components/shared/Header';

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Header />
      <main style={{ paddingTop: '115px', paddingBottom: '40px' }}>{children}</main>
    </div>
  );
}
