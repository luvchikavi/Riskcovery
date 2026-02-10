import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Heebo } from 'next/font/google';

import { AppProviders } from '@/providers/AppProviders';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Riscovery - Insurance Advisory Management',
  description: 'Insurance compliance tracking and RFQ generation system',
  themeColor: '#1D1D1F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${plusJakartaSans.variable} ${heebo.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
