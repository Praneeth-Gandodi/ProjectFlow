import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { AppLogo } from './icons';
import { ProfileMenu } from './profile-menu';

interface AppHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onExport: (format: 'json' | 'csv-projects' | 'csv-links') => void;
  onImport: () => void;
}

export function AppHeader({ searchTerm, setSearchTerm, onExport, onImport }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative w-full">

        {/* Left: Logo */}
        <div className="max-w-screen-xl mx-auto px-6 py-3">
          <div className="flex items-center h-10">
            <a className="flex items-center space-x-2" href="/">
              <AppLogo className="h-6 w-6" />
              <span className="font-bold font-headline text-lg">ProjectFlow</span>
            </a>
          </div>
        </div>

        {/* Center: Search */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Right: Theme + Profile (fixed to far right with spacing) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <ThemeToggle />
          <div className="relative">
            <ProfileMenu onExport={onExport} onImport={onImport} />
          </div>
        </div>
      </div>
    </header>
  );
}
