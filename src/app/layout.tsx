import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { cn } from '@/lib/utils';
import { ProfileProvider } from '@/context/profile-context';
import { PinProvider } from '@/context/pin-context';
import { AppLock } from '@/components/app-lock';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'ProjectFlow',
  description: 'Manage your projects and ideas with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600&family=Merriweather:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased min-h-screen bg-background')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PinProvider>
            <ProfileProvider>
              <AppLock>
                {children}
              </AppLock>
            </ProfileProvider>
          </PinProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}