import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/providers/auth-provider';
import MainLayout from '@/components/main-layout';
import { ThemeProvider } from '@/providers/theme-provider';
import { ScrollToTop } from '@/components/scroll-to-top';
import { getSiteConfigFromFirestore } from '@/lib/firestore';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfigFromFirestore();
  return {
    title: config.siteTitle || 'Moovie: Streaming Hub',
    description: 'A modern video streaming platform.',
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8130991342525434"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <body className={`${inter.variable} font-body antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <MainLayout>{children}</MainLayout>
            <Toaster />
            <ScrollToTop />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
