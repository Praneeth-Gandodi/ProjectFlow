import React from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { AppLogo } from './icons';
import { ProfileMenu } from './profile-menu';

interface AppHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onExport: (format: 'json' | 'csv-projects' | 'csv-links' | 'csv-courses') => void;
  onImport: () => void;
}

export function AppHeader({ searchTerm, setSearchTerm, onExport, onImport }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between h-10">
          {/* Left: Logo */}
          <a className="flex items-center space-x-2" href="/">
            <AppLogo className="h-6 w-6" />
            <span className="font-bold font-headline text-lg">ProjectFlow</span>
          </a>

          {/* Right: Theme + Profile */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ProfileMenu onExport={onExport} onImport={onImport} />
          </div>
        </div>
      </div>
    </header>
  );
}
