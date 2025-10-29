'use client';

import React, { useState } from 'react';
import type { Link } from '@/app/types';
import { LinkCard } from './link-card';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { LinkForm } from './link-form';

interface LinkTabProps {
  links: Link[];
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
}

export function LinkTab({ links, setLinks }: LinkTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  const handleAddLink = () => {
    setEditingLink(null);
    setIsFormOpen(true);
  };

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    setIsFormOpen(true);
  };
  
  const handleDeleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="mt-6">
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddLink}>
          <Plus className="mr-2 h-4 w-4" /> Add Link
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map(link => (
          <LinkCard 
            key={link.id} 
            link={link} 
            onEdit={() => handleEditLink(link)} 
            onDelete={() => handleDeleteLink(link.id)} 
          />
        ))}
        {links.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-10">
            No links saved yet.
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
