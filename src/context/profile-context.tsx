'use client';

import React, { createContext, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface ProfileContextType {
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
}

export const ProfileContext = createContext<ProfileContextType>({
  name: 'Guest',
  setName: () => {},
  avatar: null,
  setAvatar: () => {},
  github: null,
  setGithub: () => {},
  font: 'sans',
  setFont: () => {},
  layout: 'comfortable',
  setLayout: () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useLocalStorage('profile-name', 'Guest');
  const [avatar, setAvatar] = useLocalStorage<string | null>('profile-avatar', null);
  const [github, setGithub] = useLocalStorage<string | null>('profile-github', null);
  const [font, setFont] = useLocalStorage<'sans' | 'serif'>('profile-font', 'sans');
  const [layout, setLayout] = useLocalStorage<'compact' | 'comfortable'>('profile-layout', 'comfortable');

  return (
    <ProfileContext.Provider value={{ name, setName, avatar, setAvatar, github, setGithub, font, setFont, layout, setLayout }}>
      {children}
    </ProfileContext.Provider>
  );
}
