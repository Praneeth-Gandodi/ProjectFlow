// src/components/project-card.tsx
'use client';

import type { Project } from '@/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit2, Trash2, CheckCircle, ArrowLeft, CalendarIcon } from 'lucide-react';
import { useDrag, useDrop, DragSourceMonitor } from 'react-dnd';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';
import { useLogoUrl } from '@/lib/useLogoUrl';

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  moveCard: (dragId: string, hoverId: string) => void;
  source: 'ideas' | 'completed';
  onUpdateProject: (project: Project) => void;
  onMarkAsCompleted: (project: Project) => void;
  onMoveToIdeas: (project: Project) => void;
}

type DragItem = {
  id: string;
  source: 'ideas' | 'completed';
};

const PLACEHOLDER_DATA_URI = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+PHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM4ODgiPk5vIExvZ288L3RleHQ+PC9zdmc+`;

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  moveCard,
  source,
  onUpdateProject,
  onMarkAsCompleted,
  onMoveToIdeas
}: ProjectCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [localProgress, setLocalProgress] = useState<number>(project.progress ?? 0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { url: logoUrl } = useLogoUrl(project.logo);

  const [{ isDragging }, dragRef, previewRef] = useDrag<DragItem, void, { isDragging: boolean }>(() => ({
    type: 'project',
    item: { id: project.id, source },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [project.id, source]);

  const [, dropRef] = useDrop<DragItem, void, unknown>(() => ({
    accept: 'project',
    hover: (item) => {
      if (!item || !item.id || !project.id) return;
      if (item.id !== project.id && item.source === source) {
        moveCard(item.id, project.id);
      }
    },
  }), [project.id, source, moveCard]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    dragRef(dropRef(node));
  }, [ref, dragRef, dropRef]);

  useEffect(() => {
    setLocalProgress(project.progress ?? 0);
  }, [project.progress]);

  useEffect(() => {
    if (isEditingProgress) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingProgress]);

  const handleProgressCommit = () => {
    let newProgress = Number(localProgress);
    if (isNaN(newProgress) || newProgress < 0) newProgress = 0;
    if (newProgress > 100) newProgress = 100;

    setLocalProgress(newProgress);
    setIsEditingProgress(false);

    if (project.progress !== newProgress) {
      onUpdateProject({ ...project, progress: newProgress });
    }
  };

  const handleProgressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleProgressCommit();
    } else if (e.key === 'Escape') {
      setLocalProgress(project.progress ?? 0);
      setIsEditingProgress(false);
    }
  };

  const safeTitle = project.title || 'Untitled Project';
  const tags = project.tags || [];

  const dueDate = project.dueDate ? new Date(project.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && source === 'ideas';
  const isSoon = dueDate && isWithinInterval(dueDate, { start: new Date(), end: addDays(new Date(), 7) }) && source === 'ideas';

  return (
    <div ref={previewRef} style={{ opacity: isDragging ? 0.5 : 1 }} className="w-full">
      <motion.div
        ref={ref}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="relative rounded-lg h-full group/card cursor-grab"
      >
        <Card className="glass-card w-full h-full flex flex-col p-5 border-none shadow-sm">
          <Link href={`/project/${project.id}`} className="contents">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted/50 border border-white/10 relative shadow-inner">
                  <Image
                    src={logoUrl || PLACEHOLDER_DATA_URI}
                    alt={`${safeTitle} logo`}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized={logoUrl?.startsWith('data:') || logoUrl?.startsWith('blob:')}
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <CardTitle className="font-headline text-lg leading-tight group-hover:text-primary transition-colors truncate">
                    {safeTitle}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2 leading-relaxed">
                    {project.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>

          <CardContent className="space-y-3 flex-grow p-0 py-3">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-secondary/50 hover:bg-secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {dueDate && source === 'ideas' && (
              <div className={cn('flex items-center gap-1.5 text-xs font-medium', isOverdue ? 'text-red-500' : isSoon ? 'text-amber-600' : 'text-muted-foreground')}>
                <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{isOverdue ? 'Overdue:' : 'Due:'} {format(dueDate, 'MMM d, yyyy')}</span>
              </div>
            )}
          </CardContent>

          <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
            <div className="w-16 text-center">
              {isEditingProgress && source === 'ideas' ? (
                <Input
                  ref={inputRef}
                  type="text"
                  value={localProgress}
                  onChange={(e) => setLocalProgress(Number(e.target.value.replace(/[^0-9]/g, '')))}
                  onBlur={handleProgressCommit}
                  onKeyDown={handleProgressKeyDown}
                  className="h-7 w-12 text-center text-sm px-1 bg-background/80 backdrop-blur"
                />
              ) : (
                <button
                  onClick={(e) => { e.preventDefault(); if (source === 'ideas') setIsEditingProgress(true); }}
                  disabled={source === 'completed'}
                  className={cn("text-sm font-medium px-2 py-1 rounded-md transition-colors backdrop-blur-sm", source === 'ideas' ? "text-primary cursor-pointer hover:bg-primary/10" : "text-muted-foreground cursor-not-allowed")}
                  aria-label="Edit progress"
                >
                  {source === 'completed' ? '100%' : `${Math.round(localProgress ?? 0)}%`}
                </button>
              )}
            </div>

            {source === 'ideas' && (
              <Button onClick={() => onMarkAsCompleted(project)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-green-600 hover:bg-green-500/10" aria-label={`Mark ${safeTitle} as completed`}>
                <CheckCircle className="h-5 w-5" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10" aria-label="More actions"><MoreVertical size={16} /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-panel">
                <DropdownMenuItem onClick={onEdit}><Edit2 className="mr-2 h-4 w-4" /><span>Edit</span></DropdownMenuItem>
                {source === 'completed' && (<DropdownMenuItem onClick={() => onMoveToIdeas(project)}><ArrowLeft className="mr-2 h-4 w-4" /><span>Move to Ideas</span></DropdownMenuItem>)}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /><span>Delete</span></DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-panel">
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete this project.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
