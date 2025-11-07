'use client';

import type { Course, Link as LinkType } from '@/app/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ExternalLink, MoreVertical, Edit2, Trash2, CheckCircle, Circle, Link as LinkIcon } from 'lucide-react';
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

interface CourseCardProps {
  course: Course;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

export function CourseCard({ course, onEdit, onDelete, onToggleComplete }: CourseCardProps) {

  const hasLinks = course.links && course.links.length > 0;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <TechLogo course={course} className="w-12 h-12 flex-shrink-0" />
            <div className="flex-1">
              <CardTitle className="font-headline text-lg">{course.name}</CardTitle>
              {course.completed && (
                <Badge variant="default" className="mt-2 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
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
        {hasLinks ? (
          <div className="space-y-2">
            {course.links?.map((link, index) => (
              <a 
                key={link.id || index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <LinkIcon className="h-3 w-3 flex-shrink-0" />
                <span className="truncate group-hover:underline">{link.title}</span>
                <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No links added.</p>
        )}
      </CardContent>
    </Card>
  );
}
