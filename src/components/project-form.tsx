
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

interface ProjectFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  project: (Project & { source?: 'ideas' | 'completed' }) | null;
  setIdeas: React.Dispatch<React.SetStateAction<Project[]>>;
  onUpdateProject: (updatedProject: Project) => void;
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

/** Convert Project.requirements (string | string[] | undefined) -> single multiline string for form */
const requirementsToString = (req: Project['requirements']): string => {
  if (!req) return '';
  if (Array.isArray(req)) return req.join('\n');
  return String(req);
};

/** Convert multiline string -> Project.requirements (string | string[]) */
const requirementsFromString = (s?: string): string | string[] => {
  if (!s) return '';
  const lines = s.split(/\r?\n/).map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
  if (lines.length <= 1) {
    return lines[0] ?? '';
  }
  return lines;
};

export function ProjectForm({ isOpen, setIsOpen, project, setIdeas, onUpdateProject }: ProjectFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const draftKey = getDraftKey(project?.id ?? null);

  // initial default values
  const computeDefaults = (): ProjectFormData => {
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
    const defaultLogo = `https://picsum.photos/seed/${Date.now()}/200/200`;
    return {
      title: '',
      description: '',
      requirements: '1. ',
      logo: defaultLogo,
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

  // Reset form when dialog opens (load draft if present)
  useEffect(() => {
    if (!isOpen) return;

    let initialValues: ProjectFormData = computeDefaults();

    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft) as Partial<ProjectFormData>;
          // merge parsed with defaults (parsed may omit fields)
          initialValues = { ...initialValues, ...parsed, dueDate: parsed.dueDate ? new Date(parsed.dueDate) : undefined };
        } catch (e) {
          console.error('Failed to parse project draft', e);
        }
      }
    }

    form.reset(initialValues);
    setLogoPreview(initialValues.logo ?? null);
    // ensure field array has values (react-hook-form needs it)
    if (!initialValues.links || initialValues.links.length === 0) {
      // don't append here; field array will handle append when user adds
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, project, draftKey]);

  // Auto-save draft while the dialog is open (debounced-ish by controlled updates)
  useEffect(() => {
    if (!isOpen) return;
    const subscription = form.watch((value) => {
      // Save draft only when there are dirty fields
      if (Object.keys(form.formState.dirtyFields).length > 0) {
        try {
          localStorage.setItem(draftKey, JSON.stringify(value));
        } catch (e) {
          console.error('Failed to save draft', e);
        }
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, draftKey, isOpen]);

  const handleLogoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        form.setValue('logo', dataUrl, { shouldDirty: true, shouldValidate: true });
        setLogoPreview(dataUrl); // This line fixes the bug
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRequirementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // keep the raw text for the form; client-side helper can auto-number if you want
    form.setValue('requirements', e.target.value, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = (values: ProjectFormData) => {
    const tags = values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    if (project) {
      // Editing existing project
      const pAny = { ...project } as any;
      const updatedProject: Project = {
        ...project,
        title: values.title,
        description: values.description || '',
        logo: values.logo || project.logo,
        requirements: requirementsFromString(values.requirements),
        links: values.links || [],
        tags,
        repoUrl: values.repoUrl || pAny.repoUrl || pAny.githubUrl || pAny.repository || '',
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };
      onUpdateProject(updatedProject);
      toast({ title: 'Project updated!' });
    } else {
      // Adding new project
      const newProject: Project = {
        id: `idea-${Date.now()}`,
        title: values.title,
        description: values.description || '',
        logo: values.logo || `https://picsum.photos/seed/${Date.now()}/200/200`,
        requirements: requirementsFromString(values.requirements),
        links: values.links || [],
        progress: 0,
        tags,
        repoUrl: values.repoUrl || '',
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };
      setIdeas(prev => [newProject, ...prev]);
      toast({ title: 'New project added!' });
    }
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
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
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
                          <Textarea placeholder="Describe the project..." {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* GitHub Repository URL Field */}
                  <FormField
                    control={form.control}
                    name="repoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Github className="h-4 w-4" />
                          GitHub Repository URL
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://github.com/username/repository" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-4 pt-4 pb-6">
                    {logoPreview && (
                      <Image
                        src={
                          logoPreview.startsWith('data:') || logoPreview.startsWith('http')
                            ? logoPreview
                            : '/placeholder.png'
                        }
                        alt="Logo preview"
                        width={80}
                        height={80}
                        className="rounded-lg border object-cover"
                        unoptimized
                      />
                    )}

                    <div className="flex-1 space-y-2">
                      <FormLabel>Logo</FormLabel>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={handleLogoUploadClick}>
                          <Upload className="mr-2 h-4 w-4" /> Upload
                        </Button>

                        {/* native file input (hidden) */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />

                        <FormField
                          control={form.control}
                          name="logo"
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormControl>
                                <Input placeholder="Or paste image URL" {...field} onChange={(e) => { field.onChange(e); setLogoPreview(e.target.value); }} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-6 px-2">
                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
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
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Web, Mobile, AI" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
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
                    )}
                  />
                </TabsContent>

                <TabsContent value="links" className="px-2">
                  <div className="space-y-4">
                    {fields.map((f, index) => (
                      <div key={f.id} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`links.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Link Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Figma Mockups" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`links.${index}.url`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
