'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Download, Upload, Edit, Github, Layout, Lock, Pilcrow, User } from 'lucide-react';
import { useContext, useState } from 'react';
import { ProfileContext } from '@/context/profile-context';
import { ProfileDialog } from './profile-dialog';
import { PinContext } from '@/context/pin-context';

interface ProfileMenuProps {
  onExport: (format: 'json' | 'csv-projects' | 'csv-links' | 'csv-courses') => void;
  onImport: () => void;
}

export function ProfileMenu({ onExport, onImport }: ProfileMenuProps) {
  const { name, avatar, github, font, setFont, layout, setLayout } = useContext(ProfileContext);
  const { lockApp, userPin } = useContext(PinContext);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        {/* relative container ensures dropdown anchors under avatar */}
        <div className="relative">
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full border border-border hover:bg-accent transition-all"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatar || undefined} alt={name} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          {/* Dropdown positioned directly below avatar */}
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-56 border border-border bg-popover text-popover-foreground shadow-lg z-50"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{name}</p>
                {github && (
                  <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs leading-none text-muted-foreground flex items-center gap-1 hover:underline"
                  >
                    <Github size={12} /> {github.replace('https://github.com/', '')}
                  </a>
                )}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Profile</span>
            </DropdownMenuItem>

            {userPin && (
              <DropdownMenuItem onClick={lockApp}>
                <Lock className="mr-2 h-4 w-4" />
                <span>Lock App</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Download className="mr-2 h-4 w-4" />
                <span>Export Data</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onExport('json')}>Backup (JSON)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('csv-projects')}>
                  Projects (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('csv-links')}>
                  Links (CSV)
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => onExport('csv-courses')}>
                  Courses (CSV)
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem onClick={onImport}>
              <Upload className="mr-2 h-4 w-4" />
              <span>Import Data</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Pilcrow className="mr-2 h-4 w-4" />
                <span>Font</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={font}
                  onValueChange={(v) => setFont(v as 'sans' | 'serif')}
                >
                  <DropdownMenuRadioItem value="sans">Sans-serif</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="serif">Serif</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Layout className="mr-2 h-4 w-4" />
                <span>Layout</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={layout}
                  onValueChange={(v) => setLayout(v as 'compact' | 'comfortable')}
                >
                  <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </div>
      </DropdownMenu>

      <ProfileDialog isOpen={isProfileDialogOpen} setIsOpen={setIsProfileDialogOpen} />
    </>
  );
}
