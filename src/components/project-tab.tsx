'use client';

import React, { useState } from 'react';
import type { Project } from '@/app/types';
import { ProjectList } from './project-list';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { ProjectForm } from './project-form';

interface ProjectTabProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setIdeas: React.Dispatch<React.SetStateAction<Project[]>>;
  setCompleted: React.Dispatch<React.SetStateAction<Project[]>>;
  allProjects: Project[];
  allIdeas: Project[];
  allCompleted: Project[];
  isCompletedTab: boolean;
  title: string;
}

export function ProjectTab({ projects, setProjects, setIdeas, setCompleted, allIdeas, allCompleted, isCompletedTab, title }: ProjectTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<(Project & { source: 'ideas' | 'completed' }) | null>(null);

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
    const newTarget = [...(to === 'ideas' ? allIdeas : allCompleted), projectToMove];

    if (from === 'ideas') {
      setIdeas(newSource);
      setCompleted(newTarget);
    } else {
      setIdeas(newTarget);
      setCompleted(newSource);
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
            allProjects={allProjects}
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
