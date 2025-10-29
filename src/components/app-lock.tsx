'use client';

import React, { useContext, useState, useEffect } from 'react';
import { PinContext } from '@/context/pin-context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AppLogo } from './icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MAX_ATTEMPTS = 5;

export function AppLock({ children }: { children: React.ReactNode }) {
  const { isLocked, unlockApp, attempts, resetPin } = useContext(PinContext);
  const [pinAttempt, setPinAttempt] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleUnlock = () => {
    if (showReset) {
      if (resetPin(pinAttempt)) {
        setShowReset(false);
        setPinAttempt('');
      } else {
        toast({ variant: 'destructive', title: 'Invalid Master PIN' });
      }
    } else {
      unlockApp(pinAttempt);
    }
    setPinAttempt('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  if (!isClient || !isLocked) {
    return <>{children}</>;
  }

  const isPermanentlyLocked = attempts >= MAX_ATTEMPTS;

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AppLogo className="h-10 w-10" />
          </div>
          <CardTitle className="font-headline flex items-center justify-center gap-2">
            <KeyRound size={20} /> {showReset ? 'Reset PIN' : 'ProjectFlow Locked'}
          </CardTitle>
          <CardDescription>
            {isPermanentlyLocked && !showReset 
                ? "Too many incorrect attempts."
                : showReset 
                ? "Enter the master recovery PIN." 
                : "Enter your 6-digit PIN to unlock."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder={showReset ? 'Master PIN' : '6-digit PIN'}
              value={pinAttempt}
              onChange={(e) => setPinAttempt(e.target.value.replace(/\D/g, ''))}
              maxLength={showReset ? undefined : 6}
              onKeyDown={handleKeyPress}
              disabled={isPermanentlyLocked && !showReset}
            />
            {attempts > 0 && !isPermanentlyLocked && !showReset && (
              <p className="text-xs text-destructive text-center">
                {MAX_ATTEMPTS - attempts} attempts remaining.
              </p>
            )}
          </div>
          <Button onClick={handleUnlock} className="w-full" disabled={isPermanentlyLocked && !showReset}>
            {showReset ? 'Reset & Unlock' : 'Unlock'}
          </Button>
          <div className="text-center">
            {showReset ? (
                 <Button variant="link" size="sm" onClick={() => setShowReset(false)}>Back to PIN login</Button>
            ) : (
                <Button variant="link" size="sm" onClick={() => setShowReset(true)}>Forgot PIN?</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
