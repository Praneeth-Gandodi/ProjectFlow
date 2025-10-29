'use client';

import type { Project } from '@/app/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GripVertical, MoreVertical, Edit2, Trash2, CheckCircle, ExternalLink, Link as LinkIcon, Tag } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { useRef } from 'react';
import Image from 'next/image';
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
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  moveCard: (dragId: string, hoverId: string) => void;
  source: 'ideas' | 'completed';
  onUpdateProject: (project: Project) => void;
  onMarkAsCompleted: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete, moveCard, source, onUpdateProject, onMarkAsCompleted }: ProjectCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'project',
    item: { id: project.id, source },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: 'project',
    hover: (item: { id: string; source: 'ideas' | 'completed' }) => {
      if (item.id !== project.id && item.source === source) {
        moveCard(item.id, project.id);
      }
    },
  }));

  drag(drop(ref));

  const handleProgressChange = (newProgress: number[]) => {
    onUpdateProject({ ...project, progress: newProgress[0] });
  };

  return (
    <div ref={preview} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card ref={ref} className="group/card relative transition-shadow hover:shadow-lg bg-card/80 backdrop-blur-sm">
        <div ref={drag} className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab text-muted-foreground hover:text-foreground opacity-50 group-hover/card:opacity-100 transition-opacity">
          <GripVertical size={20} />
        </div>
        <CardHeader className="pl-10 pr-12">
           <div className="flex items-start gap-4">
            <Image
              src={project.logo}
              alt={`${project.title} logo`}
              width={64}
              height={64}
              className="rounded-lg border"
              data-ai-hint="logo"
            />
            <div className="flex-1">
              <CardTitle className="font-headline text-xl">{project.title}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">{project.description}</CardDescription>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="mr-2 h-4 w-4 text-destructive" />
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
                      <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pl-10 space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Requirements</h4>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-background/50 p-3 rounded-md border max-h-32 overflow-y-auto">{project.requirements || 'No requirements yet.'}</div>
          </div>

           {project.links && project.links.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Useful Links</h4>
              <div className="flex flex-col gap-2">
                {project.links.map((link, index) => (
                  <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-2">
                    <LinkIcon size={14} />
                    <span>{link.title}</span>
                    <ExternalLink size={14} className="text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {project.tags && project.tags.length > 0 && (
             <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5"><Tag size={14} /> Tags</h4>
                <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
            </div>
          )}
          
        </CardContent>
        <CardFooter className="pl-10 pr-6 flex flex-col items-start gap-3">
            <div className='w-full'>
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-sm">Progress</h4>
                <span className="text-sm font-bold text-primary">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
               <Slider
                    defaultValue={[project.progress]}
                    max={100}
                    step={1}
                    className="mt-3"
                    onValueChange={handleProgressChange}
                    disabled={source === 'completed'}
                />
            </div>
            {source === 'ideas' && (
              <Button onClick={() => onMarkAsCompleted(project)} variant="outline" size="sm" className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Completed
              </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
