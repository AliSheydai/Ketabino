// File Path: app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}
      className="flex items-center justify-center"
    >
      {children}
    </div>
  );
}
