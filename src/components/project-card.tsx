'use client';

import type { Project } from '@/app/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit2, Trash2, CheckCircle, ArrowLeft, CalendarIcon } from 'lucide-react';
import { useDrag, useDrop, DragSourceMonitor } from 'react-dnd';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

const PLACEHOLDER_SVG = encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'>
    <rect width='100%' height='100%' fill='%23f3f4f6'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='%23888'>No Image</text>
  </svg>
`);
const PLACEHOLDER_DATA_URI = `data:image/svg+xml;utf8,${PLACEHOLDER_SVG}`;

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
  const [localProgress, setLocalProgress] = useState<number>(typeof project.progress === 'number' ? project.progress : 0);
  const inputRef = useRef<HTMLInputElement>(null);

  // useDrag — typed
  const [{ isDragging }, dragRef, previewRef] = useDrag<DragItem, void, { isDragging: boolean }>(() => ({
    type: 'project',
    item: { id: project?.id ?? '', source },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [project?.id, source]);

  // useDrop — typed
  const [, dropRef] = useDrop<DragItem, void, unknown>(() => ({
    accept: 'project',
    hover: (item) => {
      try {
        if (!item || !item.id || !project?.id) return;
        if (item.id !== project.id && item.source === source) {
          moveCard(item.id, project.id);
        }
      } catch (err) {
        // swallow drag errors
      }
    },
  }), [project?.id, source, moveCard]);

  // attach drag/drop refs safely
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    try {
      if (typeof dropRef === 'function') dropRef(node);
      if (typeof dragRef === 'function') dragRef(node);
      if (previewRef && typeof previewRef === 'function') previewRef(node);
    } catch {
      // ignore attach errors
    }
  }, [ref, dragRef, dropRef, previewRef]);

  useEffect(() => {
    setLocalProgress(typeof project.progress === 'number' ? project.progress : 0);
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
      try {
        onUpdateProject({ ...project, progress: newProgress });
      } catch (err) {
        console.error('Failed to update project progress', err);
      }
    }
  };

  const handleProgressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleProgressCommit();
    } else if (e.key === 'Escape') {
      setLocalProgress(project.progress || 0);
      setIsEditingProgress(false);
    }
  };

  const rawLogo = (project && (project as any).logo) ?? '';
  const logoSrc = typeof rawLogo === 'string' && rawLogo.trim() !== '' ? rawLogo.trim() : PLACEHOLDER_DATA_URI;
  const isExternal = /^https?:\/\//i.test(logoSrc);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_DATA_URI;
  };

  const tags = Array.isArray(project.tags) ? project.tags.filter(Boolean) : [];
  const safeTitle = typeof project.title === 'string' && project.title.trim() !== '' ? project.title : 'Untitled Project';
  const safeDescription = typeof project.description === 'string' ? project.description : '';
  
  const dueDate = project.dueDate ? new Date(project.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && source === 'ideas';
  const isSoon = dueDate && isWithinInterval(dueDate, { start: new Date(), end: addDays(new Date(), 7) }) && source === 'ideas';

  return (
    <div 
      ref={previewRef as unknown as React.LegacyRef<HTMLDivElement>} 
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="w-full"
    >
      <div ref={ref} className="relative transition-all hover:shadow-lg rounded-lg h-full group/card cursor-grab">
        {/* Rectangular Card with proper aspect ratio */}
        <Card className="w-full h-full flex flex-col p-5">
          <Link href={`/project/${project.id}`} className="contents">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center gap-4">
                {/* Logo Container - Using your size w-16 h-16 */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted border">
                  {isExternal ? (
                    <img
                      src={logoSrc}
                      alt={`${safeTitle} logo`}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover"
                      onError={handleImgError}
                      loading="lazy"
                    />
                  ) : (
                    <Image
                      src={logoSrc}
                      alt={`${safeTitle} logo`}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover"
                      unoptimized
                    />
                  )}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <CardTitle className="font-headline text-lg leading-tight group-hover:underline truncate">
                    {safeTitle}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2 leading-relaxed">
                    {safeDescription}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>

          <CardContent className="space-y-3 flex-grow p-0 py-3">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {dueDate && source === 'ideas' && (
              <div
                className={cn(
                  'flex items-center gap-1.5 text-xs font-medium',
                  isOverdue ? 'text-red-500' : isSoon ? 'text-amber-600' : 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">
                  {isOverdue ? 'Overdue:' : 'Due:'} {format(dueDate, 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-0 pt-2">
            {source === 'ideas' && (
              <Button
                onClick={() => {
                  try {
                    onMarkAsCompleted(project);
                  } catch (err) {
                    console.error('Mark as completed failed', err);
                  }
                }}
                variant="outline"
                size="sm"
                className="w-full"
                aria-label={`Mark ${safeTitle} as completed`}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Completed
              </Button>
            )}
          </CardFooter>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="w-16 text-center">
              {isEditingProgress && source === 'ideas' ? (
                <Input
                  ref={inputRef}
                  type="text"
                  value={localProgress}
                  onChange={(e) => setLocalProgress(Number(e.target.value.replace(/[^0-9]/g, '')))}
                  onBlur={handleProgressCommit}
                  onKeyDown={handleProgressKeyDown}
                  className="h-7 w-12 text-center text-sm px-1"
                />
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (source === 'ideas') setIsEditingProgress(true);
                  }}
                  disabled={source === 'completed'}
                  className={cn(
                    "text-sm font-medium px-2 py-1 rounded-md transition-colors",
                    source === 'ideas' 
                      ? "text-primary cursor-pointer hover:bg-accent" 
                      : "text-muted-foreground cursor-not-allowed"
                  )}
                  aria-label="Edit progress"
                >
                  {source === 'completed' ? '100%' : `${Math.round(localProgress ?? 0)}%`}
                </button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { try { onEdit(); } catch (err) { console.error(err); } }}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>

                {source === 'completed' && (
                  <DropdownMenuItem onClick={() => { try { onMoveToIdeas(project); } catch (err) { console.error(err); } }}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    <span>Move to Ideas</span>
                  </DropdownMenuItem>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span className="text-destructive">Delete</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this project.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          try {
                            onDelete();
                          } catch (err) {
                            console.error('Delete handler error', err);
                          }
                        }}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </div>
    </div>
  );
}
