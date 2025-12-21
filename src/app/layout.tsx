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

const SITE_TITLE = "Watch and Download Hindi Dubbed Movies - Series Dual Audio - 480p 720p 1080p - at Moovie | Allmovieshub One CLick Download";

export async function generateMetadata(): Promise<Metadata> {
  // Using hardcoded title as requested by user
  return {
    title: SITE_TITLE,
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
