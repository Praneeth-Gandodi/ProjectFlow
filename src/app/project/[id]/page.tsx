
'use client';

import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
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
  Copy,
  Globe,
  Edit3,
  GitCommit,
  Github,
  CalendarIcon
} from 'lucide-react';
import Image from 'next/image';
import type { Project, Note, Link as LinkType } from '@/app/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ProfileContext } from '@/context/profile-context';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';
import { INITIAL_IDEAS, INITIAL_COMPLETED } from '@/app/data';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogoUrl } from '@/lib/useLogoUrl';

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
  const { url: logoDisplayUrl } = useLogoUrl(project?.logo);


  // Editing fields
  const [editDescription, setEditDescription] = useState('');
  const [editRequirementsText, setEditRequirementsText] = useState('');
  const [editLinks, setEditLinks] = useState<LinkType[]>([]);

  // API Keys local state
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isKeysUnlocked, setIsKeysUnlocked] = useState(false);
  const [unmaskedKeys, setUnmaskedKeys] = useState<Record<string, boolean>>({});
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [editingKey, setEditingKey] = useState<APIKey | null>(null);

  // Links state
  const [selectedLink, setSelectedLink] = useState<LinkType | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);

  // Modals
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState<'set' | 'unlock'>('unlock');
  const [pinInput, setPinInput] = useState(['', '', '', '']);
  const [pinConfirmInput, setPinConfirmInput] = useState(['', '', '', '']);
  const [showPinInput, setShowPinInput] = useState(false);

  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyWebsite, setNewKeyWebsite] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');

  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkDescription, setNewLinkDescription] = useState('');

  // Project log / new note
  const [newNote, setNewNote] = useState('');

  // Context menu for project icon
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const { font } = useContext(ProfileContext);
  const isDataLoaded = isIdeasLoaded && isCompletedLoaded;

  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ---------- Helper: validate website URL ----------
  const validateWebsiteUrl = (url: string): boolean => {
    if (!url || !url.trim()) return false;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const getFaviconFor = (website?: string) => {
    if (!website) return undefined;
    try {
      const domain = new URL(website).hostname;
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
    setEditRequirementsText(requirementsToText(project.requirements));
    setEditLinks(project.links ?? []);
    const pAny = project as any;
    setApiKeys(Array.isArray(pAny.apiKeys) ? (pAny.apiKeys as APIKey[]) : []);
    setUnmaskedKeys({});
    const unlocked = sessionStorage.getItem(`projectflow-unlock-${project.id}`) === 'true';
    setIsKeysUnlocked(!!unlocked);
  }, [project]);

  // Auto-number requirements with proper formatting
  const formatRequirementsText = (text: string) => {
    const lines = text.split('\n');
    const formattedLines = lines.map((line, index) => {
      // Remove existing numbers and trim
      const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
      return cleanLine ? `${index + 1}. ${cleanLine}` : '';
    });
    return formattedLines.join('\n');
  };

  const handleRequirementsChange = (text: string) => {
    // Store the raw text without auto-numbering for editing
    const lines = text.split('\n');
    const cleanLines = lines.map(line => line.replace(/^\d+\.\s*/, '').trim());
    setEditRequirementsText(cleanLines.join('\n'));
  };

  // Get display text with auto-numbering
  const requirementsDisplayText = useMemo(() => {
    const lines = editRequirementsText.split('\n');
    return lines.map((line, index) => {
      const cleanLine = line.trim();
      return cleanLine ? `${index + 1}. ${cleanLine}` : '';
    }).join('\n');
  }, [editRequirementsText]);

  const getProjectPin = (proj: Project | null) => {
    if (!proj) return null;
    const pAny = proj as any;
    return pAny.apiKeyPin ?? null;
  };

  // persist helper
  const persistProject = (updatedProj: Project) => {
    if (!updatedProj) return;
    const isCompletedProject = completed.some(p => p.id === updatedProj.id);
    const setTarget = isCompletedProject ? setCompleted : setIdeas;
    setTarget(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
    setProject(updatedProj);
  };

  // save handler
  const handleSave = () => {
    if (!project) return;

    const requirementsArray = editRequirementsText
      .split(/\r?\n/)
      .map(l => l.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);

    const pAny = { ...(project as any) };
    pAny.description = editDescription;
    pAny.requirements = requirementsArray.length > 0 ? requirementsArray : '';
    pAny.links = editLinks;
    pAny.apiKeys = apiKeys;

    const updatedProject = pAny as Project;
    persistProject(updatedProject);

    toast({ 
      title: 'Project Saved!', 
      description: 'Your changes have been saved successfully.',
    });
  };

  // revert local edits to saved project
  const handleRevert = () => {
    if (!project) return;
    setEditDescription(project.description ?? '');
    setEditRequirementsText(requirementsToText(project.requirements));
    setEditLinks(project.links ?? []);
    const pAny = project as any;
    setApiKeys(Array.isArray(pAny.apiKeys) ? (pAny.apiKeys as APIKey[]) : []);
    setEditingKey(null);
    setEditingLink(null);
    toast({ title: 'Changes reverted', description: 'All edits have been discarded.' });
  };

  // notes handlers
  const handleAddNote = () => {
    if (!project || !newNote.trim()) return;
    const note: Note = { 
      id: `note-${Date.now()}`, 
      date: new Date().toISOString(), 
      content: newNote.trim() 
    };

    const pAny = { ...(project as any) };
    pAny.notes = [...(project.notes || []), note];
    pAny.apiKeys = apiKeys;
    const updatedProject = pAny as Project;
    persistProject(updatedProject);

    setProject(updatedProject);
    setNewNote('');
    toast({ 
      title: 'Note added!', 
      description: 'Your note has been saved to the project log.',
    });
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
    toast({ title: 'Note deleted', description: 'The note has been removed.' });
  };

  // Links helpers
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
    toast({ title: 'API key removed', description: 'The API key has been deleted.' });
  };

  const handleUpdateApiKey = (keyId: string, updates: Partial<APIKey>) => {
    const updated = apiKeys.map(k => k.id === keyId ? { ...k, ...updates } : k);
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
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  // PIN modal flows with block-style input
  const openSetPinModal = () => {
    setPinMode('set');
    setPinInput(['', '', '', '']);
    setPinConfirmInput(['', '', '', '']);
    setShowPinInput(false);
    setShowPinModal(true);
    // Focus first input
    setTimeout(() => {
      pinInputRefs.current[0]?.focus();
    }, 100);
  };

  const openUnlockPinModal = () => {
    setPinMode('unlock');
    setPinInput(['', '', '', '']);
    setShowPinInput(false);
    setShowPinModal(true);
    // Focus first input
    setTimeout(() => {
      pinInputRefs.current[0]?.focus();
    }, 100);
  };

  const handlePinInputChange = (index: number, value: string, isConfirm = false) => {
    if (!/^\d?$/.test(value)) return; // Only allow digits
    
    const targetArray = isConfirm ? pinConfirmInput : pinInput;
    const newArray = [...targetArray];
    newArray[index] = value;
    
    if (isConfirm) {
      setPinConfirmInput(newArray);
    } else {
      setPinInput(newArray);
    }

    // Auto-focus next input
    if (value && index < 3) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent, isConfirm = false) => {
    const targetArray = isConfirm ? pinConfirmInput : pinInput;
    if (e.key === 'Backspace' && !targetArray[index] && index > 0) {
      // Move to previous input on backspace
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  const getPinValue = (isConfirm = false) => {
    return (isConfirm ? pinConfirmInput : pinInput).join('');
  };

  const confirmSetPin = () => {
    const pin = getPinValue();
    const confirm = getPinValue(true);

    if (!/^\d{4}$/.test(pin)) {
      toast({ 
        title: 'Invalid PIN', 
        description: 'PIN must be exactly 4 digits',
        variant: 'destructive'
      });
      return;
    }
    if (pin !== confirm) {
      toast({ 
        title: 'PINs do not match', 
        description: 'Please make sure both PINs are identical',
        variant: 'destructive'
      });
      return;
    }
    if (!project) return;

    const pAny = { ...(project as any) };
    pAny.apiKeyPin = pin;
    persistProject(pAny as Project);
    sessionStorage.setItem(`projectflow-unlock-${project.id}`, 'true');
    setIsKeysUnlocked(true);
    setShowPinModal(false);
    setPinInput(['', '', '', '']);
    setPinConfirmInput(['', '', '', '']);
    toast({ 
      title: 'PIN Set', 
      description: 'Your project API PIN has been saved securely.',
    });
  };

  const confirmUnlockPin = () => {
    if (!project) return;
    const storedPin = getProjectPin(project);
    if (!storedPin) {
      openSetPinModal();
      return;
    }
    const enteredPin = getPinValue();
    if (enteredPin === storedPin) {
      sessionStorage.setItem(`projectflow-unlock-${project.id}`, 'true');
      setIsKeysUnlocked(true);
      setShowPinModal(false);
      setPinInput(['', '', '', '']);
      toast({ 
        title: 'Unlocked', 
        description: 'API keys are now visible for this session.',
      });
    } else {
      toast({ 
        title: 'Incorrect PIN', 
        description: 'Please try again.',
        variant: 'destructive'
      });
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

  // Add Key confirm with validation
  const confirmAddKey = () => {
    if (!project) return;
    if (!newKeyName.trim()) {
      toast({ 
        title: 'Name required', 
        description: 'Please provide a name for this API key',
        variant: 'destructive'
      });
      return;
    }
    if (!newKeyValue.trim()) {
      toast({ 
        title: 'API key required', 
        description: 'Please provide the actual API key value',
        variant: 'destructive'
      });
      return;
    }

    const newKey: APIKey = {
      id: `apikey-${Date.now()}`,
      name: newKeyName.trim(),
      website: newKeyWebsite.trim() || undefined,
      key: newKeyValue.trim(),
      description: newKeyDescription.trim() || undefined,
    };

    handleAddApiKeyDirect(newKey);
    setNewKeyName('');
    setNewKeyWebsite('');
    setNewKeyValue('');
    setNewKeyDescription('');
    setShowAddKeyModal(false);
    toast({ 
      title: 'API Key Added', 
      description: 'Your API key has been securely stored.',
    });
  };

  // Update Key
  const confirmUpdateKey = () => {
    if (!editingKey) return;
    
    handleUpdateApiKey(editingKey.id, {
      name: editingKey.name,
      website: editingKey.website,
      key: editingKey.key,
      description: editingKey.description,
    });
    
    setEditingKey(null);
    toast({ 
      title: 'API Key Updated', 
      description: 'Your changes have been saved.',
    });
  };

  // Add Link
  const confirmAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      toast({ 
        title: 'Title and URL required', 
        variant: 'destructive'
      });
      return;
    }

    if (!validateWebsiteUrl(newLinkUrl)) {
      toast({ 
        title: 'Invalid URL', 
        description: 'Please enter a valid URL starting with http:// or https://',
        variant: 'destructive'
      });
      return;
    }

    const newLink: LinkType = {
      id: `link-${Date.now()}`,
      title: newLinkTitle.trim(),
      url: newLinkUrl.trim(),
      description: newLinkDescription.trim() || undefined,
    };

    persistLinksQuick([...editLinks, newLink]);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setNewLinkDescription('');
    setShowAddLinkModal(false);
    toast({ 
      title: 'Link Added', 
      description: 'Your link has been saved.',
    });
  };

  // Update Link
  const confirmUpdateLink = () => {
    if (!editingLink) return;

    const updatedLinks = editLinks.map(link => 
      link.id === editingLink.id ? editingLink : link
    );
    
    persistLinksQuick(updatedLinks);
    setEditingLink(null);
    toast({ 
      title: 'Link Updated', 
      description: 'Your changes have been saved.',
    });
  };

  // Toggle individual unmask
  const toggleUnmaskKey = (id: string) => {
    if (!isKeysUnlocked) {
      promptUnlockOrSet();
      return;
    }
    setUnmaskedKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // copy a key
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

  // open link detail modal
  const openLinkModal = (link: LinkType) => {
    setSelectedLink(link);
  };

  const closeLinkModal = () => {
    setSelectedLink(null);
  };

  // Start editing a key
  const startEditingKey = (key: APIKey) => {
    if (!isKeysUnlocked) {
      promptUnlockOrSet();
      return;
    }
    setEditingKey({ ...key });
  };

  // Start editing a link
  const startEditingLink = (link: LinkType) => {
    setEditingLink({ ...link });
  };

  // Delete link
  const handleDeleteLink = (linkId: string) => {
    const updated = editLinks.filter(link => link.id !== linkId);
    persistLinksQuick(updated);
    toast({ title: 'Link deleted' });
  };

  // Context menu for project icon
  const handleProjectIconContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleGoToRepo = () => {
    if (!project) return;
    
    // Try to find GitHub URL from project data
    const pAny = project as any;
    const repoUrl = pAny.repoUrl || pAny.githubUrl || pAny.repository;
    
    if (repoUrl && validateWebsiteUrl(repoUrl)) {
      window.open(repoUrl, '_blank');
    } else {
      toast({
        title: 'No Repository URL',
        description: 'This project does not have a repository URL configured.',
        variant: 'destructive'
      });
    }
    
    setShowContextMenu(false);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Loading skeleton
  if (!isDataLoaded) {
    return (
      <div className={cn('flex flex-col min-h-screen', font === 'serif' ? 'font-serif' : 'font-sans')}>
        <AppHeader
          searchTerm=""
          setSearchTerm={() => {}}
          onExport={() => {}}
          onImport={() => {}}
        />

        <main className="flex-1 w-full min-h-screen py-8 px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <Skeleton className="w-full h-80 rounded-xl" />
                <Skeleton className="w-full h-60 rounded-xl" />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="w-full h-96 rounded-xl" />
                <Skeleton className="w-full h-80 rounded-xl" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Not found
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-8">The project you're looking for doesn't exist or may have been moved.</p>
          <Button onClick={() => router.push('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> 
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  const progress = project.progress ?? 0;
  const dueDate = project.dueDate ? new Date(project.dueDate) : null;
  const isCompleted = completed.some(p => p.id === project.id);
  const isOverdue = dueDate && isPast(dueDate) && !isCompleted;
  const isSoon = dueDate && isWithinInterval(dueDate, { start: new Date(), end: addDays(new Date(), 7) }) && !isCompleted;


  return (
    <div className={cn('flex flex-col min-h-screen', font === 'serif' ? 'font-serif' : 'font-sans')}>
      <AppHeader
        searchTerm=""
        setSearchTerm={() => {}}
        onExport={() => {}}
        onImport={() => {}}
      />

      <main className="flex-1 w-full min-h-screen py-6 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> 
                Back to Dashboard
              </Button>
              <div className="w-px h-6 bg-border"></div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">Progress:</div>
                <Badge variant={progress === 100 ? "default" : "secondary"} className="text-sm">
                  {progress}%
                </Badge>
              </div>
              {dueDate && (
                <div
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-medium',
                    isOverdue ? 'text-red-500' : isSoon ? 'text-amber-600' : 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>{isOverdue ? 'Overdue:' : 'Due:'} {format(dueDate, 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleRevert}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleSave}
                size="icon"
                className="h-9 w-9"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Project Card */}
              <Card>
                <CardContent className="p-6 space-y-6">
                  {/* Logo with context menu */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div
                        onContextMenu={handleProjectIconContextMenu}
                        className="cursor-context-menu w-48 h-48"
                      >
                       <Image
                          src={logoDisplayUrl || `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+PHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM4ODgiPlByb2plY3Q8L3RleHQ+PC9zdmc+`}
                          alt={`${project.title} logo`}
                          width={280}
                          height={280}
                          className="rounded-xl border-2 border-border object-cover w-48 h-48"
                          priority
                          unoptimized={logoDisplayUrl?.startsWith('blob:') || logoDisplayUrl?.startsWith('data:')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-center">
                      {project.title}
                    </h1>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="min-h-[100px] resize-none"
                        placeholder="Describe your project..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Links - SIMPLIFIED DESIGN */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5" />
                      Project Links
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowAddLinkModal(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
               <div className="space-y-2">
                  {editLinks.length > 0 ? editLinks.map((link, index) => (
                    <motion.div 
                      key={link.id || `link-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                    >
                      <div 
                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center cursor-pointer"
                        onClick={() => openLinkModal(link)}
                      >
                        {validateWebsiteUrl(link.url) ? (
                          <img 
                            src={`https://www.google.com/s2/favicons?sz=64&domain=${new URL(link.url).hostname}`}
                            alt=""
                            className="w-5 h-5"
                          />
                        ) : (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => openLinkModal(link)}
                      >
                        <div className="text-sm font-medium truncate">{link.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditingLink(link)}
                          className="h-7 w-7"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLink(link.id!)}
                          className="h-7 w-7 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                      <LinkIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No links yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Add important project links</p>
                    </div>
                  )}
                </div>
                </CardContent>
              </Card>

              {/* API Keys - SIMPLIFIED DESIGN */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyIcon className="h-5 w-5" />
                      API Keys
                      {!isKeysUnlocked && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        if (!isKeysUnlocked) {
                          promptUnlockOrSet();
                          return;
                        }
                        setShowAddKeyModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {apiKeys.length > 0 ? apiKeys.map((key) => {
                      const isUnmasked = isKeysUnlocked && unmaskedKeys[key.id];
                      
                      return (
                        <motion.div 
                          key={key.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            {key.website && validateWebsiteUrl(key.website) ? (
                              <img 
                                src={getFaviconFor(key.website)} 
                                alt=""
                                className="w-5 h-5"
                              />
                            ) : (
                              <KeyIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{key.name}</div>
                            <div className="text-xs font-mono text-muted-foreground truncate">
                              {isUnmasked ? key.key : '•'.repeat(16)}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyKey(key)}
                              className="h-7 w-7"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditingKey(key)}
                              className="h-7 w-7"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteApiKey(key.id)}
                              className="h-7 w-7 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    }) : (
                      <div 
                        className="text-center py-8 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => {
                          if (!isKeysUnlocked) {
                            promptUnlockOrSet();
                            return;
                          }
                          setShowAddKeyModal(true);
                        }}
                      >
                        <KeyIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No API keys yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isKeysUnlocked ? 'Click to add API keys' : 'Unlock to manage API keys'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-xs text-muted-foreground">
                      {isKeysUnlocked ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Unlock className="h-3 w-3" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Locked
                        </span>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (!project) return;
                        if (isKeysUnlocked) {
                          sessionStorage.removeItem(`projectflow-unlock-${project.id}`);
                          setIsKeysUnlocked(false);
                          setUnmaskedKeys({});
                          setEditingKey(null);
                          toast({ title: 'API Keys Locked' });
                        } else {
                          promptUnlockOrSet();
                        }
                      }}
                      className="gap-1 h-8 text-xs"
                    >
                      {isKeysUnlocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                      {isKeysUnlocked ? 'Lock' : 'Unlock'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Requirements - AUTO-NUMBERED */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckSquare className="h-5 w-5" />
                    Project Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <textarea
                      value={requirementsDisplayText}
                      onChange={(e) => handleRequirementsChange(e.target.value)}
                      placeholder="1. Start typing your requirements... each new line becomes a numbered requirement"
                      className="w-full p-4 bg-transparent resize-none outline-none min-h-[400px] text-sm md:text-base leading-7 font-mono"
                      style={{ 
                        lineHeight: '1.75rem',
                      }}
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-3">
                    Each new line automatically becomes a numbered requirement.
                  </p>
                </CardContent>
              </Card>

              {/* Project Log */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <NotebookText className="h-5 w-5" />
                    Project Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Write your project notes, progress updates, or ideas here..."
                        className="min-h-[120px] resize-none"
                        rows={4}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {newNote.length}/1000 characters
                        </p>
                        <Button 
                          onClick={handleAddNote} 
                          disabled={!newNote.trim()}
                          size="icon"
                          className="h-9 w-9"
                        >
                          <GitCommit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Recent Entries</h4>
                        <span className="text-xs text-muted-foreground">
                          {(project.notes ?? []).length} total entries
                        </span>
                      </div>
                      
                      <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {(project.notes ?? []).length > 0 ? (
                          [...(project.notes ?? [])].slice().reverse().map((note, index) => (
                            <motion.div 
                              key={note.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex gap-4 text-sm group"
                            >
                              <div className="flex-shrink-0 w-20">
                                <div className="font-mono text-muted-foreground text-xs pt-1">
                                  {format(new Date(note.date), 'MMM dd, yyyy')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(note.date), 'HH:mm')}
                                </div>
                              </div>
                              
                              <div className="flex-1 bg-muted/50 p-4 rounded-lg border relative min-h-[80px]">
                                <p className="whitespace-pre-wrap text-sm pr-10">
                                  {note.content}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-3 right-3 h-7 w-7 opacity-70 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                                  onClick={() => handleDeleteNote(note.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                            <NotebookText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground mb-2">No log entries yet</p>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                              Start documenting your project journey. Add notes about progress, challenges, and insights.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* PIN Modal with Block Style */}
      <AnimatePresence>
        {showPinModal && project && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="border-0 shadow-2xl">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>
                    {pinMode === 'set' ? 'Set API Key PIN' : 'Enter PIN to Unlock'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pinMode === 'set' ? (
                    <>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-3 block text-center">Enter 4-digit PIN</label>
                          <div className="flex gap-3 justify-center">
                            {[0, 1, 2, 3].map((index) => (
                              <Input
                              key={index}
                              ref={(el: HTMLInputElement | null) => {
                                pinInputRefs.current[index] = el;
                              }}
                              value={pinInput[index]}
                              onChange={(e) => handlePinInputChange(index, e.target.value)}
                              onKeyDown={(e) => handlePinKeyDown(index, e)}
                              inputMode="numeric"
                              type={showPinInput ? 'text' : 'password'}
                              className="w-14 h-14 text-center text-xl font-mono"
                              maxLength={1}
                              autoFocus={index === 0}
                            />
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-3 block text-center">Confirm PIN</label>
                          <div className="flex gap-3 justify-center">
                            {[0, 1, 2, 3].map((index) => (
                              <Input
                                key={index}
                                value={pinConfirmInput[index]}
                                onChange={(e) => handlePinInputChange(index, e.target.value, true)}
                                onKeyDown={(e) => handlePinKeyDown(index, e, true)}
                                inputMode="numeric"
                                type={showPinInput ? 'text' : 'password'}
                                className="w-14 h-14 text-center text-xl font-mono"
                                maxLength={1}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setShowPinInput(!showPinInput)}
                          className="flex-shrink-0"
                        >
                          {showPinInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => { 
                              setShowPinModal(false); 
                              setPinInput(['', '', '', '']); 
                              setPinConfirmInput(['', '', '', '']); 
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={confirmSetPin}
                            disabled={getPinValue().length !== 4 || getPinValue(true).length !== 4}
                          >
                            Set PIN
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-3 block text-center">Enter 4-digit PIN</label>
                        <div className="flex gap-3 justify-center">
                          {[0, 1, 2, 3].map((index) => (
                           <Input
                            key={index}
                            ref={(el: HTMLInputElement | null) => {
                              pinInputRefs.current[index] = el;
                            }}
                            value={pinInput[index]}
                            onChange={(e) => handlePinInputChange(index, e.target.value)}
                            onKeyDown={(e) => handlePinKeyDown(index, e)}
                            inputMode="numeric"
                            type={showPinInput ? 'text' : 'password'}
                            className="w-14 h-14 text-center text-xl font-mono"
                            maxLength={1}
                            autoFocus={index === 0}
                          />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setShowPinInput(!showPinInput)}
                          className="flex-shrink-0"
                        >
                          {showPinInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => { 
                              setShowPinModal(false); 
                              setPinInput(['', '', '', '']); 
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={confirmUnlockPin}
                            disabled={getPinValue().length !== 4}
                          >
                            Unlock
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit API Key Modal */}
      <AnimatePresence>
        {(showAddKeyModal || editingKey) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyIcon className="h-5 w-5" />
                    {editingKey ? 'Edit API Key' : 'Add API Key'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <Input 
                      value={editingKey ? editingKey.name : newKeyName} 
                      onChange={(e) => editingKey ? 
                        setEditingKey({...editingKey, name: e.target.value}) : 
                        setNewKeyName(e.target.value)
                      } 
                      placeholder="Service Name (e.g. OpenAI, Stripe)" 
                      required 
                    />
                    
                    <Input 
                      value={editingKey ? editingKey.website || '' : newKeyWebsite} 
                      onChange={(e) => editingKey ? 
                        setEditingKey({...editingKey, website: e.target.value}) : 
                        setNewKeyWebsite(e.target.value)
                      } 
                      placeholder="Website (optional)" 
                    />
                    
                    <Input 
                      value={editingKey ? editingKey.key : newKeyValue} 
                      onChange={(e) => editingKey ? 
                        setEditingKey({...editingKey, key: e.target.value}) : 
                        setNewKeyValue(e.target.value)
                      } 
                      placeholder="API Key Value" 
                      className="font-mono" 
                      required 
                    />
                    
                    <Textarea 
                      value={editingKey ? editingKey.description || '' : newKeyDescription} 
                      onChange={(e) => editingKey ? 
                        setEditingKey({...editingKey, description: e.target.value}) : 
                        setNewKeyDescription(e.target.value)
                      }                       placeholder="Optional description or notes about this API key" 
                      rows={3} 
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => { 
                        if (editingKey) {
                          setEditingKey(null);
                        } else {
                          setShowAddKeyModal(false); 
                          setNewKeyName(''); 
                          setNewKeyWebsite(''); 
                          setNewKeyValue(''); 
                          setNewKeyDescription(''); 
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={editingKey ? confirmUpdateKey : confirmAddKey} 
                      disabled={
                        editingKey ? 
                        !editingKey.name.trim() || !editingKey.key.trim() :
                        !newKeyName.trim() || !newKeyValue.trim()
                      }
                    >
                      {editingKey ? 'Update Key' : 'Add Key'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Link Modal */}
      <AnimatePresence>
        {(showAddLinkModal || editingLink) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    {editingLink ? 'Edit Link' : 'Add Link'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <Input 
                      value={editingLink ? editingLink.title : newLinkTitle} 
                      onChange={(e) => editingLink ? 
                        setEditingLink({...editingLink, title: e.target.value}) : 
                        setNewLinkTitle(e.target.value)
                      } 
                      placeholder="Link Title" 
                      required 
                    />
                    
                    <Input 
                      value={editingLink ? editingLink.url : newLinkUrl} 
                      onChange={(e) => editingLink ? 
                        setEditingLink({...editingLink, url: e.target.value}) : 
                        setNewLinkUrl(e.target.value)
                      } 
                      placeholder="https://example.com" 
                      required 
                    />
                    
                    <Textarea 
                      value={editingLink ? editingLink.description || '' : newLinkDescription} 
                      onChange={(e) => editingLink ? 
                        setEditingLink({...editingLink, description: e.target.value}) : 
                        setNewLinkDescription(e.target.value)
                      } 
                      placeholder="Optional description" 
                      rows={3} 
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => { 
                        if (editingLink) {
                          setEditingLink(null);
                        } else {
                          setShowAddLinkModal(false); 
                          setNewLinkTitle(''); 
                          setNewLinkUrl(''); 
                          setNewLinkDescription(''); 
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={editingLink ? confirmUpdateLink : confirmAddLink} 
                      disabled={
                        editingLink ? 
                        !editingLink.title.trim() || !editingLink.url.trim() :
                        !newLinkTitle.trim() || !newLinkUrl.trim()
                      }
                    >
                      {editingLink ? 'Update Link' : 'Add Link'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Link Details Modal */}
      <AnimatePresence>
        {selectedLink && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md"
            >
              <Card className="border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Link Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {validateWebsiteUrl(selectedLink.url) ? (
                        <img 
                          src={`https://www.google.com/s2/favicons?sz=64&domain=${new URL(selectedLink.url).hostname}`}
                          alt=""
                          className="w-10 h-10"
                        />
                      ) : (
                        <Globe className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Title</div>
                        <div className="font-medium">{selectedLink.title}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">URL</div>
                        <div className="text-sm break-all">{selectedLink.url}</div>
                      </div>

                      {selectedLink.description && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
                          <div className="text-sm text-muted-foreground">{selectedLink.description}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <div className="flex justify-end gap-2 p-4 pt-0">
                  <Button 
                    variant="outline"
                    onClick={() => window.open(selectedLink.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit
                  </Button>
                  <Button variant="outline" onClick={closeLinkModal}>
                    Close
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Context Menu for Project Icon */}
      <AnimatePresence>
        {showContextMenu && (
          <div 
            className="fixed z-50 bg-background border rounded-lg shadow-lg py-1 min-w-[140px]"
            style={{
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <button
                onClick={handleGoToRepo}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                Go to Repository
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
