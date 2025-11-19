'use client';

import React, { createContext, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export type ColorTheme = 'light' | 'dark' | 'earthy' | 'purple' | 'vintage' | 'frost' | 'ocean';

export interface ProfileContextType {
  name: string;
  setName: (name: string) => void;
  avatar: string | null;
  setAvatar: (avatar: string | null) => void;
  github: string | null;
  setGithub: (github: string | null) => void;
  font: 'sans' | 'serif';
  setFont: (font: 'sans' | 'serif') => void;
  layout: 'compact' | 'comfortable';
  setLayout: (layout: 'compact' | 'comfortable') => void;
  storageMode: 'local' | 'sqlite';
  setStorageMode: (mode: 'local' | 'sqlite') => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

export const ProfileContext = createContext<ProfileContextType>({
  name: 'Guest',
  setName: () => { },
  avatar: null,
  setAvatar: () => { },
  github: null,
  setGithub: () => { },
  font: 'sans',
  setFont: () => { },
  layout: 'comfortable',
  setLayout: () => { },
  storageMode: 'local',
  setStorageMode: () => { },
  colorTheme: 'light',
  setColorTheme: () => { },
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useLocalStorage('profile-name', 'Guest');
  const [avatar, setAvatar] = useLocalStorage<string | null>('profile-avatar', null);
  const [github, setGithub] = useLocalStorage<string | null>('profile-github', null);
  const [font, setFont] = useLocalStorage<'sans' | 'serif'>('profile-font', 'sans');
  const [layout, setLayout] = useLocalStorage<'compact' | 'comfortable'>('profile-layout', 'comfortable');
  const [storageMode, setStorageMode] = useLocalStorage<'local' | 'sqlite'>('storage-mode', 'local');
  const [colorTheme, setColorTheme] = useLocalStorage<ColorTheme>('color-theme', 'light');

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes and attributes
    root.classList.remove('dark');
    root.removeAttribute('data-theme');

    // Apply the selected theme
    if (colorTheme === 'dark') {
      root.classList.add('dark');
    } else if (colorTheme !== 'light') {
      // For all custom themes (earthy, purple, vintage, frost, ocean)
      root.setAttribute('data-theme', colorTheme);
    }
  }, [colorTheme]);

  return (
    <ProfileContext.Provider value={{
      name, setName,
      avatar, setAvatar,
      github, setGithub,
      font, setFont,
      layout, setLayout,
      storageMode, setStorageMode,
      colorTheme, setColorTheme
    }}>
      {children}
    </ProfileContext.Provider>
  );
}
