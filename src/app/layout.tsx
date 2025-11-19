import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { cn } from '@/lib/utils';
import { ProfileProvider } from '@/context/profile-context';
import { PinProvider } from '@/context/pin-context';
import { AppLock } from '@/components/app-lock';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

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
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased',
        inter.variable,
        outfit.variable
      )}>
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