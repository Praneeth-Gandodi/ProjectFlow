'use client';

import type { Course } from '@/app/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ExternalLink, MoreVertical, Edit2, Trash2, CheckCircle, Link as LinkIcon, GripVertical } from 'lucide-react';
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
import { Badge } from './ui/badge';
import { TechLogo } from './tech-logo';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';
import { useDrag, useDrop, DragSourceMonitor } from 'react-dnd';

interface CourseCardProps {
  course: Course;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  moveCard: (dragId: string, hoverId: string) => void;
}

type DragItem = {
  id: string;
};

export function CourseCard({ course, onEdit, onDelete, onToggleComplete, moveCard }: CourseCardProps) {

  const hasLinks = course.links && course.links.length > 0;
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, dragRef, previewRef] = useDrag<DragItem, void, { isDragging: boolean }>(() => ({
    type: 'course',
    item: { id: course.id },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [course.id]);

  const [, dropRef] = useDrop<DragItem, void, unknown>(() => ({
      accept: 'course',
      hover: (item) => {
          if (!item || !item.id || !course?.id) return;
          if (item.id !== course.id) {
              moveCard(item.id, course.id);
          }
      },
  }), [course.id, moveCard]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof dropRef === 'function') dropRef(node);
    if (typeof dragRef === 'function') dragRef(node);
    if (previewRef && typeof previewRef === 'function') previewRef(node);
  }, [ref, dragRef, dropRef, previewRef]);

  return (
    <div ref={previewRef as unknown as React.LegacyRef<HTMLDivElement>} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <div ref={ref} className="relative transition-shadow hover:shadow-lg rounded-lg h-full group/card">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab text-muted-foreground hover:text-foreground opacity-0 group-hover/card:opacity-100 transition-opacity z-10" aria-hidden>
                <GripVertical size={20} />
            </div>
            <Card className="flex flex-col h-full transition-shadow hover:shadow-lg pl-8">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                <Link href={`/course/${course.id}`} className="flex items-start gap-4 flex-1 min-w-0">
                    <TechLogo course={course} className="w-12 h-12 flex-shrink-0" />
                    <div className="flex-1">
                    <CardTitle className="font-headline text-lg group-hover:underline">{course.name}</CardTitle>
                    {course.completed && (
                        <Badge variant="default" className="mt-2 bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed
                        </Badge>
                    )}
                    </div>
                </Link>
                <div className="flex items-center flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleComplete}>
                    <CheckCircle className={cn("h-5 w-5", course.completed ? "text-green-600 fill-green-100 dark:fill-green-900" : "text-muted-foreground")} />
                    </Button>
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
                        <DropdownMenuSeparator />
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
                                This action cannot be undone. This will permanently delete this course.
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
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <Link href={`/course/${course.id}`} className="h-full w-full">
                {hasLinks ? (
                    <div className="space-y-2">
                    {course.links?.slice(0, 3).map((link, index) => (
                        <div key={link.id || index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LinkIcon className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{link.title}</span>
                        </div>
                    ))}
                    {course.links && course.links.length > 3 && (
                        <p className="text-xs text-muted-foreground pt-1">+ {course.links.length - 3} more links</p>
                    )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full">
                    <p className="text-sm italic">No links added.</p>
                    <p className="text-xs mt-1">Click to add notes &amp; resources.</p>
                    </div>
                )}
                </Link>
            </CardContent>
            </Card>
        </div>
    </div>
  );
}
