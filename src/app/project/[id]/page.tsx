
'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, Link as LinkIcon, Tag, ArrowLeft, Edit, Save, Plus, X, NotebookText, Trash2 } from 'lucide-react';
import Image from 'next/image';
import type { Project, Note } from '@/app/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ProfileContext } from '@/context/profile-context';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();

  const [ideas, setIdeas] = useLocalStorage<Project[]>('projectflow-ideas', []);
  const [completed, setCompleted] = useLocalStorage<Project[]>('projectflow-completed', []);
  const [project, setProject] = useState<Project | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { font, layout } = useContext(ProfileContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Project>>({});
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (id && isClient) {
      const allProjects = [...ideas, ...completed];
      const foundProject = allProjects.find(p => p.id === id);
      setProject(foundProject || null);
      if (foundProject) {
        setEditData({
          ...foundProject,
          tags: foundProject.tags.join(', '),
        });
      }
    }
  }, [id, ideas, completed, isClient]);

  const handleSave = () => {
    if (!project) return;
    
    const isCompletedProject = completed.some(p => p.id === project.id);
    const setTarget = isCompletedProject ? setCompleted : setIdeas;

    setTarget(prev => 
      prev.map(p => 
        p.id === project.id ? { ...p, ...editData, tags: (editData.tags as any).split(',').map((t: string) => t.trim()).filter(Boolean) } : p
      )
    );

    setIsEditing(false);
    toast({ title: "Project Saved!", description: "Your changes have been saved." });
  };
  
  const handleInputChange = (field: keyof Project, value: string) => {
    setEditData(prev => ({...prev, [field]: value}));
  }

  const handleAddNote = () => {
    if (!project || !newNote.trim()) return;

    const note: Note = {
      id: `note-${Date.now()}`,
      date: new Date().toISOString(),
      content: newNote.trim(),
    };
    
    const updatedProject = { ...project, notes: [...(project.notes || []), note]};

    const isCompletedProject = completed.some(p => p.id === project.id);
    const setTarget = isCompletedProject ? setCompleted : setIdeas;
    setTarget(prev => prev.map(p => p.id === project.id ? updatedProject : p));
    setNewNote('');
    toast({ title: "Note added!" });
  };
  
  const handleDeleteNote = (noteId: string) => {
    if (!project) return;
    
    const updatedProject = { ...project, notes: project.notes?.filter(n => n.id !== noteId) };
    const isCompletedProject = completed.some(p => p.id === project.id);
    const setTarget = isCompletedProject ? setCompleted : setIdeas;
    setTarget(prev => prev.map(p => p.id === project.id ? updatedProject : p));
    toast({ title: "Note deleted." });
  }

  if (!isClient || !project) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold mb-4">{!isClient ? 'Loading Project...' : '404 - Project Not Found'}</h1>
            {!isClient ? null :
              <>
                <p className="text-muted-foreground mb-8">The project you are looking for does not exist.</p>
                <Button onClick={() => router.push('/')}><ArrowLeft className="mr-2"/> Go Back Home</Button>
              </>
            }
        </div>
    );
  }
  
  const currentData = isEditing ? editData : project;
  const logoSrc = currentData.logo || `https://picsum.photos/seed/${project.id}/200/200`;
  const isCompleted = project.progress === 100 || completed.some(p => p.id === project.id);
  const tagList = Array.isArray(currentData.tags) ? currentData.tags : (currentData.tags as string || '').split(',').map(t => t.trim()).filter(Boolean);

  return (
      <div className={cn("flex flex-col min-h-screen", font === 'serif' ? 'font-serif' : 'font-sans')}>
         {/* Dummy header props as they are not used on this page */}
        <AppHeader searchTerm="" setSearchTerm={() => {}} onExport={() => {}} onImport={() => {}} />
        <main className={cn("flex-1 container mx-auto py-8 px-4 md:px-6", layout === 'compact' ? 'max-w-7xl' : 'max-w-5xl' )}>
          <div className="mb-6 flex justify-between items-center">
            <Button variant="ghost" onClick={() => router.push('/')}><ArrowLeft className="mr-2"/> Back to Dashboard</Button>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}><X className="mr-2"/>Cancel</Button>
                <Button onClick={handleSave}><Save className="mr-2"/>Save Changes</Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}><Edit className="mr-2"/>Edit Project</Button>
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
                            <Input value={editData.title} onChange={(e) => handleInputChange('title', e.target.value)} className="text-3xl font-headline font-bold h-auto p-0 border-0 shadow-none focus-visible:ring-0" />
                            <Textarea value={editData.description} onChange={(e) => handleInputChange('description', e.target.value)} className="text-lg text-muted-foreground mt-1 border-0 p-0 h-auto shadow-none focus-visible:ring-0" />
                          </div>
                        ) : (
                          <>
                            <h1 className="text-3xl font-headline font-bold">{currentData.title}</h1>
                            <p className="text-lg text-muted-foreground mt-1">{currentData.description}</p>
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
                        <Input value={editData.tags as string} onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))} placeholder="e.g. AI, Productivity" />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                           {(tagList.length > 0 && tagList[0]) ? tagList.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>) : <p className="text-sm text-muted-foreground">No tags.</p>}
                        </div>
                      )}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{isCompleted ? "Completed" : "In Progress"}</span>
                            <span className="text-lg font-bold text-primary">{project.progress}%</span>
                         </div>
                         <Progress value={project.progress} className="h-2" />
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
                          <Textarea value={editData.requirements} onChange={(e) => handleInputChange('requirements', e.target.value)} className="text-base min-h-48" />
                        ) : (
                          <div className="text-base text-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md border min-h-48">{currentData.requirements || 'No requirements specified.'}</div>
                        )}
                    </CardContent>
                </Card>

                {project.links && project.links.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">Useful Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {project.links.map((link, index) => (
                                <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-md bg-muted/50 border hover:bg-muted/80 transition-colors">
                                    <LinkIcon className="h-5 w-5 text-primary" />
                                    <div className="flex-1">
                                        <p className="font-semibold">{link.title}</p>
                                        <p className="text-sm text-muted-foreground break-all">{link.url}</p>
                                    </div>
                                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                                a
                            ))}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-xl"><NotebookText size={20}/> Project Log</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Textarea 
                             value={newNote}
                             onChange={(e) => setNewNote(e.target.value)}
                             placeholder="Add a new note about your progress..."
                           />
                           <div className="flex justify-end">
                            <Button onClick={handleAddNote} disabled={!newNote.trim()}><Plus className="mr-2"/>Add Note</Button>
                           </div>
                        </div>
                        <div className="space-y-4">
                            {(project.notes || []).length > 0 ? [...project.notes!].reverse().map(note => (
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
