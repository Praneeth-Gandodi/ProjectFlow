
'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Link as LinkIcon,
  ArrowLeft,
  Plus,
  Trash2,
  BookOpen,
  GitCommit,
  Globe,
  Edit3,
  Lightbulb,
} from 'lucide-react';
import type { Course, Note, Link as LinkType } from '@/app/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ProfileContext } from '@/context/profile-context';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { INITIAL_COURSES } from '@/app/data';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { TechLogo } from '@/components/tech-logo';

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = (params as any)?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { toast } = useToast();

  const [courses, setCourses, isCoursesLoaded] = useLocalStorage<Course[]>('projectflow-courses', INITIAL_COURSES);
  
  const [course, setCourse] = useState<Course | null>(null);

  // Editing state
  const [editLinks, setEditLinks] = useState<LinkType[]>([]);
  const [editReason, setEditReason] = useState('');
  const [newNote, setNewNote] = useState('');

  // Modals
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);

  const { font } = useContext(ProfileContext);

  const validateUrl = (url: string): boolean => {
    if (!url || !url.trim()) return false;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };
  
  useEffect(() => {
    if (!id || !isCoursesLoaded) return;
    const foundCourse = courses.find(c => c.id === id) || null;
    setCourse(foundCourse);
  }, [id, courses, isCoursesLoaded]);

  useEffect(() => {
    if (course) {
      setEditLinks(course.links || []);
      setEditReason(course.reason || '');
    }
  }, [course]);

  const persistCourse = (updatedCourse: Course) => {
    if (!updatedCourse) return;
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    setCourse(updatedCourse); // Keep local component state in sync
  };
  
  const handleSaveReason = () => {
    if (!course) return;
    const updatedCourse = { ...course, reason: editReason };
    persistCourse(updatedCourse);
    toast({ title: 'Reason Saved', description: 'Your motivation has been updated.' });
  }

  // --- Link Handlers ---
  const persistLinksQuick = (linksArr: LinkType[]) => {
    setEditLinks(linksArr);
    if (!course) return;
    const updatedCourse = { ...course, links: linksArr };
    persistCourse(updatedCourse);
  };

  const handleAddLink = (link: LinkType) => {
    const updatedLinks = [...editLinks, { ...link, id: `link-${Date.now()}` }];
    persistLinksQuick(updatedLinks);
    toast({ title: 'Link Added!' });
  };
  
  const handleUpdateLink = (updatedLink: LinkType) => {
    const updatedLinks = editLinks.map(l => l.id === updatedLink.id ? updatedLink : l);
    persistLinksQuick(updatedLinks);
    toast({ title: 'Link Updated!' });
  };
  
  const handleDeleteLink = (linkId: string) => {
    const updatedLinks = editLinks.filter(l => l.id !== linkId);
    persistLinksQuick(updatedLinks);
    toast({ title: 'Link Removed' });
  };

  // --- Note Handlers ---
  const handleAddNote = () => {
    if (!course || !newNote.trim()) return;
    const note: Note = { 
      id: `note-${Date.now()}`, 
      date: new Date().toISOString(), 
      content: newNote.trim() 
    };

    const updatedCourse = { ...course, notes: [...(course.notes || []), note] };
    persistCourse(updatedCourse);

    setNewNote('');
    toast({ 
      title: 'Note added!', 
      description: 'Your note has been saved to the course log.',
    });
  };

  const handleDeleteNote = (noteId: string) => {
    if (!course) return;
    const updatedNotes = (course.notes || []).filter(n => n.id !== noteId);
    const updatedCourse = { ...course, notes: updatedNotes };
    persistCourse(updatedCourse);
    toast({ title: 'Note deleted' });
  };

  // Loading skeleton
  if (!isCoursesLoaded) {
    return (
      <div className={cn('flex flex-col min-h-screen', font === 'serif' ? 'font-serif' : 'font-sans')}>
        <AppHeader searchTerm="" setSearchTerm={() => {}} onExport={() => {}} onImport={() => {}} />
        <main className="flex-1 w-full min-h-screen py-8 px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <Skeleton className="w-full h-80 rounded-xl" />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="w-full h-96 rounded-xl" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
        <p className="text-muted-foreground mb-8">The course you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/')}><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col min-h-screen', font === 'serif' ? 'font-serif' : 'font-sans')}>
      <AppHeader searchTerm="" setSearchTerm={() => {}} onExport={() => {}} onImport={() => {}} />

      <main className="flex-1 w-full min-h-screen py-6 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.push('/')} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> 
              Back to Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-center">
                    <TechLogo course={course} className="w-48 h-48" />
                  </div>
                  <h1 className="text-3xl font-bold text-center">{course.name}</h1>
                </CardContent>
              </Card>
              
               <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Why I'm Learning This
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="Describe your motivation for this course..."
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end mt-2">
                    <Button onClick={handleSaveReason} size="sm">Save Reason</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Links Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5" />
                      Course Links
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingLink(null); setShowAddLinkModal(true); }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {editLinks.length > 0 ? editLinks.map(link => (
                      <motion.div
                        key={link.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                      >
                         <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            {validateUrl(link.url) ? (
                              <img src={`https://www.google.com/s2/favicons?sz=64&domain=${new URL(link.url).hostname}`} alt="" className="w-5 h-5" />
                            ) : (
                              <Globe className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{link.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                          </div>
                        </a>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingLink(link); setShowAddLinkModal(true); }} className="h-7 w-7">
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteLink(link.id!)} className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">No links yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note about your progress, a code snippet, or a key takeaway..."
                      className="min-h-[120px]"
                    />
                    <div className="flex justify-end mt-2">
                      <Button onClick={handleAddNote} disabled={!newNote.trim()} size="sm">
                        <GitCommit className="mr-2 h-4 w-4" />
                        Commit Note
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(course.notes ?? []).length > 0 ? (
                      [...course.notes].slice().reverse().map((note) => (
                         <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-4 text-sm group"
                        >
                          <div className="flex-shrink-0 w-24 text-right">
                            <div className="font-mono text-muted-foreground text-xs pt-1">
                              {format(new Date(note.date), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(note.date), 'HH:mm')}
                            </div>
                          </div>
                          <div className="flex-1 bg-muted/50 p-4 rounded-lg border relative min-h-[80px]">
                            <p className="whitespace-pre-wrap text-sm pr-10">{note.content}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-3 right-3 h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">No log entries yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Link Modal */}
      <AnimatePresence>
        {showAddLinkModal && (
          <LinkModal
            isOpen={showAddLinkModal}
            setIsOpen={setShowAddLinkModal}
            onSave={(link) => editingLink ? handleUpdateLink(link) : handleAddLink(link)}
            link={editingLink}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Separate modal component for links to manage its own form state
function LinkModal({
  isOpen,
  setIsOpen,
  onSave,
  link,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (link: LinkType) => void;
  link: LinkType | null;
}) {
  const [title, setTitle] = useState(link?.title || '');
  const [url, setUrl] = useState(link?.url || '');
  const [description, setDescription] = useState(link?.description || '');
  const { toast } = useToast();

  const validateUrl = (url: string): boolean => {
    if (!url || !url.trim()) return false;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast({ variant: 'destructive', title: 'Title is required' });
      return;
    }
    if (!validateUrl(url)) {
      toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please enter a full URL (e.g., https://example.com)' });
      return;
    }
    onSave({ id: link?.id, title, url, description });
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle>{link ? 'Edit Link' : 'Add New Link'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label>Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Official Documentation" />
            </div>
            <div className="space-y-2">
              <label>URL</label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
            </div>
            <div className="space-y-2">
              <label>Description (Optional)</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short note about this link" />
            </div>
          </CardContent>
          <div className="p-4 pt-0 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Link</Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
