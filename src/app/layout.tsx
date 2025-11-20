import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/providers/auth-provider';
import MainLayout from '@/components/main-layout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'H-TV: Streaming Hub',
  description: 'A modern video streaming platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-body antialiased`}>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
