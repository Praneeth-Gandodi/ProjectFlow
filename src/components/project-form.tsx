'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Project } from '@/app/types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProjectFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  project: (Project & { source?: 'ideas' | 'completed' }) | null;
  setIdeas: React.Dispatch<React.SetStateAction<Project[]>>;
  setCompleted: React.Dispatch<React.SetStateAction<Project[]>>;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  requirements: z.string().optional(),
  logo: z.string().optional(),
  tags: z.string().optional(),
  links: z.array(z.object({
    title: z.string().min(1, 'Link title is required'),
    url: z.string().url('Link URL must be a valid URL'),
  })).optional(),
});

type ProjectFormData = z.infer<typeof formSchema>;

const getDraftKey = (projectId: string | null) => `project_draft_${projectId || 'new'}`;

export function ProjectForm({ isOpen, setIsOpen, project, setIdeas, setCompleted }: ProjectFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const draftKey = getDraftKey(project?.id ?? null);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: project ? {
        title: project.title,
        description: project.description,
        requirements: project.requirements,
        logo: project.logo,
        tags: project.tags?.join(', '),
        links: project.links || [],
      } : {
        title: '',
        description: '',
        requirements: '1. ',
        logo: `https://picsum.photos/seed/${Date.now()}/200/200`,
        tags: '',
        links: [],
      }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'links',
  });

  useEffect(() => {
    if (isOpen) {
        let values: ProjectFormData | null = null;
        if (typeof window !== 'undefined') {
          const savedDraft = localStorage.getItem(draftKey);
          if (savedDraft) {
            try {
              values = JSON.parse(savedDraft);
            } catch (e) {
              console.error("Failed to parse project draft", e);
            }
          }
        }
        
        let initialValues: ProjectFormData;
        if(values) {
          initialValues = values;
        } else if (project) {
          initialValues = {
            title: project.title,
            description: project.description || '',
            requirements: project.requirements,
            logo: project.logo,
            tags: project.tags?.join(', '),
            links: project.links || [],
          };
        } else {
          const defaultLogo = `https://picsum.photos/seed/${Date.now()}/200/200`;
          initialValues = {
            title: '',
            description: '',
            requirements: '1. ',
            logo: defaultLogo,
            tags: '',
            links: [],
          };
        }
        form.reset(initialValues);
        setLogoPreview(initialValues.logo || null);
    }
  }, [project, isOpen, form, draftKey]);

  useEffect(() => {
    if (!isOpen) return;
    const subscription = form.watch((value) => {
       if (Object.values(form.formState.dirtyFields).some(Boolean)) {
        localStorage.setItem(draftKey, JSON.stringify(value));
       }
    });
    return () => subscription.unsubscribe();
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
        form.setValue('logo', dataUrl, { shouldDirty: true });
        setLogoPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRequirementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;
    const lines = value.split('\n');
    const lastLine = lines[lines.length - 1];

    if (lastLine.match(/^\d+\.\s*$/) && lines.length > 1 && lines[lines.length - 2].trim() !== '') {
        value = lines.slice(0, -1).join('\n');
    } else if (e.nativeEvent instanceof InputEvent && (e.nativeEvent.inputType === 'insertLineBreak' || e.nativeEvent.data === null)) {
      const lastLineNumberMatch = lines[lines.length - 2]?.match(/^(\d+)\./);
      if (lastLineNumberMatch) {
          const nextNumber = parseInt(lastLineNumberMatch[1], 10) + 1;
          if(lines[lines.length-1].trim() === ''){
               lines[lines.length-1] = `${nextNumber}. `;
               value = lines.join('\n');
          }
      }
    }
    form.setValue('requirements', value, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = (values: ProjectFormData) => {
    const setTarget = project?.source === 'completed' ? setCompleted : setIdeas;
    const tags = values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    if (project) {
      // Editing existing project
      const updatedProject: Project = { 
          ...project, 
          ...values,
          description: values.description || '',
          logo: values.logo || project.logo,
          tags,
          links: values.links || [],
      };
      setTarget(prev => prev.map(p => (p.id === project.id ? updatedProject : p)));
      toast({ title: 'Project updated!' });
    } else {
      // Adding new project
      const newProject: Project = {
        id: `idea-${Date.now()}`,
        title: values.title,
        description: values.description || '',
        logo: values.logo || `https://picsum.photos/seed/${Date.now()}/200/200`,
        requirements: values.requirements || '',
        links: values.links || [],
        progress: 0,
        tags,
      };
      setIdeas(prev => [newProject, ...prev]);
      toast({ title: 'New project added!' });
    }
    localStorage.removeItem(draftKey);
    setIsOpen(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      if (Object.values(form.formState.dirtyFields).some(Boolean)) {
        const confirmation = confirm("You have unsaved changes. Are you sure you want to close? Your draft will be available when you re-open the form.");
        if (!confirmation) {
          return; // User canceled, do not close
        }
      }
    }
    
    // No dirty fields or user confirmed, so close the dialog
    setIsOpen(open);
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
                   <div className="flex items-center gap-4 pt-4 pb-6">
                    {logoPreview && (
                      <Image src={logoPreview} alt="Logo preview" width={80} height={80} className="rounded-lg border object-cover"/>
                    )}
                    <div className="flex-1 space-y-2">
                      <FormLabel>Logo</FormLabel>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={handleLogoUploadClick}>
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
                            onChange={handleRequirementsChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pb-2">
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
                  </div>
                </TabsContent>

                <TabsContent value="links" className="px-2">
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
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
