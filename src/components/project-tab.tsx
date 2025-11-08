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
  
  const handleSaveProject = (savedProject: Project) => {
    const source = editingProject?.source;

    if (source) {
      // This is an update to an existing project.
      const setList = source === 'completed' ? setCompleted : setIdeas;
      setList(prev => prev.map(p => p.id === savedProject.id ? savedProject : p));
    } else {
      // This is a new project, always add to ideas.
      setIdeas(prev => [savedProject, ...prev]);
    }
  };


  const moveProject = (id: string, from: 'ideas' | 'completed', to: 'ideas' | 'completed') => {
    if (from === to) return;

    const sourceList = from === 'ideas' ? allIdeas : allCompleted;
    const destList = to === 'ideas' ? allIdeas : allCompleted;
    const setSource = from === 'ideas' ? setIdeas : setCompleted;
    const setDest = to === 'ideas' ? setIdeas : setCompleted;

    const projectToMove = sourceList.find(p => p.id === id);
    if (!projectToMove) return;

    const newSource = sourceList.filter(p => p.id !== id);
    let newDest;

    if (to === 'ideas') {
      newDest = [{ ...projectToMove, progress: projectToMove.progress === 100 ? 99 : projectToMove.progress }, ...destList];
       toast({
          title: 'Project Moved',
          description: `"${projectToMove.title}" moved back to Ideas.`,
        });
    } else {
      newDest = [{ ...projectToMove, progress: 100 }, ...destList];
      toast({
          title: 'Project Completed!',
          description: `"${projectToMove.title}" has been moved to Completed.`,
      });
    }
    setSource(newSource);
    setDest(newDest);
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
        onSave={handleSaveProject}
      />
    </div>
  );
}
