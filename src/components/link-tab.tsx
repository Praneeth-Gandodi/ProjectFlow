
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { Link } from '@/app/types';
import { LinkCard } from './link-card';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { LinkForm } from './link-form';
import { useToast } from '@/hooks/use-toast';

interface LinkTabProps {
  links: Link[];
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
  searchTerm: string;
}

export function LinkTab({ links, setLinks, searchTerm }: LinkTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const { toast } = useToast();

  const handleAddLink = () => {
    setEditingLink(null);
    setIsFormOpen(true);
  };

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    setIsFormOpen(true);
  };
  
  const handleDeleteLink = useCallback((id: string) => {
    setLinks(prev => {
      const linkToDelete = prev.find(l => l.id === id);
      if (linkToDelete) {
        toast({ title: "Link Deleted", description: `"${linkToDelete.title}" has been removed.` });
      }
      return prev.filter(l => l.id !== id);
    });
  }, [setLinks, toast]);

  const moveCard = useCallback((dragId: string, hoverId: string) => {
    setLinks(prevLinks => {
      const dragIndex = prevLinks.findIndex(l => l.id === dragId);
      const hoverIndex = prevLinks.findIndex(l => l.id === hoverId);
      if (dragIndex === -1 || hoverIndex === -1) return prevLinks;

      const newLinks = [...prevLinks];
      const [draggedItem] = newLinks.splice(dragIndex, 1);
      newLinks.splice(hoverIndex, 0, draggedItem);
      return newLinks;
    });
  }, [setLinks]);

  const filteredLinks = useMemo(() => {
    if (!searchTerm) return links;
    return links.filter(l =>
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [links, searchTerm]);

  return (
    <div className="mt-6">
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddLink}>
          <Plus className="mr-2 h-4 w-4" /> Add Link
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredLinks.map(link => (
          <LinkCard 
            key={link.id} 
            link={link} 
            onEdit={() => handleEditLink(link)} 
            onDelete={() => handleDeleteLink(link.id!)}
            moveCard={moveCard}
          />
        ))}
        {filteredLinks.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-10">
            {searchTerm ? 'No links match your search.' : 'No links saved yet.'}
          </div>
        )}
      </div>
      <LinkForm 
        isOpen={isFormOpen} 
        setIsOpen={setIsFormOpen} 
        link={editingLink} 
        setLinks={setLinks}
      />
    </div>
  );
}
