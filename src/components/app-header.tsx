import React from 'react';
import { Input } from '@/components/ui/input';
import { Download, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { AppLogo } from './icons';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface AppHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onExport: (format: 'json' | 'csv-projects' | 'csv-links') => void;
}

export function AppHeader({ searchTerm, setSearchTerm, onExport }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <AppLogo className="h-6 w-6" />
            <span className="font-bold font-headline">ProjectFlow</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
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
          <nav className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onExport('json')}>
                  Backup (JSON)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('csv-projects')}>
                  Projects (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('csv-links')}>
                  Links (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
