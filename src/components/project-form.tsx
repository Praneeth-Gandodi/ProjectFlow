// src/components/project-form.tsx  (replace your existing ProjectForm file)
'use client';

import React, { useRef, useState, useEffect } from 'react';
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
import { saveLogo, getLogoUrl, deleteLogo } from '@/lib/logo-storage';

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
  repoUrl: z.string().optional(),
  dueDate: z.date().optional(),
  links: z.array(z.object({
    title: z.string().min(1, 'Link title is required'),
    url: z.string().url('Link URL must be a valid URL'),
  })).optional(),
});

type ProjectFormData = z.infer<typeof formSchema>;

const getDraftKey = (projectId: string | null) => `project_draft_${projectId || 'new'}`;

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
  const [isInitialized, setIsInitialized] = useState(false);

  const draftKey = getDraftKey(project?.id ?? null);

  const loadDraftData = (): Partial<ProjectFormData> | null => {
    if (typeof window === 'undefined') return null;
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as Partial<ProjectFormData>;
        return {
          ...parsed,
          dueDate: parsed.dueDate ? new Date(parsed.dueDate) : undefined
        };
      }
    } catch (e) {
      console.error('Failed to parse project draft', e);
    }
    return null;
  };

  const computeDefaults = (): ProjectFormData => {
    const draftData = loadDraftData();
    if (draftData) {
      return {
        title: draftData.title || '',
        description: draftData.description || '',
        requirements: draftData.requirements || '1. ',
        logo: draftData.logo || '',
        tags: draftData.tags || '',
        repoUrl: draftData.repoUrl || '',
        links: draftData.links || [],
        dueDate: draftData.dueDate,
      };
    }
    if (project) {
      const pAny = project as any;
      return {
        title: project.title,
        description: project.description ?? '',
        requirements: requirementsToString(project.requirements),
        logo: project.logo ?? '',
        tags: Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags as any) ?? '',
        repoUrl: pAny.repoUrl || pAny.githubUrl || pAny.repository || '',
        links: project.links ?? [],
        dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
      };
    }
    return {
      title: '',
      description: '',
      requirements: '1. ',
      logo: '',
      tags: '',
      repoUrl: '',
      links: [],
      dueDate: undefined,
    };
  };

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: computeDefaults(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'links',
  });

  // Initialize and load preview if project.logo is an indexeddb entry
  useEffect(() => {
    if (isOpen && !isInitialized) {
      const initialValues = computeDefaults();
      form.reset(initialValues);
      // If project or draft references an indexeddb logo, load a preview URL
      if (initialValues.logo && typeof initialValues.logo === 'string' && initialValues.logo.startsWith('indexeddb:')) {
        const id = initialValues.logo.replace('indexeddb:', '');
        getLogoUrl(id).then(url => {
          if (url) setLogoPreview(url);
        }).catch(() => {});
      } else {
        setLogoPreview(initialValues.logo || null);
      }
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized, form]);

  // Cleanup created preview object URL when closing/unmounting
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        try { URL.revokeObjectURL(logoPreview); } catch {}
      }
    };
  }, [logoPreview]);

  // Reset initialization when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
    }
  }, [isOpen]);

  // Auto-save functionality (keeps same behaviour)
  useEffect(() => {
    if (!isOpen || !isInitialized) return;

    const subscription = form.watch((value) => {
      if (Object.keys(form.formState.dirtyFields).length > 0) {
        try {
          const draftValue = { ...value };
          // Keep indexeddb refs (they are small) — don't inline big base64 into other storage if you don't want to
          if (draftValue.logo?.startsWith('data:image')) {
            if (draftValue.logo.length > 100000) {
              console.warn('Large image data URL detected in draft');
            }
          }
          localStorage.setItem(draftKey, JSON.stringify(draftValue));
        } catch (e) {
          if (e instanceof DOMException && e.name === 'QuotaExceededError') {
             console.warn('LocalStorage quota exceeded. Could not save draft.');
             try {
               const cleanDraft = { ...value };
               delete cleanDraft.logo;
               localStorage.setItem(draftKey, JSON.stringify(cleanDraft));
             } catch {
               // Give up if still failing
             }
          } else {
             console.error('Failed to save draft', e);
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, draftKey, isOpen, isInitialized]);

// Sync logo preview with form data — if the logo is an indexeddb:<id> ref,
// resolve it to a blob URL for preview. Never set the preview to the raw indexeddb:... string.
useEffect(() => {
  let active = true;
  let createdUrl: string | null = null;

  const subscription = form.watch(async (value) => {
    const l = value.logo;
    if (!l) {
      // clear preview
      if (createdUrl) {
        try { URL.revokeObjectURL(createdUrl); } catch {}
        createdUrl = null;
      }
      if (active) setLogoPreview(null);
      return;
    }

    if (typeof l === 'string' && l.startsWith('indexeddb:')) {
      const id = l.replace('indexeddb:', '');
      try {
        const url = await getLogoUrl(id);
        if (!active) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        // revoke previous createdUrl if present
        if (createdUrl && createdUrl !== url) {
          try { URL.revokeObjectURL(createdUrl); } catch {}
        }
        createdUrl = url;
        if (active) setLogoPreview(url);
      } catch (err) {
        console.error('Failed to load indexeddb logo for preview', err);
        if (active) setLogoPreview(null);
      }
    } else {
      // normal URL or data: — show directly
      if (createdUrl) {
        try { URL.revokeObjectURL(createdUrl); } catch {}
        createdUrl = null;
      }
      if (active) setLogoPreview(typeof l === 'string' ? l : null);
    }
  });

  return () => {
    active = false;
    try { subscription.unsubscribe(); } catch {}
    if (createdUrl) {
      try { URL.revokeObjectURL(createdUrl); } catch {}
    }
  };
}, [form]);


  const handleLogoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a JPG, PNG, GIF, WEBP, or SVG image.'
      });
      return;
    }

    // Save the file in IndexedDB (real persistence) and store a tiny reference string
    try {
      const id = await saveLogo(file);
      // set form logo to a small reference. Example: 'indexeddb:logo-...'
      form.setValue('logo', `indexeddb:${id}`, { shouldDirty: true, shouldValidate: true });
      // preview via object URL
      const url = await getLogoUrl(id);
      setLogoPreview(url);
      toast({ title: 'Image uploaded successfully!' });
    } catch (err) {
      console.error('Error saving logo to IndexedDB', err);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Failed to save image locally.'
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleRequirementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    form.setValue('requirements', e.target.value, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = (values: ProjectFormData) => {
    const tags = values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const finalLogo = values.logo || (project?.logo || '');

    const projectData: Project = {
      ...(project ? { ...project } : {}),
      id: project?.id || `idea-${Date.now()}`,
      title: values.title,
      description: values.description || '',
      logo: finalLogo, // may be 'indexeddb:<id>' or a data URL or remote URL
      requirements: requirementsFromString(values.requirements),
      links: values.links ? values.links.map(link => ({ ...link })) : [],
      progress: project?.progress ?? 0,
      tags: [...tags],
      repoUrl: values.repoUrl || '',
      dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
    };

    console.log('Saving project with logo:', finalLogo ? finalLogo.slice(0, 50) + (finalLogo.length > 50 ? '…' : '') : 'No logo');
    onSave(projectData);

    localStorage.removeItem(draftKey);
    setIsOpen(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      if (Object.keys(form.formState.dirtyFields).length > 0) {
        const confirmation = confirm("You have unsaved changes. Are you sure you want to close? Your draft will be available when you re-open the form.");
        if (confirmation) {
          setIsOpen(false);
        }
      } else {
        setIsOpen(false);
        localStorage.removeItem(draftKey);
      }
    } else {
      setIsOpen(true);
    }
  };

  const currentLogo = form.watch('logo');
  const previewSrc = logoPreview || currentLogo;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">{project ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>
            {project ? 'Make changes to your project.' : 'Fill in the details for your new project idea.'} Your draft is auto-saved.
          </DialogDescription>
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
                  {/* title / description / repoUrl */}
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., AI-Powered Scheduler" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the project..." {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="repoUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Github className="h-4 w-4" />
                        GitHub Repository URL
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/username/repository" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="flex items-center gap-4 pt-4 pb-6">
                    <div className="flex-shrink-0">
                      <div className="relative w-20 h-20 rounded-lg border overflow-hidden bg-muted">
                        {previewSrc ? (
                          // For small previews, <img> is simplest since we sometimes create blob: URLs
                          // next/image may also work, but <img> avoids any next/image restrictions.
                          <img src={previewSrc} alt="Logo preview" className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Logo</div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <FormLabel>Logo</FormLabel>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={handleLogoUploadClick}>
                          <Upload className="mr-2 h-4 w-4" /> Upload
                        </Button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/jpeg, image/png, image/gif, image/webp, image/svg+xml"
                          onChange={handleFileChange}
                        />

                        <FormField control={form.control} name="logo" render={({ field }) => (
                          <FormItem className='flex-1'>
                            <FormControl>
                              <Input
                                placeholder="Or paste image URL (or indexeddb:<id>)"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  // preview effect will pick this up
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-6 px-2">
                  <FormField control={form.control} name="requirements" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="1. First requirement..."
                          {...field}
                          rows={8}
                          onChange={(e) => {
                            field.onChange(e);
                            handleRequirementsChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="tags" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Web, Mobile, AI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="dueDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
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
                            <FormItem>
                              <FormLabel>Link Title</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Figma Mockups" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`links.${index}.url`} render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="mt-7 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove Link</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-4 mb-4" onClick={() => append({ title: '', url: '' })}>
                    <Plus className="mr-2 h-4 w-4" /> Add Link
                  </Button>
                </TabsContent>
              </div>
            </Tabs>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="ghost" onClick={() => handleClose(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
