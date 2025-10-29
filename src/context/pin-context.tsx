'use client';

import React, { createContext, useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

interface PinContextType {
  userPin: string | null;
  setUserPin: (pin: string | null) => void;
  isLocked: boolean;
  unlockApp: (pinAttempt: string) => boolean;
  lockApp: () => void;
  attempts: number;
  resetPin: (masterPin: string) => boolean;
}

const MAX_ATTEMPTS = 5;
const MASTER_PIN = '741852';

export const PinContext = createContext<PinContextType>({
  userPin: null,
  setUserPin: () => {},
  isLocked: true,
  unlockApp: () => false,
  lockApp: () => {},
  attempts: 0,
  resetPin: () => false,
});

export function PinProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [userPin, setUserPin] = useLocalStorage<string | null>('app-pin', null);
  const [isLocked, setIsLocked] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (userPin) {
        setIsLocked(true);
        setAttempts(0);
      } else {
        setIsLocked(false);
      }
    }
  }, [userPin, isClient]);

  const lockApp = () => {
    if (userPin) {
        setIsLocked(true);
        setAttempts(0);
    }
  }

  const unlockApp = (pinAttempt: string) => {
    if (pinAttempt === userPin) {
      setIsLocked(false);
      setAttempts(0);
      toast({ title: 'Welcome!', description: 'Application unlocked.' });
      return true;
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        toast({ variant: 'destructive', title: 'Too many attempts', description: 'Application is locked. Use the reset PIN.' });
      } else {
        toast({ variant: 'destructive', title: 'Invalid PIN', description: `You have ${MAX_ATTEMPTS - newAttempts} attempts remaining.` });
      }
      return false;
    }
  };

  const resetPin = (masterPinAttempt: string) => {
    if (masterPinAttempt === MASTER_PIN) {
        setUserPin(null);
        setIsLocked(false);
        setAttempts(0);
        toast({ title: 'PIN Reset', description: 'Your application PIN has been removed.' });
        return true;
    }
    toast({ variant: 'destructive', title: 'Invalid Master PIN' });
    return false;
  }

  const contextValue = {
    userPin,
    setUserPin,
    isLocked,
    unlockApp,
    lockApp,
    attempts,
    resetPin,
  };

  return (
    <PinContext.Provider value={contextValue}>
      {children}
    </PinContext.Provider>
  );
}
