import type { Metadata } from 'next';

import { AppProviders } from '@/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Riscovery - Insurance Advisory Management',
  description: 'Insurance compliance tracking and RFQ generation system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
