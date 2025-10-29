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
  onExport: (format: 'json' | 'csv-projects' | 'csv-links') => void;
  onImport: () => void;
}

export function ProfileMenu({ onExport, onImport }: ProfileMenuProps) {
  const { name, avatar, github, font, setFont, layout, setLayout } = useContext(ProfileContext);
  const { lockApp, userPin } = useContext(PinContext);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatar || undefined} alt={name} />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{name}</p>
              {github && (
                 <a href={github} target="_blank" rel="noopener noreferrer" className="text-xs leading-none text-muted-foreground flex items-center gap-1 hover:underline">
                    <Github size={12}/> {github.replace('https://github.com/', '')}
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
              <DropdownMenuItem onClick={() => onExport('json')}>
                Backup (JSON)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('csv-projects')}>
                Projects (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('csv-links')}>
                Links (CSV)
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
              <DropdownMenuRadioGroup value={font} onValueChange={(v) => setFont(v as 'sans' | 'serif')}>
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
              <DropdownMenuRadioGroup value={layout} onValueChange={(v) => setLayout(v as 'compact' | 'comfortable')}>
                <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>


        </DropdownMenuContent>
      </DropdownMenu>
      <ProfileDialog isOpen={isProfileDialogOpen} setIsOpen={setIsProfileDialogOpen} />
    </>
  );
}
