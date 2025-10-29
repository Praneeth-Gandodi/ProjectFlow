'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Link as LinkIcon, Tag, ArrowLeft, Edit, Save, Plus, X, NotebookText, Trash2 } from 'lucide-react';
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

type EditableProject = Partial<Omit<Project, 'tags' | 'links'>> & {
  tags?: string | string[]; // allow editing as comma string or array
  links?: LinkType[];
  requirements?: string | string[]; // allow textarea string or array
};

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  // useParams may return strings or arrays depending on environment — normalize safely
  const rawId = (params as any)?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { toast } = useToast();

  const [ideas, setIdeas, isIdeasLoaded] = useLocalStorage<Project[]>('projectflow-ideas', INITIAL_IDEAS);
  const [completed, setCompleted, isCompletedLoaded] = useLocalStorage<Project[]>('projectflow-completed', INITIAL_COMPLETED);
  const [project, setProject] = useState<Project | null>(null);
  const { font, layout } = useContext(ProfileContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditableProject>({});
  const [newNote, setNewNote] = useState('');

  const isDataLoaded = isIdeasLoaded && isCompletedLoaded;

  useEffect(() => {
    if (!id || !isDataLoaded) return;

    const allProjects = [...(ideas || []), ...(completed || [])];
    const foundProject = allProjects.find(p => p.id === id) || null;
    setProject(foundProject);

    if (foundProject) {
      setEditData({
        ...foundProject,
        // store tags as comma string for editing convenience
        tags: Array.isArray(foundProject.tags) ? foundProject.tags.join(', ') : foundProject.tags,
        // requirements as textarea string if array
        requirements: Array.isArray(foundProject.requirements) ? foundProject.requirements.join('\n') : foundProject.requirements,
      });
    } else {
      setEditData({});
    }
  }, [id, ideas, completed, isDataLoaded]);

  const handleSave = () => {
    if (!project) return;

    const isCompletedProject = completed.some(p => p.id === project.id);
    const setTarget = isCompletedProject ? setCompleted : setIdeas;

    // Normalize tags into string[]
    const tagsArray: string[] = (() => {
      if (!editData.tags && Array.isArray(project.tags)) return project.tags;
      if (Array.isArray(editData.tags)) return editData.tags.map(t => String(t).trim()).filter(Boolean);
      if (typeof editData.tags === 'string') {
        return editData.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
      return Array.isArray(project.tags) ? project.tags : [];
    })();

    // Normalize requirements into string[] if possible
    let requirementsNormalized: string[] | string | undefined;
    if (editData.requirements === undefined || editData.requirements === null) {
      requirementsNormalized = project.requirements;
    } else if (Array.isArray(editData.requirements)) {
      requirementsNormalized = editData.requirements;
    } else {
      // string from textarea: split lines into array, but preserve single-line as array too
      const lines = (editData.requirements as string).split('\n').map(l => l.trim()).filter(Boolean);
      requirementsNormalized = lines.length > 0 ? lines : [];
    }

    const updatedProject: Project = {
      ...project,
      ...editData,
      // override these explicit fields to have correct types
      tags: tagsArray,
      links: editData.links ?? project.links ?? [],
      requirements: requirementsNormalized ?? project.requirements,
    } as Project;

    // Ensure id is preserved
    updatedProject.id = project.id;

    // Update storage
    setTarget(prev => prev.map(p => p.id === project.id ? updatedProject : p));
    // Update local state so the UI shows saved values immediately
    setProject(updatedProject);
    setEditData({
      ...updatedProject,
      tags: updatedProject.tags.join(', '),
      requirements: Array.isArray(updatedProject.requirements) ? updatedProject.requirements.join('\n') : updatedProject.requirements,
    });

    setIsEditing(false);
    toast({ title: "Project Saved!", description: "Your changes have been saved." });
  };

  const handleInputChange = (field: keyof Omit<EditableProject, 'links' | 'tags'>, value: string | number) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

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
    setProject(updatedProject);
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

  const handleLinkChange = (index: number, field: keyof LinkType, value: string) => {
    const baseLinks = (editData.links ?? project?.links ?? []) as LinkType[];
    const newLinks = baseLinks.map((l, i) => i === index ? { ...l, [field]: value } : l);
    setEditData(prev => ({ ...prev, links: newLinks }));
  };

  const handleAddLink = () => {
    const baseLinks = (editData.links ?? project?.links ?? []) as LinkType[];
    const newLinks = [...baseLinks, { id: `new-link-${Date.now()}`, title: '', url: '', description: '' } as LinkType];
    setEditData(prev => ({ ...prev, links: newLinks }));
  };

  const handleDeleteLink = (index: number) => {
    const baseLinks = (editData.links ?? project?.links ?? []) as LinkType[];
    const newLinks = baseLinks.filter((_, i) => i !== index);
    setEditData(prev => ({ ...prev, links: newLinks }));
  };

  if (!isDataLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">Loading Project...</h1>
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

  const currentData: any = isEditing ? editData : project;
  const logoSrc = (currentData && (currentData.logo || project?.logo)) || `https://picsum.photos/seed/${project.id}/200/200`;

  const tagList: string[] = (() => {
    if (Array.isArray(currentData.tags)) return currentData.tags;
    if (typeof currentData.tags === 'string') {
      return currentData.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    return [];
  })();

  const links = isEditing ? (editData.links || []) : (project.links || []);

  const requirementsText = (() => {
    const req = currentData.requirements;
    if (Array.isArray(req)) return req.join('\n');
    if (typeof req === 'string') return req;
    return '';
  })();

  return (
    <div className={cn("flex flex-col min-h-screen", font === 'serif' ? 'font-serif' : 'font-sans')}>
      {/* Header: reuse AppHeader (dummy props as not needed here) */}
      <AppHeader searchTerm="" setSearchTerm={() => { }} onExport={() => { }} onImport={() => { }} />
      <main className={cn("flex-1 container mx-auto py-8 px-4 md:px-6", layout === 'compact' ? 'max-w-7xl' : 'max-w-5xl')}>
        <div className="mb-6 flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.push('/')}><ArrowLeft className="mr-2" /> Back to Dashboard</Button>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                // cancel edits: revert editData back to project
                setEditData({
                  ...project,
                  tags: Array.isArray(project.tags) ? project.tags.join(', ') : project.tags,
                  requirements: Array.isArray(project.requirements) ? project.requirements.join('\n') : project.requirements,
                });
                setIsEditing(false);
              }}><X className="mr-2" />Cancel</Button>
              <Button onClick={handleSave}><Save className="mr-2" />Save Changes</Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}><Edit className="mr-2" />Edit Project</Button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <Image
                  src={logoSrc}
                  alt={`${project.title} logo`}
                  width={400}
                  height={400}
                  className="rounded-lg border object-cover w-full aspect-square"
                />
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input value={editData.title ?? ''} onChange={(e) => handleInputChange('title', e.target.value)} className="text-3xl font-headline font-bold h-auto p-0 border-0 shadow-none focus-visible:ring-0" />
                    <Textarea value={editData.description ?? ''} onChange={(e) => handleInputChange('description', e.target.value)} className="text-lg text-muted-foreground mt-1 border-0 p-0 h-auto shadow-none focus-visible:ring-0" />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-headline font-bold">{project.title}</h1>
                    <p className="text-lg text-muted-foreground mt-1">{project.description}</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-xl"><Tag size={20} /> Tags</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Input value={(editData.tags as string) ?? ''} onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))} placeholder="e.g. AI, Productivity" />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(tagList.length > 0 && tagList[0]) ? tagList.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>) : <p className="text-sm text-muted-foreground">No tags.</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-headline text-xl">Progress</CardTitle>
                <span className="text-lg font-bold text-primary">{project.progress ?? 0}%</span>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{project.progress === 100 ? "Completed" : "In Progress"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea value={(editData.requirements as string) ?? ''} onChange={(e) => handleInputChange('requirements', e.target.value)} className="text-base min-h-48" />
                ) : (
                  <div className="text-base text-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md border min-h-48">{requirementsText || 'No requirements specified.'}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-xl">Useful Links</CardTitle>
                {isEditing && <Button size="sm" variant="outline" onClick={handleAddLink}><Plus className="mr-2 h-4 w-4" /> Add Link</Button>}
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditing ? (
                  (links as LinkType[]).map((link, index) => (
                    <div key={link.id || index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border">
                      <LinkIcon className="h-5 w-5 text-primary" />
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          placeholder="Link Title"
                          value={link.title}
                          onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                        />
                        <Input
                          placeholder="https://example.com"
                          value={link.url}
                          onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteLink(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                ) : (
                  (links as LinkType[]).map((link, index) => (
                    <a key={link.id || index} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-md bg-muted/50 border hover:bg-muted/80 transition-colors">
                      <LinkIcon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold">{link.title}</p>
                        <p className="text-sm text-muted-foreground break-all">{link.url}</p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </a>
                  ))
                )}
                {((links as LinkType[]).length === 0) && !isEditing && <p className="text-sm text-muted-foreground text-center py-4">No links added.</p>}
              </CardContent>
            </Card>

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
        </div>
      </main>
    </div>
  );
}
