'use client';

import type { Link as LinkType } from '@/app/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ExternalLink, MoreVertical, Edit2, Trash2, GripVertical } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"
import Image from 'next/image';
import { useRef, useEffect } from 'react';
import { useDrag, useDrop, DragSourceMonitor } from 'react-dnd';

interface LinkCardProps {
  link: LinkType;
  onEdit: () => void;
  onDelete: () => void;
  moveCard: (dragId: string, hoverId: string) => void;
}

type DragItem = {
  id: string;
};


export function LinkCard({ link, onEdit, onDelete, moveCard }: LinkCardProps) {
    const displayUrl = link.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    const faviconUrl = `https://www.google.com/s2/favicons?sz=128&domain_url=${link.url}`;

    const ref = useRef<HTMLDivElement | null>(null);

    const [{ isDragging }, dragRef, previewRef] = useDrag<DragItem, void, { isDragging: boolean }>(() => ({
        type: 'link',
        item: { id: link.id! },
        collect: (monitor: DragSourceMonitor) => ({
        isDragging: !!monitor.isDragging(),
        }),
    }), [link.id]);

    const [, dropRef] = useDrop<DragItem, void, unknown>(() => ({
        accept: 'link',
        hover: (item) => {
            if (!item || !item.id || !link?.id) return;
            if (item.id !== link.id) {
                moveCard(item.id, link.id);
            }
        },
    }), [link.id, moveCard]);

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
            <Card className="flex flex-col h-full pl-8">
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center justify-between">
                <span className="flex items-center gap-3">
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                        <Image 
                        src={faviconUrl}
                        alt={`${link.title} favicon`}
                        width={32}
                        height={32}
                        className="object-contain"
                        />
                    </div>
                    {link.title}
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
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this link.
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
                </CardTitle>
                {link.description && <CardDescription>{link.description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-grow">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors break-all">
                {displayUrl}
                </a>
            </CardContent>
            <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                    Open Link <ExternalLink className="ml-2 h-4 w-4" />
                </a>
                </Button>
            </CardFooter>
            </Card>
        </div>
    </div>
  );
}
