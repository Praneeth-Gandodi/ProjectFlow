'use client';

import type { Project } from '@/app/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GripVertical, MoreVertical, Edit2, Trash2, CheckCircle, ArrowLeft } from 'lucide-react';
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

  return (
    <div ref={previewRef as unknown as React.LegacyRef<HTMLDivElement>} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div ref={ref} className="relative transition-shadow hover:shadow-lg rounded-lg h-full group/card">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab text-muted-foreground hover:text-foreground opacity-0 group-hover/card:opacity-100 transition-opacity z-10" aria-hidden>
          <GripVertical size={20} />
        </div>

        <Card className="w-full h-full flex flex-col pl-8">
          <Link href={`/project/${project.id}`} className="block h-full">
            <div className="flex flex-col h-full">
              <CardHeader className="pr-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
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
                        className="rounded-lg border object-cover"
                        unoptimized
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <CardTitle className="font-headline text-xl">{safeTitle}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">{safeDescription}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-grow">
                {tags.length > 0 && (
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter></CardFooter>
            </div>
          </Link>

          <div className="absolute top-2 right-2 flex items-center gap-1">
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
                    "text-sm font-bold",
                    source === 'ideas' ? "text-primary cursor-pointer" : "text-muted-foreground cursor-not-allowed"
                  )}
                  aria-label="Edit progress"
                >
                  {Math.round(localProgress ?? 0)}%
                </button>
              )}
            </div>

            {source === 'ideas' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  onMarkAsCompleted(project);
                }}
                aria-label={`Mark ${safeTitle} as completed`}
              >
                <CheckCircle className="h-5 w-5 text-muted-foreground hover:text-green-600" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions" onClick={(e) => e.preventDefault()}>
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
                      <span>Delete</span>
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
