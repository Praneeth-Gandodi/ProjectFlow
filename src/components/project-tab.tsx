'use client';

import React, { useState } from 'react';
import type { Project } from '@/app/types';
import { ProjectList } from './project-list';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { ProjectForm } from './project-form';

interface ProjectTabProps {
  ideas: Project[];
  completed: Project[];
  setIdeas: React.Dispatch<React.SetStateAction<Project[]>>;
  setCompleted: React.Dispatch<React.SetStateAction<Project[]>>;
  allIdeas: Project[];
  allCompleted: Project[];
  isCompletedTab?: boolean;
}

export function ProjectTab({ ideas, completed, setIdeas, setCompleted, allIdeas, allCompleted, isCompletedTab }: ProjectTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleAddProject = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project, source: 'ideas' | 'completed') => {
    setEditingProject({ ...project, source: source } as any);
    setIsFormOpen(true);
  };
  
  const moveProject = (id: string, from: 'ideas' | 'completed', to: 'ideas' | 'completed') => {
    if (from === to) return;

    const allSource = from === 'ideas' ? allIdeas : allCompleted;
    const allTarget = to === 'ideas' ? allIdeas : allCompleted;

    const project = allSource.find(p => p.id === id);
    if (!project) return;
    
    const newSource = allSource.filter(p => p.id !== id);
    const newTarget = [...allTarget, project];
    
    if (from === 'ideas') {
      setIdeas(newSource);
      setCompleted(newTarget);
    } else {
      setCompleted(newSource);
      setIdeas(newTarget);
    }
  };


  return (
    <div className="mt-6">
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddProject}>
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {!isCompletedTab && (
            <ProjectList 
                title="Ideas"
                projects={ideas}
                setProjects={setIdeas}
                allProjects={allIdeas}
                onEdit={handleEditProject}
                columnId="ideas"
                onDropItem={moveProject}
            />
        )}
        
        {isCompletedTab && (
            <ProjectList 
                title="Completed"
                projects={completed}
                setProjects={setCompleted}
                allProjects={allCompleted}
                onEdit={handleEditProject}
                columnId="completed"
                onDropItem={moveProject}
            />
        )}
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
