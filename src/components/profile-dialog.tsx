'use client';

import React, { useContext, useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, KeyRound } from 'lucide-react';
import Image from 'next/image';
import { ProfileContext } from '@/context/profile-context';
import { PinContext } from '@/context/pin-context';
import { Separator } from './ui/separator';

interface ProfileDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  avatar: z.string().optional(),
  github: z.string().url().or(z.literal('')).optional(),
});

type ProfileFormData = z.infer<typeof formSchema>;

export function ProfileDialog({ isOpen, setIsOpen }: ProfileDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { name, avatar, github, setName, setAvatar, setGithub } = useContext(ProfileContext);
  const { userPin, setUserPin } = useContext(PinContext);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatar);
  const [pinInputValue, setPinInputValue] = useState('');

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(formSchema),
    values: {
      name,
      avatar: avatar || '',
      github: github || '',
    },
  });
  
  useEffect(() => {
    form.reset({ name, avatar: avatar || '', github: github || '' });
    setAvatarPreview(avatar);
    setPinInputValue('');
  }, [isOpen, name, avatar, github, form]);


  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        form.setValue('avatar', dataUrl, { shouldDirty: true });
        setAvatarPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = (values: ProfileFormData) => {
    setName(values.name);
    setAvatar(values.avatar || null);
    setGithub(values.github || null);
    toast({ title: 'Profile updated!' });
    setIsOpen(false);
  };
  
  const handlePinChange = () => {
    if (pinInputValue.length !== 6 || !/^\d+$/.test(pinInputValue)) {
      toast({ variant: 'destructive', title: 'Invalid PIN', description: 'PIN must be exactly 6 digits.' });
      return;
    }
    setUserPin(pinInputValue);
    setPinInputValue('');
    toast({ title: 'PIN Updated', description: 'Your new PIN has been set.' });
  };

  const handleRemovePin = () => {
    setUserPin(null);
    setPinInputValue('');
    toast({ title: 'PIN Removed', description: 'Your application is no longer PIN protected.' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile and security settings here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
             <div className="flex items-center gap-4">
              {avatarPreview && (
                <Image src={avatarPreview} alt="Avatar preview" width={80} height={80} className="rounded-full border object-cover"/>
              )}
              <div className="flex-1 space-y-2">
                <FormLabel>Avatar</FormLabel>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleAvatarUploadClick}>
                    <Upload className="mr-2 h-4 w-4" /> Upload
                  </Button>
                  <Input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormControl>
                          <Input placeholder="Or paste image URL" {...field} onChange={(e) => { field.onChange(e); setAvatarPreview(e.target.value); }} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="github"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
               <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
               <Button type="submit">Save Profile</Button>
            </DialogFooter>
          </form>
        </Form>
        <Separator />
        <div className="space-y-4 pt-2">
            <h3 className="font-medium flex items-center gap-2"><KeyRound size={16} /> Security PIN</h3>
            <div className="space-y-2">
                <FormLabel htmlFor="pin-input">{userPin ? 'Change PIN' : 'Set PIN'}</FormLabel>
                <div className="flex gap-2">
                    <Input 
                        id="pin-input"
                        type="password"
                        maxLength={6}
                        value={pinInputValue}
                        onChange={(e) => setPinInputValue(e.target.value.replace(/\D/g, ''))}
                        placeholder="6-digit PIN"
                    />
                    <Button type="button" onClick={handlePinChange}>Set/Change</Button>
                </div>
            </div>
            {userPin && (
                <Button type="button" variant="destructive" onClick={handleRemovePin} className="w-full">
                    Remove PIN Protection
                </Button>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
