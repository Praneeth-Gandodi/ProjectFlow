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
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Course, Link as LinkType } from '@/app/types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CourseFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  course: Course | null;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  onUpdateCourse: (course: Course) => void;
}

const linkSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Link title is required'),
  url: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  links: z.array(linkSchema).optional(),
  logo: z.string().optional(),
});

type CourseFormData = z.infer<typeof formSchema>;

export function CourseForm({ isOpen, setIsOpen, course, setCourses, onUpdateCourse }: CourseFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', links: [], logo: '' }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "links"
  });

  useEffect(() => {
    if (isOpen) {
      if (course) {
        form.reset({
          name: course.name,
          links: course.links || [],
          logo: course.logo || '',
        });
        setLogoPreview(course.logo || null);
      } else {
        form.reset({ name: '', links: [], logo: '' });
        setLogoPreview(null);
      }
    }
  }, [course, isOpen, form]);

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

  const onSubmit = (values: CourseFormData) => {
    if (course) {
      // Editing existing course
      const updatedCourse: Course = {
        ...course,
        name: values.name,
        links: values.links,
        logo: values.logo,
      };
      onUpdateCourse(updatedCourse);
      toast({ title: 'Course updated!' });
    } else {
      // Adding new course
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        name: values.name,
        completed: false,
        links: values.links,
        logo: values.logo,
      };
      setCourses(prev => [newCourse, ...prev]);
      toast({ title: 'New course added!' });
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline">{course ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          <DialogDescription>
            {course ? 'Make changes to your course.' : 'Add a new course or learning resource to your list.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  {course && <TabsTrigger value="logo">Custom Logo</TabsTrigger>}
              </TabsList>
              <TabsContent value="details" className="pt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., The Complete JavaScript Course" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Links</FormLabel>
                  <div className="mt-2 space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-end gap-2 p-3 bg-muted/50 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 flex-grow">
                            <FormField
                            control={form.control}
                            name={`links.${index}.title`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="text-xs">Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Course Website" {...field} />
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
                                <FormLabel className="text-xs">URL (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ title: '', url: '' })}>
                      <Plus className="mr-2 h-4 w-4" /> Add Link
                    </Button>
                  </div>
                </div>
              </TabsContent>
               <TabsContent value="logo" className="pt-4 space-y-4">
                 {course && (
                    <div className="flex items-center gap-4 pt-4 pb-6">
                    {logoPreview && (
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        width={80}
                        height={80}
                        className="rounded-lg border object-contain"
                        unoptimized
                      />
                    )}

                    <div className="flex-1 space-y-2">
                      <FormLabel>Custom Logo</FormLabel>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={handleLogoUploadClick}>
                          <Upload className="mr-2 h-4 w-4" /> Upload
                        </Button>

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
                 )}
               </TabsContent>
            </Tabs>

            <DialogFooter className="pt-4 border-t">
               <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
