'use client';

import React, { useState } from 'react';
import type { Project } from '@/app/types';
import { ProjectList } from './project-list';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { ProjectForm } from './project-form';
import { useToast } from '@/hooks/use-toast';

interface ProjectTabProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setIdeas: React.Dispatch<React.SetStateAction<Project[]>>;
  setCompleted: React.Dispatch<React.SetStateAction<Project[]>>;
  allIdeas: Project[];
  allCompleted: Project[];
  isCompletedTab: boolean;
  title: string;
}

export function ProjectTab({ projects, setProjects, setIdeas, setCompleted, allIdeas, allCompleted, isCompletedTab, title }: ProjectTabProps) {
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

  const moveProject = (id: string, from: 'ideas' | 'completed', to: 'ideas' | 'completed') => {
    if (from === to) return;

    const sourceList = from === 'ideas' ? allIdeas : allCompleted;
    const projectToMove = sourceList.find(p => p.id === id);

    if (!projectToMove) return;

    const newSource = sourceList.filter(p => p.id !== id);
    let newTarget;
    
    if (to === 'ideas') {
        newTarget = [{ ...projectToMove, progress: projectToMove.progress === 100 ? 99 : projectToMove.progress }, ...allIdeas];
        setIdeas(newTarget);
        setCompleted(newSource);
        toast({
          title: 'Project Moved',
          description: `"${projectToMove.title}" moved back to Ideas.`,
        });
    } else {
        newTarget = [{ ...projectToMove, progress: 100 }, ...allCompleted];
        setIdeas(newSource);
        setCompleted(newTarget);
        toast({
          title: 'Project Completed!',
          description: `"${projectToMove.title}" has been moved to Completed.`,
        });
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddProject}>
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      <div className="space-y-4">
        <ProjectList 
            title={title}
            projects={projects}
            setProjects={setProjects}
            onEdit={handleEditProject}
            columnId={isCompletedTab ? 'completed' : 'ideas'}
            onDropItem={moveProject}
            setIdeas={setIdeas}
            setCompleted={setCompleted}
        />
      </div>

      <ProjectForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        project={editingProject}
        setIdeas={setIdeas}
        setCompleted={setCompleted}
      />
    </div>
  );
}
