
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { Project } from '@/app/types';
import { ProjectList } from './project-list';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { ProjectForm } from './project-form';
import { useToast } from '@/hooks/use-toast';

interface ProjectTabProps {
  ideas: Project[];
  setIdeas: React.Dispatch<React.SetStateAction<Project[]>>;
  completed: Project[];
  setCompleted: React.Dispatch<React.SetStateAction<Project[]>>;
  isCompletedTab: boolean;
  searchTerm: string;
}

export function ProjectTab({ ideas, setIdeas, completed, setCompleted, isCompletedTab, searchTerm }: ProjectTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<(Project & { source: 'ideas' | 'completed' }) | null>(null);
  const { toast } = useToast();

  const handleAddProject = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project, source: 'ideas' | 'completed') => {
    setEditingProject({ ...project, source });
    setIsFormOpen(true);
  };

  const handleSaveProject = useCallback((savedProject: Project) => {
    const source = editingProject?.source;
    if (source) {
      const setList = source === 'completed' ? setCompleted : setIdeas;
      setList(prev => prev.map(p => p.id === savedProject.id ? savedProject : p));
      toast({ title: 'Project updated!' });
    } else {
      setIdeas(prev => [savedProject, ...prev]);
      toast({ title: 'New project added!' });
    }
    setEditingProject(null);
  }, [editingProject, setIdeas, setCompleted, toast]);

  const moveProject = useCallback((id: string, from: 'ideas' | 'completed', to: 'ideas' | 'completed') => {
    if (from === to) return;

    let projectToMove: Project | undefined;
    if (from === 'ideas') {
      projectToMove = ideas.find(p => p.id === id);
      if (projectToMove) setIdeas(prev => prev.filter(p => p.id !== id));
    } else {
      projectToMove = completed.find(p => p.id === id);
      if (projectToMove) setCompleted(prev => prev.filter(p => p.id !== id));
    }

    if (!projectToMove) return;

    if (to === 'ideas') {
      setIdeas(prev => [{ ...projectToMove, progress: projectToMove.progress === 100 ? 99 : projectToMove.progress ?? 0 }, ...prev]);
      toast({ title: 'Project Moved', description: `"${projectToMove.title}" moved to Ideas.` });
    } else {
      setCompleted(prev => [{ ...projectToMove, progress: 100 }, ...prev]);
      toast({ title: 'Project Completed!', description: `"${projectToMove.title}" moved to Completed.` });
    }
  }, [ideas, completed, setIdeas, setCompleted, toast]);

  const projects = useMemo(() => {
    const sourceList = isCompletedTab ? completed : ideas;
    if (!searchTerm) return sourceList;
    return sourceList.filter(p =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [isCompletedTab, ideas, completed, searchTerm]);
  
  const moveCard = useCallback((dragId: string, hoverId: string) => {
    const setList = isCompletedTab ? setCompleted : setIdeas;
    setList(prev => {
        const dragIndex = prev.findIndex(p => p.id === dragId);
        const hoverIndex = prev.findIndex(p => p.id === hoverId);
        if (dragIndex === -1 || hoverIndex === -1) return prev;
        
        const newProjects = [...prev];
        const [draggedItem] = newProjects.splice(dragIndex, 1);
        newProjects.splice(hoverIndex, 0, draggedItem);
        return newProjects;
    });
  }, [isCompletedTab, setIdeas, setCompleted]);

  return (
    <div className="mt-6">
      {!isCompletedTab && (
        <div className="flex justify-end mb-4">
          <Button onClick={handleAddProject}><Plus className="mr-2 h-4 w-4" /> Add Project</Button>
        </div>
      )}
      <div className="space-y-4">
        <ProjectList
            projects={projects}
            onEdit={handleEditProject}
            columnId={isCompletedTab ? 'completed' : 'ideas'}
            onDropItem={moveProject}
            setIdeas={setIdeas}
            setCompleted={setCompleted}
            moveCard={moveCard}
        />
      </div>
      <ProjectForm isOpen={isFormOpen} setIsOpen={setIsFormOpen} project={editingProject} onSave={handleSaveProject} />
    </div>
  );
}
