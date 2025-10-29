'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Link as LinkIcon, Tag, ArrowLeft, Edit, Save, Plus, X, NotebookText, Trash2, CheckSquare, Square } from 'lucide-react';
import Image from 'next/image';
import type { Project, Note, Link as LinkType } from '@/app/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ProfileContext } from '@/context/profile-context';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { INITIAL_IDEAS, INITIAL_COMPLETED } from '@/app/data';
import { Skeleton } from '@/components/ui/skeleton';

type Requirement = {
  id: string;
  text: string;
  completed: boolean;
};

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = (params as any)?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { toast } = useToast();

  const [ideas, setIdeas, isIdeasLoaded] = useLocalStorage<Project[]>('projectflow-ideas', INITIAL_IDEAS);
  const [completed, setCompleted, isCompletedLoaded] = useLocalStorage<Project[]>('projectflow-completed', INITIAL_COMPLETED);

  const [project, setProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Editing state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editRequirements, setEditRequirements] = useState<Requirement[]>([]);
  const [editLinks, setEditLinks] = useState<LinkType[]>([]);
  
  const [newNote, setNewNote] = useState('');

  const { font, layout } = useContext(ProfileContext);
  const isDataLoaded = isIdeasLoaded && isCompletedLoaded;

  // Function to transform string requirements to object requirements
  const transformRequirements = (reqs: string | string[] | Requirement[] | undefined): Requirement[] => {
    if (!reqs) return [];
    if (typeof reqs === 'string') {
        return reqs.split('\n').map((r, i) => ({ id: `req-${i}-${Date.now()}`, text: r.replace(/^\d+\.\s*/, '').trim(), completed: false })).filter(r => r.text);
    }
    if (Array.isArray(reqs)) {
        return reqs.map((r, i) => {
            if (typeof r === 'string') {
                return { id: `req-${i}-${Date.now()}`, text: r.replace(/^\d+\.\s*/, '').trim(), completed: false };
            }
            // It's already a Requirement object
            return r;
        }).filter(r => r.text);
    }
    return [];
  };

  useEffect(() => {
    if (!id || !isDataLoaded) return;

    const allProjects = [...(ideas || []), ...(completed || [])];
    const foundProject = allProjects.find(p => p.id === id) || null;
    setProject(foundProject);

  }, [id, ideas, completed, isDataLoaded]);

  // Sync state when editing is toggled or project loads
  useEffect(() => {
    if (project) {
        setEditTitle(project.title);
        setEditDescription(project.description);
        setEditTags(project.tags?.join(', ') || '');
        setEditRequirements(transformRequirements(project.requirements));
        setEditLinks(project.links || []);
    }
  }, [project, isEditing]);


  const handleSave = () => {
    if (!project) return;

    const updatedProject: Project = {
      ...project,
      title: editTitle,
      description: editDescription,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      requirements: editRequirements,
      links: editLinks,
    };

    const isCompletedProject = completed.some(p => p.id === project.id);
    const setTarget = isCompletedProject ? setCompleted : setIdeas;

    setTarget(prev => prev.map(p => (p.id === project.id ? updatedProject : p)));
    setProject(updatedProject);
    setIsEditing(false);
    toast({ title: "Project Saved!", description: "Your changes have been saved." });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // State will be reset by the useEffect that depends on `isEditing`
  };
  
  // Note handlers
  const handleAddNote = () => {
    if (!project || !newNote.trim()) return;

    const note: Note = {
      id: `note-${Date.now()}`,
      date: new Date().toISOString(),
      content: newNote.trim(),
    };

    const updatedProject: Project = {
      ...project,
      notes: [...(project.notes || []), note],
    };

    const isCompletedProject = completed.some(p => p.id === project.id);
    const setTarget = isCompletedProject ? setCompleted : setIdeas;
    setTarget(prev => prev.map(p => p.id === project.id ? updatedProject : p));
    setProject(updatedProject); // update local state to re-render
    setNewNote('');
    toast({ title: "Note added!" });
  };

  const handleDeleteNote = (noteId: string) => {
    if (!project) return;

    const updatedNotes = (project.notes || []).filter(n => n.id !== noteId);
    const updatedProject: Project = { ...project, notes: updatedNotes };

    const isCompletedProject = completed.some(p => p.id === project.id);
    const setTarget = isCompletedProject ? setCompleted : setIdeas;
    setTarget(prev => prev.map(p => p.id === project.id ? updatedProject : p));
    setProject(updatedProject);
    toast({ title: "Note deleted." });
  };

  if (!isDataLoaded) {
    return (
      <div className={cn("flex flex-col min-h-screen", font === 'serif' ? 'font-serif' : 'font-sans')}>
        <AppHeader searchTerm="" setSearchTerm={() => {}} onExport={() => {}} onImport={() => {}} />
        <main className={cn("flex-1 container mx-auto py-8 px-4 md:px-6", layout === 'compact' ? 'max-w-4xl' : 'max-w-3xl')}>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-8">
            <Skeleton className="w-full h-72" />
            <Skeleton className="w-full h-48" />
            <Skeleton className="w-full h-48" />
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">404 - Project Not Found</h1>
        <p className="text-muted-foreground mb-8">The project you are looking for does not exist.</p>
        <Button onClick={() => router.push('/')}><ArrowLeft className="mr-2" /> Go Back Home</Button>
      </div>
    );
  }

  const logoSrc = project.logo || `https://picsum.photos/seed/${project.id}/400/400`;

  return (
    <div className={cn("flex flex-col min-h-screen", font === 'serif' ? 'font-serif' : 'font-sans')}>
      <AppHeader searchTerm="" setSearchTerm={() => {}} onExport={() => {}} onImport={() => {}} />
      <main className={cn("flex-1 container mx-auto py-8 px-4 md:px-6", layout === 'compact' ? 'max-w-4xl' : 'max-w-3xl')}>
        <div className="mb-6 flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.push('/')}><ArrowLeft className="mr-2" /> Back to Dashboard</Button>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}><X className="mr-2" />Cancel</Button>
              <Button onClick={handleSave}><Save className="mr-2" />Save Changes</Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}><Edit className="mr-2" />Edit Project</Button>
          )}
        </div>

        <div className="space-y-8">
            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row items-start gap-8">
                <Image
                    src={logoSrc}
                    alt={`${project.title} logo`}
                    width={150}
                    height={150}
                    className="rounded-lg border object-cover w-36 h-36 md:w-40 md:h-40 flex-shrink-0"
                />
                <div className="flex-grow space-y-2">
                    {isEditing ? (
                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-4xl font-headline font-bold h-auto p-0 border-0 shadow-none focus-visible:ring-0" />
                    ) : (
                        <h1 className="text-4xl font-headline font-bold">{project.title}</h1>
                    )}

                    {isEditing ? (
                         <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="text-lg text-muted-foreground mt-1 border-0 p-0 h-auto shadow-none focus-visible:ring-0" />
                    ) : (
                        <p className="text-lg text-muted-foreground">{project.description}</p>
                    )}

                    {isEditing ? (
                        <div className='pt-2'>
                          <label className='text-sm font-medium text-muted-foreground'>Tags</label>
                          <Input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="e.g. AI, Productivity" />
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {project.tags?.length > 0 ? (
                                project.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)
                            ) : (
                                <p className="text-sm text-muted-foreground">No tags.</p>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* --- REQUIREMENTS --- */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-xl">
                        <CheckSquare size={20} /> Requirements
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {editRequirements.map((req, index) => (
                        <div key={req.id} className="flex items-center gap-3 group">
                            {isEditing ? (
                                <>
                                    <Input 
                                        value={req.text}
                                        onChange={(e) => {
                                            const newReqs = [...editRequirements];
                                            newReqs[index].text = e.target.value;
                                            setEditRequirements(newReqs);
                                        }}
                                        className="flex-grow"
                                    />
                                    <Button variant="ghost" size="icon" className='text-destructive' onClick={() => setEditRequirements(editRequirements.filter(r => r.id !== req.id))}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <p className='flex-grow py-2'>{req.text}</p>
                            )}
                        </div>
                    ))}
                    {isEditing && (
                        <div className="flex justify-start pt-2">
                            <Button variant="outline" size="sm" onClick={() => setEditRequirements([...editRequirements, {id: `req-new-${Date.now()}`, text: '', completed: false}])}>
                                <Plus className="mr-2 h-4 w-4" /> Add Requirement
                            </Button>
                        </div>
                    )}
                    {editRequirements.length === 0 && !isEditing && <p className="text-sm text-muted-foreground text-center py-4">No requirements specified.</p>}
                </CardContent>
            </Card>


            {/* --- USEFUL LINKS --- */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-xl flex items-center gap-2"><LinkIcon size={20} /> Useful Links</CardTitle>
                {isEditing && <Button size="sm" variant="outline" onClick={() => setEditLinks([...editLinks, {id: `new-link-${Date.now()}`, title: '', url: ''}])}><Plus className="mr-2 h-4 w-4" /> Add Link</Button>}
              </CardHeader>
              <CardContent className="space-y-3">
                {editLinks.map((link, index) => (
                    <div key={link.id || index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border group">
                      <LinkIcon className="h-5 w-5 text-primary flex-shrink-0" />
                      {isEditing ? (
                        <>
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                              placeholder="Link Title"
                              value={link.title}
                              onChange={(e) => {
                                const newLinks = [...editLinks];
                                newLinks[index].title = e.target.value;
                                setEditLinks(newLinks);
                              }}
                            />
                            <Input
                              placeholder="https://example.com"
                              value={link.url}
                              onChange={(e) => {
                                const newLinks = [...editLinks];
                                newLinks[index].url = e.target.value;
                                setEditLinks(newLinks);
                              }}
                            />
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setEditLinks(editLinks.filter((_, i) => i !== index))}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 group-hover:underline">
                                <p className="font-semibold">{link.title}</p>
                                <p className="text-sm text-muted-foreground break-all">{link.url}</p>
                            </a>
                            <ExternalLink className="h-5 w-5 text-muted-foreground" />
                        </>
                      )}
                    </div>
                ))}
                {editLinks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No links added.</p>}
              </CardContent>
            </Card>

            {/* --- PROJECT LOG --- */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-xl"><NotebookText size={20} /> Project Log</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a new note about your progress..."
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}><Plus className="mr-2" />Add Note</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {(project.notes || []).length > 0 ? [...project.notes!].slice().reverse().map(note => (
                    <div key={note.id} className="flex gap-3 text-sm">
                      <p className="font-mono text-muted-foreground whitespace-nowrap text-xs pt-1">{format(new Date(note.date), "MMM dd, yyyy")}</p>
                      <div className="flex-1 bg-muted/50 p-3 rounded-md border relative group">
                        <p className="whitespace-pre-wrap">{note.content}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )) : <p className="text-sm text-muted-foreground text-center py-4">No notes added yet.</p>}
                </div>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
