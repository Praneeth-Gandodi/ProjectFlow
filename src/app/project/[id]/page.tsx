'use client';

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ExternalLink,
  Link as LinkIcon,
  ArrowLeft,
  Save,
  Plus,
  X,
  NotebookText,
  Trash2,
  CheckSquare,
  Eye,
  EyeOff,
  Lock,
  Key as KeyIcon,
  Unlock,
  Copy
} from 'lucide-react';
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
import { motion } from 'framer-motion';

interface APIKey {
  id: string;
  name: string;
  website?: string;
  key: string;
  description?: string;
}

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = (params as any)?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { toast } = useToast();

  const [ideas, setIdeas, isIdeasLoaded] = useLocalStorage<Project[]>('projectflow-ideas', INITIAL_IDEAS);
  const [completed, setCompleted, isCompletedLoaded] = useLocalStorage<Project[]>('projectflow-completed', INITIAL_COMPLETED);

  const [project, setProject] = useState<Project | null>(null);

  // Editing fields
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editRequirementsText, setEditRequirementsText] = useState('');
  const [editLinks, setEditLinks] = useState<LinkType[]>([]);

  // API Keys local state
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  // session unlocked flag for the current project
  const [isKeysUnlocked, setIsKeysUnlocked] = useState(false);
  // per-key unmask state (only meaningful when unlocked)
  const [unmaskedKeys, setUnmaskedKeys] = useState<Record<string, boolean>>({});
  // key detail modal
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Modals
  const [showPinModal, setShowPinModal] = useState(false); // used for both set/unlock flows (mode controlled)
  const [pinMode, setPinMode] = useState<'set' | 'unlock'>('unlock');
  const [pinInput, setPinInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [showPinInput, setShowPinInput] = useState(true);

  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyWebsite, setNewKeyWebsite] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');

  // Project log / new note
  const [newNote, setNewNote] = useState('');

  const { font } = useContext(ProfileContext);
  const isDataLoaded = isIdeasLoaded && isCompletedLoaded;

  // ---------- Helper: validate website URL ----------
  const validateWebsiteUrl = (url: string): boolean => {
    if (!url || !url.trim()) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const getFaviconFor = (website?: string) => {
    if (!website) return undefined;
    try {
      const domain = new URL(website).hostname;
      // Google favicon service (works in browser); next/image not used to avoid host config
      return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
    } catch {
      return undefined;
    }
  };

  // ---------- Load project ----------
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
    setEditDescription(project.description ?? '');
    setEditTags(Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags as any) ?? '');
    setEditRequirementsText(requirementsToText(project.requirements));
    setEditLinks(project.links ?? []);
    const pAny = project as any;
    setApiKeys(Array.isArray(pAny.apiKeys) ? (pAny.apiKeys as APIKey[]) : []);
    // reset per-key unmask
    setUnmaskedKeys({});
    // check session unlock
    const unlocked = sessionStorage.getItem(`projectflow-unlock-${project.id}`) === 'true';
    setIsKeysUnlocked(!!unlocked);
  }, [project]);

  // derived lines for numbering gutter
  const requirementLines = useMemo(() => {
    const lines = editRequirementsText.split(/\r?\n/);
    if (lines.length === 1 && lines[0].trim() === '') return [''];
    return lines;
  }, [editRequirementsText]);

  const getProjectPin = (proj: Project | null) => {
    if (!proj) return null;
    const pAny = proj as any;
    return pAny.apiKeyPin ?? null;
  };

  // persist helper (update the project inside ideas/completed arrays)
  const persistProject = (updatedProj: Project) => {
    if (!updatedProj) return;
    const isCompletedProject = completed.some(p => p.id === updatedProj.id);
    const setTarget = isCompletedProject ? setCompleted : setIdeas;
    setTarget(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
    setProject(updatedProj);
  };

  // save handler - saves all editable fields back into the project
  const handleSave = () => {
    if (!project) return;

    const requirementsArray = editRequirementsText
      .split(/\r?\n/)
      .map(l => l.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);

    const pAny = { ...(project as any) };
    pAny.description = editDescription;
    pAny.tags = editTags.split(',').map(t => t.trim()).filter(Boolean);
    pAny.requirements = requirementsArray.length > 0 ? requirementsArray : '';
    pAny.links = editLinks;
    pAny.apiKeys = apiKeys;

    const updatedProject = pAny as Project;
    persistProject(updatedProject);

    toast({ title: 'Project Saved!', description: 'Your changes have been saved.' });
  };

  // revert local edits to saved project
  const handleRevert = () => {
    if (!project) return;
    setEditDescription(project.description ?? '');
    setEditTags(Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags as any) ?? '');
    setEditRequirementsText(requirementsToText(project.requirements));
    setEditLinks(project.links ?? []);
    const pAny = project as any;
    setApiKeys(Array.isArray(pAny.apiKeys) ? (pAny.apiKeys as APIKey[]) : []);
    toast({ title: 'Edits reverted' });
  };

  // notes handlers
  const handleAddNote = () => {
    if (!project || !newNote.trim()) return;
    const note: Note = { id: `note-${Date.now()}`, date: new Date().toISOString(), content: newNote.trim() };

    const pAny = { ...(project as any) };
    pAny.notes = [...(project.notes || []), note];
    pAny.apiKeys = apiKeys;
    const updatedProject = pAny as Project;
    persistProject(updatedProject);

    setProject(updatedProject);
    setNewNote('');
    toast({ title: 'Note added!' });
  };

  const handleDeleteNote = (noteId: string) => {
    if (!project) return;
    const updatedNotes = (project.notes || []).filter(n => n.id !== noteId);
    const pAny = { ...(project as any) };
    pAny.notes = updatedNotes;
    pAny.apiKeys = apiKeys;
    const updatedProject = pAny as Project;
    persistProject(updatedProject);
    setProject(updatedProject);
    toast({ title: 'Note deleted.' });
  };

  // Links helpers: persist on change
  const persistLinksQuick = (linksArr: LinkType[]) => {
    setEditLinks(linksArr);
    if (!project) return;
    const pAny = { ...(project as any) };
    pAny.links = linksArr;
    persistProject(pAny as Project);
  };

  // API Keys: add/delete/update helpers
  const handleAddApiKeyDirect = (key: APIKey) => {
    const updated = [...apiKeys, key];
    setApiKeys(updated);
    // persist into project object immediately
    if (!project) return;
    const pAny = { ...(project as any) };
    pAny.apiKeys = updated;
    persistProject(pAny as Project);
  };

  const handleDeleteApiKey = (keyId: string) => {
    const updated = apiKeys.filter(k => k.id !== keyId);
    setApiKeys(updated);
    if (!project) return;
    const pAny = { ...(project as any) };
    pAny.apiKeys = updated;
    persistProject(pAny as Project);
    toast({ title: 'API key removed' });
  };

  const handleUpdateApiKey = (idx: number, partial: Partial<APIKey>) => {
    const updated = [...apiKeys];
    updated[idx] = { ...updated[idx], ...partial };
    setApiKeys(updated);
    if (!project) return;
    const pAny = { ...(project as any) };
    pAny.apiKeys = updated;
    persistProject(pAny as Project);
  };

  // copy helpers
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied to clipboard' });
    } catch (err) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        toast({ title: 'Copied to clipboard' });
      } catch {
        toast({ title: 'Copy failed' });
      }
    }
  };

  // PIN modal flows
  const openSetPinModal = () => {
    setPinMode('set');
    setPinInput('');
    setPinConfirmInput('');
    setShowPinInput(true);
    setShowPinModal(true);
  };

  const openUnlockPinModal = () => {
    setPinMode('unlock');
    setPinInput('');
    setShowPinInput(true);
    setShowPinModal(true);
  };

  const validateNumericPin = (val: string) => {
    // only digits allowed
    return /^\d*$/.test(val);
  };

  const confirmSetPin = () => {
    const pin = pinInput.trim();
    const confirm = pinConfirmInput.trim();

    if (!/^\d{4,6}$/.test(pin)) {
      toast({ title: 'PIN must be numeric and 4–6 digits' });
      return;
    }
    if (pin !== confirm) {
      toast({ title: 'PINs do not match' });
      return;
    }
    if (!project) return;

    const pAny = { ...(project as any) };
    pAny.apiKeyPin = pin;
    // persist pin
    persistProject(pAny as Project);
    // unlock session
    sessionStorage.setItem(`projectflow-unlock-${project.id}`, 'true');
    setIsKeysUnlocked(true);
    setShowPinModal(false);
    setPinInput('');
    setPinConfirmInput('');
    toast({ title: 'PIN set', description: 'Your project API PIN has been saved locally.' });
  };

  const confirmUnlockPin = () => {
    if (!project) return;
    const storedPin = getProjectPin(project);
    if (!storedPin) {
      // no pin exists, open set modal instead
      openSetPinModal();
      return;
    }
    if (pinInput === storedPin) {
      sessionStorage.setItem(`projectflow-unlock-${project.id}`, 'true');
      setIsKeysUnlocked(true);
      setShowPinModal(false);
      setPinInput('');
      toast({ title: 'Unlocked', description: 'API keys are visible this session.' });
    } else {
      toast({ title: 'Incorrect PIN', description: 'Try again.' });
    }
  };

  const promptUnlockOrSet = () => {
    const storedPin = getProjectPin(project);
    if (!storedPin) {
      openSetPinModal();
    } else {
      openUnlockPinModal();
    }
  };

  // Add Key confirm with validation (updated to include description)
  const confirmAddKey = () => {
    if (!project) return;
    if (!newKeyName.trim()) {
      toast({ title: 'Name required', description: 'Provide a name for this API key' });
      return;
    }
    if (!newKeyWebsite.trim()) {
      toast({ title: 'Website required', description: 'Provide the website for this service' });
      return;
    }
    if (!validateWebsiteUrl(newKeyWebsite)) {
      toast({ title: 'Invalid website', description: 'Please enter a valid URL starting with http:// or https://', variant: 'destructive' });
      return;
    }
    if (!newKeyValue.trim()) {
      toast({ title: 'API key required', description: 'Provide the actual API key value' });
      return;
    }

    const newKey: APIKey = {
      id: `apikey-${Date.now()}`,
      name: newKeyName.trim(),
      website: newKeyWebsite.trim(),
      key: newKeyValue.trim(),
      description: newKeyDescription.trim() || undefined,
    };

    handleAddApiKeyDirect(newKey);
    setNewKeyName('');
    setNewKeyWebsite('');
    setNewKeyValue('');
    setNewKeyDescription('');
    setShowAddKeyModal(false);
    toast({ title: 'API Key added', description: 'Your API key has been securely stored.' });
  };

  // Toggle individual unmask (only when unlocked)
  const toggleUnmaskKey = (id: string) => {
    if (!isKeysUnlocked) {
      promptUnlockOrSet();
      return;
    }
    setUnmaskedKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // copy a key (requires unlocked)
  const handleCopyKey = (k: APIKey) => {
    if (!isKeysUnlocked) {
      promptUnlockOrSet();
      return;
    }
    copyToClipboard(k.key);
  };

  // open key detail modal
  const openKeyModal = (k: APIKey) => {
    setSelectedKey(k);
    setShowKeyModal(true);
  };

  const closeKeyModal = () => {
    setSelectedKey(null);
    setShowKeyModal(false);
  };

  // Toggle reveal attempt triggers PIN prompt if locked
  const handleRevealAttempt = () => {
    if (isKeysUnlocked) return;
    promptUnlockOrSet();
  };

  // Loading skeleton
  if (!isDataLoaded) {
    return (
      <div className={cn('flex flex-col min-h-screen', font === 'serif' ? 'font-serif' : 'font-sans')}>
        {/* AppHeader without search input so it doesn't prompt on load */}
        <AppHeader
          searchTerm=""
          setSearchTerm={() => {}}
          onExport={() => {}}
          onImport={() => {}}
        />

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

  const logoSrc = (project as any).logo || `https://picsum.photos/seed/${project.id}/800/800`;

  return (
    <div className={cn('flex flex-col min-h-screen bg-transparent', font === 'serif' ? 'font-serif' : 'font-sans')}>
      {/* Header (search removed) */}
      <AppHeader
        searchTerm=""
        setSearchTerm={() => {}}
        onExport={() => {}}
        onImport={() => {}}
      />

      {/* Main - FULL WIDTH */}
      <main className="flex-1 w-full min-h-screen py-8 px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        {/* Top row: back + save/revert (icon-only) */}
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2" /> Back to Dashboard
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleRevert} aria-label="Revert edits">
              <X />
            </Button>
            <Button size="icon" onClick={handleSave} aria-label="Save changes">
              <Save />
            </Button>
          </div>
        </div>

        {/* Grid */}
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
                    unoptimized
                  />
                </div>

                <div className="w-full text-left space-y-3">
                  {/* Title is read-only now */}
                  <div className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold p-2">
                    {project.title}
                  </div>

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
                  <span className="text-sm text-muted-foreground">{(project as any).progress === 100 ? 'Completed' : 'In Progress'}</span>
                  <span className="text-lg font-bold">{(project as any).progress ?? 0}%</span>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                    <div style={{ width: `${(project as any).progress ?? 0}%` }} className="h-3 rounded-full bg-primary transition-all duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compact Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><LinkIcon size={18} /> Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {editLinks.length > 0 ? editLinks.map((link, idx) => (
                    <div key={link.id ?? idx} className="flex items-center gap-3 p-2 rounded-md border bg-muted/30">
                      <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                        {validateWebsiteUrl(link.url) ? (
                          // use google favicon service
                          <img src={`https://www.google.com/s2/favicons?sz=96&domain=${new URL(link.url).hostname}`} alt="favicon" className="w-8 h-8 object-contain" />
                        ) : (
                          <div className="text-xs text-muted-foreground">No</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">{link.title || 'Untitled'}</div>
                          <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                        </div>
                        {link.description && <div className="text-xs text-muted-foreground line-clamp-2">{link.description}</div>}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { if (validateWebsiteUrl(link.url)) window.open(link.url, '_blank'); }} aria-label="Open link">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (link.url) copyToClipboard(link.url); }} aria-label="Copy link">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { const arr = editLinks.filter((_, i) => i !== idx); persistLinksQuick(arr); }} aria-label="Delete link">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )) : <p className="text-sm text-muted-foreground text-center py-4">No links added.</p>}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Manage quick links for this project.</div>
                  <div>
                    <Button size="sm" variant="outline" onClick={() => {
                      const added = [...editLinks, { id: `new-link-${Date.now()}`, title: '', url: '' }];
                      persistLinksQuick(added);
                    }} aria-label="Add link">
                      <Plus />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ---------- API Keys Card (secure + compact) ---------- */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><KeyIcon size={18} /> API Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {apiKeys.length > 0 ? apiKeys.map((k) => {
                    // display only name + blurred key
                    const blurred = '•'.repeat(Math.min(24, Math.max(8, k.key.length)));
                    return (
                      <div key={k.id} className="flex items-center justify-between gap-3 p-3 rounded-md border bg-muted/30">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                            {k.website && validateWebsiteUrl(k.website) ? (
                              <img src={getFaviconFor(k.website)} alt="favicon" className="w-8 h-8 object-contain" />
                            ) : (
                              <div className="text-xs text-muted-foreground">API</div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-medium truncate">{k.name || 'Untitled'}</div>
                            <div className="text-xs text-muted-foreground truncate">{blurred}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* icon-only lock/unlock */}
                          <Button variant="ghost" size="icon" onClick={() => {
                            // toggles lock for session: if locked, prompt unlock; if unlocked, lock
                            if (!isKeysUnlocked) {
                              promptUnlockOrSet();
                              return;
                            }
                            // unlocked -> toggle per-key unmask
                            toggleUnmaskKey(k.id);
                          }} aria-label="Reveal key">
                            {isKeysUnlocked && unmaskedKeys[k.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>

                          {/* details popup opener */}
                          <Button variant="ghost" size="icon" onClick={() => openKeyModal(k)} aria-label="View key details">
                            <KeyIcon className="h-4 w-4" />
                          </Button>

                          <Button variant="ghost" size="icon" onClick={() => handleCopyKey(k)} aria-label="Copy key" disabled={!isKeysUnlocked}>
                            <Copy className="h-4 w-4" />
                          </Button>

                          <Button variant="ghost" size="icon" onClick={() => handleDeleteApiKey(k.id)} aria-label="Delete key">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-sm text-muted-foreground text-center py-6 border rounded-md cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setShowAddKeyModal(true)}>
                      No API keys yet. Click here to add one.
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">{isKeysUnlocked ? 'API keys are visible.' : 'Keys are stored locally and protected with a PIN.'}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                      if (!project) return;
                      if (isKeysUnlocked) {
                        sessionStorage.removeItem(`projectflow-unlock-${project.id}`);
                        setIsKeysUnlocked(false);
                        setUnmaskedKeys({});
                        toast({ title: 'Locked' });
                      } else {
                        promptUnlockOrSet();
                      }
                    }} aria-label="Lock or unlock keys">
                      {isKeysUnlocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => {
                      if (!isKeysUnlocked) {
                        const storedPin = getProjectPin(project);
                        if (!storedPin) {
                          openSetPinModal();
                          toast({ title: 'Set a PIN first', description: 'You need to set a PIN before adding API keys.' });
                          return;
                        } else {
                          openUnlockPinModal();
                          return;
                        }
                      }
                      setShowAddKeyModal(true);
                    }} aria-label="Add API key">
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT column (main content) */}
          <div className="md:col-span-8 space-y-6">
            {/* Requirements */}
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
                    {(project.notes ?? []).length > 0 ? (
                      [...(project.notes ?? [])].slice().reverse().map(note => (
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
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-6 border rounded-md">
                        No log entries yet. Add your first note to start tracking progress.
                      </p>
                    )}

                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* PIN Modal (set or unlock) - unchanged except visibility toggle */}
      {showPinModal && project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardHeader>
                <CardTitle>{pinMode === 'set' ? 'Set API Key PIN' : 'Enter API Key PIN'}</CardTitle>
              </CardHeader>
              <CardContent>
                {pinMode === 'set' ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">Create a numeric PIN (4–6 digits) to protect API key visibility for this project. This PIN is stored locally inside the project and cannot be recovered.</p>
                    <div className="flex gap-2 items-center">
                      <Input
                        value={pinInput}
                        onChange={(e) => {
                          if (!validateNumericPin(e.target.value)) return;
                          setPinInput(e.target.value.slice(0, 6));
                        }}
                        placeholder="Enter PIN"
                        inputMode="numeric"
                        type={showPinInput ? 'text' : 'password'}
                        className="flex-1"
                      />
                      <Input
                        value={pinConfirmInput}
                        onChange={(e) => {
                          if (!validateNumericPin(e.target.value)) return;
                          setPinConfirmInput(e.target.value.slice(0, 6));
                        }}
                        placeholder="Confirm PIN"
                        inputMode="numeric"
                        type={showPinInput ? 'text' : 'password'}
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon" onClick={() => setShowPinInput(s => !s)} aria-label="Toggle PIN visibility">
                        {showPinInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => { setShowPinModal(false); setPinInput(''); setPinConfirmInput(''); }}>Cancel</Button>
                      <Button onClick={confirmSetPin}>Set PIN</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">Enter the project API PIN to view keys this session.</p>
                    <div className="flex gap-2 items-center">
                      <Input
                        value={pinInput}
                        onChange={(e) => {
                          if (!validateNumericPin(e.target.value)) return;
                          setPinInput(e.target.value.slice(0, 6));
                        }}
                        placeholder="Enter PIN"
                        inputMode="numeric"
                        type={showPinInput ? 'text' : 'password'}
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon" onClick={() => setShowPinInput(s => !s)} aria-label="Toggle PIN visibility">
                        {showPinInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => { setShowPinModal(false); setPinInput(''); }}>Cancel</Button>
                      <Button onClick={confirmUnlockPin}>Unlock</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Add API Key Modal (now supports description + favicon preview) */}
      {showAddKeyModal && project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-lg"
          >
            <Card>
              <CardHeader>
                <CardTitle>Add API Key</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {isKeysUnlocked
                    ? 'Add a name, website, the API key value and an optional description.'
                    : 'You need to unlock API keys first before adding new ones.'}
                </p>

                {isKeysUnlocked ? (
                  <div className="space-y-3">
                    <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Name (e.g. OpenAI)" required />
                    <div className="flex items-center gap-2">
                      <Input value={newKeyWebsite} onChange={(e) => setNewKeyWebsite(e.target.value)} placeholder="Website (https://api.example.com)" required />
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                        {validateWebsiteUrl(newKeyWebsite) ? (
                          <img src={getFaviconFor(newKeyWebsite)} alt="favicon" className="w-9 h-9 object-contain" />
                        ) : (
                          <div className="text-xs text-muted-foreground">No</div>
                        )}
                      </div>
                    </div>
                    <Input value={newKeyValue} onChange={(e) => setNewKeyValue(e.target.value)} placeholder="API Key" className="font-mono" type="text" required />
                    <Textarea value={newKeyDescription} onChange={(e) => setNewKeyDescription(e.target.value)} placeholder="Optional description" rows={3} />
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Unlock API keys to add new ones</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => { setShowAddKeyModal(false); setNewKeyName(''); setNewKeyWebsite(''); setNewKeyValue(''); setNewKeyDescription(''); }}>Cancel</Button>
                  <Button onClick={confirmAddKey} disabled={!isKeysUnlocked || !newKeyName.trim() || !newKeyWebsite.trim() || !newKeyValue.trim() || !validateWebsiteUrl(newKeyWebsite)}>Add Key</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Key details modal (opened when clicking a key) */}
      {showKeyModal && selectedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>{selectedKey.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded overflow-hidden bg-muted flex items-center justify-center">
                    {selectedKey.website && validateWebsiteUrl(selectedKey.website) ? (
                      <img src={getFaviconFor(selectedKey.website)} alt="favicon" className="w-12 h-12 object-contain" />
                    ) : (
                      <div className="text-sm text-muted-foreground">API</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="mb-2 font-medium">API Key</div>
                    <div className="flex items-center gap-2">
                      <div className="font-mono break-words">{selectedKey.key}</div>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(selectedKey.key)} aria-label="Copy key">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    {selectedKey.description && (
                      <div className="mt-3 text-sm text-muted-foreground">{selectedKey.description}</div>
                    )}

                    {selectedKey.website && (
                      <div className="mt-3 text-xs">
                        <a href={selectedKey.website} target="_blank" rel="noreferrer noopener" className="text-primary underline">Open website</a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end p-4 pt-0">
                <Button variant="outline" onClick={() => closeKeyModal()}>Close</Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
