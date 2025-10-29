'use client';

import React, { useEffect, useState } from 'react';
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
import type { Project } from '@/app/types';
import { useToast } from '@/hooks/use-toast';
import { parsePlanSentences } from '@/ai/flows/parse-plan-sentences';
import { Wand2, Loader2 } from 'lucide-react';

interface ProjectFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  project: (Project & { source?: 'ideas' | 'completed' }) | null;
  setIdeas: React.Dispatch<React.SetStateAction<Project[]>>;
  setCompleted: React.Dispatch<React.SetStateAction<Project[]>>;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

export function ProjectForm({ isOpen, setIsOpen, project, setIdeas, setCompleted }: ProjectFormProps) {
  const { toast } = useToast();
  const [isParsing, setIsParsing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title,
        description: project.description,
      });
    } else {
      form.reset({
        title: '',
        description: '',
      });
    }
  }, [project, isOpen, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const setTarget = project?.source === 'completed' ? setCompleted : setIdeas;

    if (project) {
      // Editing existing project
      setTarget(prev => prev.map(p => (p.id === project.id ? { ...p, ...values } : p)));
      toast({ title: 'Project updated!' });
    } else {
      // Adding new project
      const newProject: Project = {
        id: `idea-${Date.now()}`,
        ...values,
      };
      setIdeas(prev => [newProject, ...prev]);
      toast({ title: 'New project added!' });
    }
    setIsOpen(false);
  };

  const handleParse = async () => {
    const description = form.getValues('description');
    if (!description) {
      toast({
        title: 'Description is empty',
        description: 'Please write a description before parsing.',
        variant: 'destructive',
      });
      return;
    }
    setIsParsing(true);
    try {
      const result = await parsePlanSentences({ sentences: description });
      if (result && result.requirements) {
        const numberedList = result.requirements.map((req, index) => `${index + 1}. ${req}`).join('\n');
        form.setValue('description', numberedList, { shouldValidate: true });
        toast({ title: 'Requirements parsed!', description: 'The description has been updated.' });
      }
    } catch (error) {
      console.error('Failed to parse sentences:', error);
      toast({
        title: 'Parsing failed',
        description: 'Could not parse requirements. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{project ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>
            {project ? 'Make changes to your project.' : 'Fill in the details for your new project idea.'}
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
                    <Input placeholder="e.g., AI-Powered Scheduler" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the project..." {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button type="button" variant="outline" size="sm" onClick={handleParse} disabled={isParsing}>
                {isParsing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                )}
                Parse Requirements with AI
            </Button>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
