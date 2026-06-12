// File Path: app/layout.tsx
import type { Metadata, Viewport } from 'next';
import ViewTransitionsProvider from '@/components/ViewTransitionsProvider';
import { AuthProvider } from '@/context/AuthContext';
import { NextThemeProvider } from '@/components/shared/NextThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'کتابینو — کتاب دیجیتال به سبک جدید',
    template: '%s | کتابینو',
  },
  description:
    'پلتفرم خرید و مطالعه کتاب دیجیتال با مدل پرداخت به ازای هر فصل. خواندن را از هر کجا، هر زمان شروع کن.',
  keywords: ['کتاب دیجیتال', 'کتابینو', 'خرید کتاب', 'مطالعه آنلاین'],
  authors: [{ name: 'Ketabino Team' }],
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: 'کتابینو',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ViewTransitionsProvider>
          <NextThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </NextThemeProvider>
        </ViewTransitionsProvider>
      </body>
    </html>
  );
}
