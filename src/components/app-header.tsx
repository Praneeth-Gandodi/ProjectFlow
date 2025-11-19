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
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between h-10">
          {/* Left: Logo */}
          <a className="flex items-center space-x-2 group" href="/">
            <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
              <AppLogo className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold font-headline text-lg tracking-tight">ProjectFlow</span>
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
