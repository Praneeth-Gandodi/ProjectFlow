// src/components/project-form.tsx
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Plus, Trash2, Upload, Github, CalendarIcon } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { saveLogo, getLogoUrl } from '@/lib/logo-storage';

interface ProjectFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  project: (Project & { source?: 'ideas' | 'completed' }) | null;
  onSave: (projectData: Project) => void;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  requirements: z.string().optional(),
  logo: z.string().optional(),
  tags: z.string().optional(),
  repoUrl: z.string().url("Please enter a valid URL").or(z.literal('')).optional(),
  dueDate: z.date().optional(),
  links: z.array(z.object({
    title: z.string().min(1, 'Link title is required'),
    url: z.string().url('Link URL must be a valid URL'),
  })).optional(),
});

type ProjectFormData = z.infer<typeof formSchema>;

const requirementsToString = (req: Project['requirements']): string => {
  if (!req) return '';
  if (Array.isArray(req)) return req.join('\n');
  return String(req);
};

const requirementsFromString = (s?: string): string | string[] => {
  if (!s) return '';
  const lines = s.split(/\r?\n/).map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
  if (lines.length <= 1) {
    return lines[0] ?? '';
  }
  return lines;
};

export function ProjectForm({ isOpen, setIsOpen, project, onSave }: ProjectFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrlInput, setLogoUrlInput] = useState('');

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      logo: '',
      tags: '',
      repoUrl: '',
      links: [],
      dueDate: undefined,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'links',
  });

  const resetForm = useCallback(async () => {
    if (project) {
      const pAny = project as any;
      const initialLogo = project.logo ?? '';
      form.reset({
        title: project.title,
        description: project.description ?? '',
        requirements: requirementsToString(project.requirements),
        logo: initialLogo,
        tags: Array.isArray(project.tags) ? project.tags.join(', ') : '',
        repoUrl: pAny.repoUrl || '',
        links: project.links ?? [],
        dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
      });

      if (initialLogo?.startsWith('indexeddb:')) {
        const url = await getLogoUrl(initialLogo.replace('indexeddb:', ''));
        setLogoPreview(url);
        setLogoUrlInput('');
      } else {
        setLogoPreview(initialLogo);
        setLogoUrlInput(initialLogo);
      }
    } else {
      form.reset({
        title: '', description: '', requirements: '', logo: '',
        tags: '', repoUrl: '', links: [], dueDate: undefined,
      });
      setLogoPreview(null);
      setLogoUrlInput('');
    }
  }, [project, form]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    form.setValue('logo', logoUrlInput, { shouldDirty: true });
    setLogoPreview(logoUrlInput);
  }, [logoUrlInput, form]);

  const handleLogoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const id = await saveLogo(file);
      const logoRef = `indexeddb:${id}`;
      form.setValue('logo', logoRef, { shouldDirty: true, shouldValidate: true });
      const url = await getLogoUrl(id);
      setLogoPreview(url);
      setLogoUrlInput(''); // Clear URL input to prioritize upload
      toast({ title: 'Image uploaded successfully!' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Failed to save image locally.' });
    }
  };

  const onSubmit = (values: ProjectFormData) => {
    const tags = values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    
    const projectData: Project = {
      ...(project || {}),
      id: project?.id || `idea-${Date.now()}`,
      title: values.title,
      description: values.description || '',
      logo: values.logo || '',
      requirements: requirementsFromString(values.requirements),
      links: values.links || [],
      progress: project?.progress ?? 0,
      notes: project?.notes ?? [],
      tags: tags,
      repoUrl: values.repoUrl || '',
      dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
    };

    onSave(projectData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">{project ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>{project ? 'Make changes to your project.' : 'Fill in the details for your new project idea.'}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow overflow-hidden flex flex-col">
            <Tabs defaultValue="general" className="flex-grow flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
              </TabsList>

              <div className="flex-grow overflow-y-auto pt-4 pr-1">
                <TabsContent value="general" className="space-y-6 px-2">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl><Input placeholder="e.g., AI-Powered Scheduler" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea placeholder="Describe the project..." {...field} rows={4} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="repoUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Github className="h-4 w-4" />GitHub Repository URL</FormLabel>
                      <FormControl><Input placeholder="https://github.com/username/repository" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex items-center gap-4 pt-4 pb-6">
                    <div className="flex-shrink-0">
                      <div className="relative w-20 h-20 rounded-lg border overflow-hidden bg-muted">
                        {logoPreview && <Image src={logoPreview} alt="Logo preview" fill className="object-cover" unoptimized />}
                        {!logoPreview && <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Logo</div>}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <FormLabel>Logo</FormLabel>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={handleLogoUploadClick}><Upload className="mr-2 h-4 w-4" /> Upload</Button>
                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        <Input placeholder="Or paste image URL" value={logoUrlInput} onChange={(e) => setLogoUrlInput(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="details" className="space-y-6 px-2">
                  <FormField control={form.control} name="requirements" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements</FormLabel>
                      <FormControl><Textarea placeholder="1. First requirement..." {...field} rows={8} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tags" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl><Input placeholder="e.g. Web, Mobile, AI" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dueDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>
                <TabsContent value="links" className="px-2">
                  <div className="space-y-4">
                    {fields.map((f, index) => (
                      <div key={f.id} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField control={form.control} name={`links.${index}.title`} render={({ field }) => (
                            <FormItem><FormLabel>Link Title</FormLabel><FormControl><Input placeholder="e.g., Figma Mockups" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name={`links.${index}.url`} render={({ field }) => (
                            <FormItem><FormLabel>URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="mt-7 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /><span className="sr-only">Remove Link</span></Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-4 mb-4" onClick={() => append({ title: '', url: '' })}><Plus className="mr-2 h-4 w-4" /> Add Link</Button>
                </TabsContent>
              </div>
            </Tabs>
            <DialogFooter className="pt-4 border-t"><Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
