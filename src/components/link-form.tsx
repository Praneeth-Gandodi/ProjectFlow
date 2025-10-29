'use client';

import React, { useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import type { Link } from '@/app/types';
import { useToast } from '@/hooks/use-toast';

interface LinkFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  link: Link | null;
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Please enter a valid URL'),
  description: z.string().optional(),
});

type LinkFormData = z.infer<typeof formSchema>;

const getDraftKey = (linkId: string | null) => `link_draft_${linkId || 'new'}`;

export function LinkForm({ isOpen, setIsOpen, link, setLinks }: LinkFormProps) {
  const { toast } = useToast();
  const draftKey = getDraftKey(link?.id ?? null);
  
  const form = useForm<LinkFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: () => {
      if (typeof window !== 'undefined') {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          try {
            return JSON.parse(savedDraft);
          } catch(e) {
            console.error("Failed to parse link draft", e);
          }
        }
      }
      return link ? {
        title: link.title,
        url: link.url,
        description: link.description || '',
      } : {
        title: '',
        url: '',
        description: '',
      }
    },
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(draftKey, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form, draftKey]);

  useEffect(() => {
    if (isOpen) {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          form.reset(JSON.parse(savedDraft));
        } catch (e) {
          console.error("Failed to parse link draft", e);
          form.reset(link ? { title: link.title, url: link.url, description: link.description || '' } : { title: '', url: '', description: '' });
        }
      } else if (link) {
        form.reset({
          title: link.title,
          url: link.url,
          description: link.description || '',
        });
      } else {
        form.reset({
          title: '',
          url: '',
          description: '',
        });
      }
    }
  }, [link, isOpen, form, draftKey]);

  const onSubmit = (values: LinkFormData) => {
    if (link) {
      // Editing existing link
      setLinks(prev => prev.map(l => (l.id === link.id ? { ...l, ...values } : l)));
      toast({ title: 'Link updated!' });
    } else {
      // Adding new link
      const newLink: Link = {
        id: `link-${Date.now()}`,
        ...values,
      };
      setLinks(prev => [newLink, ...prev]);
      toast({ title: 'New link added!' });
    }
    localStorage.removeItem(draftKey);
    setIsOpen(false);
  };
  
  const handleClose = (open: boolean) => {
    if (!open) {
      const confirmation = confirm("You have unsaved changes. Are you sure you want to close? Your draft will be available when you re-open the form.");
      if (confirmation) {
          setIsOpen(false);
      }
    } else {
      setIsOpen(true);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{link ? 'Edit Link' : 'Add New Link'}</DialogTitle>
          <DialogDescription>
            {link ? 'Make changes to your saved link.' : 'Add a new useful link to your collection.'} Your progress is saved automatically.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., shadcn/ui" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ui.shadcn.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A library of UI components..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Link</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
