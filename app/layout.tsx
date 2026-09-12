import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Sidebar } from '@/components/ui/Sidebar';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { IntroSplash } from '@/components/ui/IntroSplash';

export const metadata: Metadata = {
  title: 'Photo Booth Studio',
  description: 'Production-grade offline-first browser photo booth application with real-time effects, photo strips, and local storage.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Photo Booth',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-zinc-50 dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-100 h-dvh overflow-hidden flex antialiased selection:bg-blue-600 selection:text-white safe-area-inset-top safe-area-inset-bottom">
        <ThemeProvider>
          <IntroSplash />
          <ServiceWorkerRegistration />
          <Sidebar />
          <main className="flex-1 w-full flex flex-col overflow-y-auto">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
