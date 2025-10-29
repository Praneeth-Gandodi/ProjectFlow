'use client';

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Link as LinkIcon, ArrowLeft, Save, Plus, X, NotebookText, Trash2, CheckSquare } from 'lucide-react';
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

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = (params as any)?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { toast } = useToast();

  const [ideas, setIdeas, isIdeasLoaded] = useLocalStorage<Project[]>('projectflow-ideas', INITIAL_IDEAS);
  const [completed, setCompleted, isCompletedLoaded] = useLocalStorage<Project[]>('projectflow-completed', INITIAL_COMPLETED);

  const [project, setProject] = useState<Project | null>(null);

  // ALWAYS EDIT MODE
  // kept as constant true to always show editable fields
  const [isEditing] = useState(true);

  // Editing fields as simple strings (requirements as single textarea string)
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editRequirementsText, setEditRequirementsText] = useState(''); // notepad-style multiline
  const [editLinks, setEditLinks] = useState<LinkType[]>([]);

  // Project log / new note text area (placed under requirements)
  const [newNote, setNewNote] = useState('');

  const { font } = useContext(ProfileContext);
  const isDataLoaded = isIdeasLoaded && isCompletedLoaded;

  // load project
  useEffect(() => {
    if (!id || !isDataLoaded) return;
    const allProjects = [...(ideas || []), ...(completed || [])];
    const foundProject = allProjects.find(p => p.id === id) || null;
    setProject(foundProject);
  }, [id, ideas, completed, isDataLoaded]);

  // convert project's requirements to a single multiline string
  const requirementsToText = (req: Project['requirements']) => {
    if (!req) return '';
    if (typeof req === 'string') return req;
    if (Array.isArray(req)) return req.join('\n');
    return String(req);
  };

  // sync edit fields when project loads/changes
  useEffect(() => {
    if (!project) return;
    setEditTitle(project.title ?? '');
    setEditDescription(project.description ?? '');
    setEditTags(Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags as any) ?? '');
    setEditRequirementsText(requirementsToText(project.requirements));
    setEditLinks(project.links ?? []);
  }, [project]);

  // derived lines for numbering gutter
  const requirementLines = useMemo(() => {
    const lines = editRequirementsText.split(/\r?\n/);
    if (lines.length === 1 && lines[0].trim() === '') return [''];
    return lines;
  }, [editRequirementsText]);

  // save handler
  const handleSave = () => {
    if (!project) return;

    const requirementsArray = editRequirementsText
      .split(/\r?\n/)
      .map(l => l.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);

    const updatedProject: Project = {
      ...project,
      title: editTitle,
      description: editDescription,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      requirements: requirementsArray.length > 0 ? requirementsArray : '',
      links: editLinks,
    };

    const isCompletedProject = completed.some(p => p.id === project.id);
    const setTarget = isCompletedProject ? setCompleted : setIdeas;
    setTarget(prev => prev.map(p => p.id === project.id ? updatedProject : p));
    setProject(updatedProject);

    toast({ title: 'Project Saved!', description: 'Your changes have been saved.' });
  };

  // revert (restore from saved project)
  const handleRevert = () => {
    if (!project) return;
    setEditTitle(project.title ?? '');
    setEditDescription(project.description ?? '');
    setEditTags(Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags as any) ?? '');
    setEditRequirementsText(requirementsToText(project.requirements));
    setEditLinks(project.links ?? []);
    toast({ title: 'Edits reverted' });
  };

  // notes handlers
  const handleAddNote = () => {
    if (!project || !newNote.trim()) return;
    const note: Note = { id: `note-${Date.now()}`, date: new Date().toISOString(), content: newNote.trim() };

    const updatedProject: Project = {
      ...project,
      notes: [...(project.notes || []), note],
    };

    const isCompletedProject = completed.some(p => p.id === project.id);
    const setTarget = isCompletedProject ? setCompleted : setIdeas;
    setTarget(prev => prev.map(p => p.id === project.id ? updatedProject : p));
    setProject(updatedProject);
    setNewNote('');
    toast({ title: 'Note added!' });
  };

  const handleDeleteNote = (noteId: string) => {
    if (!project) return;
    const updatedNotes = (project.notes || []).filter(n => n.id !== noteId);
    const updatedProject: Project = { ...project, notes: updatedNotes };
    const isCompletedProject = completed.some(p => p.id === project.id);
    const setTarget = isCompletedProject ? setCompleted : setIdeas;
    setTarget(prev => prev.map(p => p.id === project.id ? updatedProject : p));
    setProject(updatedProject);
    toast({ title: 'Note deleted.' });
  };

  // Loading skeleton
  if (!isDataLoaded) {
    return (
      <div className={cn('flex flex-col min-h-screen', font === 'serif' ? 'font-serif' : 'font-sans')}>
        <AppHeader searchTerm="" setSearchTerm={() => {}} onExport={() => {}} onImport={() => {}} />
        <main className="flex-1 w-full min-h-screen py-12 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          <Skeleton className="h-10 w-72 mb-6" />
          <div className="space-y-10">
            <Skeleton className="w-full h-96" />
            <Skeleton className="w-full h-64" />
            <Skeleton className="w-full h-64" />
          </div>
        </main>
      </div>
    );
  }

  // Not found
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">404 - Project Not Found</h1>
        <p className="text-muted-foreground mb-8">The project you are looking for does not exist.</p>
        <Button onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2" /> Go Back Home
        </Button>
      </div>
    );
  }

  const logoSrc = project.logo || `https://picsum.photos/seed/${project.id}/800/800`;

  return (
    <div className={cn('flex flex-col min-h-screen bg-transparent', font === 'serif' ? 'font-serif' : 'font-sans')}>
      {/* Header */}
      <AppHeader searchTerm="" setSearchTerm={() => {}} onExport={() => {}} onImport={() => {}} />

      {/* Main - FULL WIDTH (no container / no mx-auto) */}
      <main className="flex-1 w-full min-h-screen py-8 px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        {/* Top row: back + save/revert */}
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2" /> Back to Dashboard
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRevert} className="px-4 py-2">
              <X className="mr-2" /> Revert
            </Button>
            <Button onClick={handleSave} className="px-5 py-2">
              <Save className="mr-2" /> Save Changes
            </Button>
          </div>
        </div>

        {/* Grid - full width. Use 12-col on md+ for fine control */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* LEFT column (project info) */}
          <div className="md:col-span-4 space-y-6">
            <Card>
              <CardContent className="flex flex-col gap-6 p-6">
                <div className="w-full flex justify-center md:justify-start">
                  <Image
                    src={logoSrc}
                    alt={`${project.title} logo`}
                    width={720}
                    height={720}
                    className="rounded-md border object-cover w-56 h-56 md:w-64 md:h-64 lg:w-80 lg:h-80"
                    priority
                  />
                </div>

                <div className="w-full text-left space-y-3">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold p-2 border-0 shadow-none focus-visible:ring-0"
                  />
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="text-base md:text-lg text-muted-foreground p-2 border-0 h-auto shadow-none focus-visible:ring-0 resize-none"
                    rows={3}
                  />
                </div>

                <div className="w-full">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Tags</label>
                  <Input
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="e.g. AI, Productivity"
                    className="mb-3"
                  />
                  <div className="flex flex-wrap gap-2">
                    {editTags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                    {editTags.trim() === '' && <p className="text-sm text-muted-foreground">No tags.</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{project.progress === 100 ? 'Completed' : 'In Progress'}</span>
                  <span className="text-lg font-bold">{project.progress ?? 0}%</span>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                    <div style={{ width: `${project.progress ?? 0}%` }} className="h-3 rounded-full bg-primary transition-all duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compact Links on left for quick access (keeps right column for main content) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><LinkIcon size={18} /> Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {editLinks.length > 0 ? editLinks.map((link, idx) => (
                    <div key={link.id ?? idx} className="flex items-start gap-3 p-2 rounded-md border bg-muted/30">
                      <div className="flex-1 min-w-0">
                        <Input
                          value={link.title}
                          onChange={(e) => {
                            const arr = [...editLinks]; arr[idx] = { ...arr[idx], title: e.target.value }; setEditLinks(arr);
                          }}
                          placeholder="Title"
                          className="h-8 text-sm mb-1"
                        />
                        <Input
                          value={link.url}
                          onChange={(e) => {
                            const arr = [...editLinks]; arr[idx] = { ...arr[idx], url: e.target.value }; setEditLinks(arr);
                          }}
                          placeholder="https://example.com"
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setEditLinks(editLinks.filter((_, i) => i !== idx))} className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )) : <p className="text-sm text-muted-foreground text-center py-4">No links added.</p>}
                </div>

                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => setEditLinks([...editLinks, { id: `new-link-${Date.now()}`, title: '', url: '' }])}>
                    <Plus className="mr-2 h-3 w-3" /> Add Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT column (main content): requirements, project log */}
          <div className="md:col-span-8 space-y-6">
            {/* Requirements - notepad style */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><CheckSquare size={20} /> Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden bg-background">
                  <div className="flex w-full min-h-[280px] md:min-h-[360px] lg:min-h-[420px]">
                    <div className="select-none bg-muted/60 text-muted-foreground text-right py-4 flex flex-col items-end" style={{ minWidth: 64 }}>
                      {requirementLines.map((_, i) => (
                        <div key={i} className="text-sm leading-7 h-7 px-3">{i + 1}.</div>
                      ))}
                    </div>

                    <textarea
                      value={editRequirementsText}
                      onChange={(e) => setEditRequirementsText(e.target.value)}
                      placeholder="Start typing your requirements... each new line becomes a requirement"
                      className="flex-1 p-4 bg-transparent resize-vertical outline-none min-h-[280px] md:min-h-[360px] lg:min-h-[420px] text-sm md:text-base leading-7 font-mono"
                      style={{ lineHeight: '1.75rem' }}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-3">Each new line becomes a separate requirement. Left numbers are visual only.</p>
              </CardContent>
            </Card>

            {/* Project Log */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><NotebookText size={20} /> Project Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Write project log / progress notes here..."
                    className="min-h-[160px] md:min-h-[200px] lg:min-h-[260px]"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{newNote.length}/1000 characters</p>
                    <Button onClick={handleAddNote} disabled={!newNote.trim()} className="px-4 py-2">
                      <Plus className="mr-2 h-4 w-4" /> Add Entry
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent Entries</h4>
                  <div className="space-y-4 max-h-[360px] overflow-y-auto">
                    {(project.notes || []).length > 0 ? [...project.notes].slice().reverse().map(note => (
                      <div key={note.id} className="flex gap-4 text-sm group">
                        <p className="font-mono text-muted-foreground whitespace-nowrap text-xs pt-1 w-24 flex-shrink-0">
                          {format(new Date(note.date), 'MMM dd')}
                        </p>
                        <div className="flex-1 bg-muted/30 p-4 rounded-md border relative">
                          <p className="whitespace-pre-wrap text-sm pr-8">{note.content}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-6 border rounded-md">No log entries yet. Add your first note to start tracking progress.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
