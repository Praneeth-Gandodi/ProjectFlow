'use client';

import type { Project } from '@/app/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GripVertical, MoreVertical, Edit2, Trash2, CheckCircle, ExternalLink, Link as LinkIcon, Tag } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { useState, useRef } from 'react';
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
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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

  const logoSrc = project.logo || `https://picsum.photos/seed/${project.id}/64/64`;

  return (
    <div ref={preview} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <div ref={ref} className="relative transition-shadow hover:shadow-lg rounded-lg">
          <div ref={drag} className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab text-muted-foreground hover:text-foreground opacity-0 group-hover/card:opacity-100 transition-opacity z-10">
            <GripVertical size={20} />
          </div>
            <Card className="group/card w-full h-full flex flex-col">
              <Link href={`/project/${project.id}`} passHref legacyBehavior>
                <a target="_blank" className='contents'>
                  <CardHeader className="pl-10 pr-4">
                    <div className="flex items-start gap-4">
                      <Image
                        src={logoSrc}
                        alt={`${project.title} logo`}
                        width={64}
                        height={64}
                        className="rounded-lg border object-cover"
                      />
                      <div className="flex-1">
                        <CardTitle className="font-headline text-xl">{project.title}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">{project.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </a>
              </Link>

              <CardContent className="pl-10 space-y-4 flex-grow">
                {project.tags && project.tags.length > 0 && (
                  <div>
                      <div className="flex flex-wrap gap-2">
                          {project.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                      </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pl-10 pr-4 flex flex-col items-start gap-3">
                  {source === 'ideas' && (
                    <Button onClick={() => onMarkAsCompleted(project)} variant="outline" size="sm" className="w-full">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Completed
                    </Button>
                  )}
              </CardFooter>

              <div className="absolute top-2 right-2 flex items-center gap-2">
                 <span className="text-sm font-bold text-primary">
                    {source === 'completed' ? 100 : project.progress}%
                  </span>
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
            </Card>
        </div>
    </div>
  );
}
