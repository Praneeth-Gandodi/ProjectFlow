'use client';

import React from 'react';
import type { Project } from '@/app/types';
import { ProjectCard } from './project-card';
import { useDrop } from 'react-dnd';
import { useToast } from '@/hooks/use-toast';

interface ProjectListProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  onEdit: (project: Project, source: 'ideas' | 'completed') => void;
  columnId: 'ideas' | 'completed';
  onDropItem: (id: string, from: 'ideas' | 'completed', to: 'ideas' | 'completed') => void;
  setIdeas: React.Dispatch<React.SetStateAction<Project[]>>;
  setCompleted: React.Dispatch<React.SetStateAction<Project[]>>;
}

export function ProjectList({ projects, setProjects, onEdit, columnId, onDropItem, setIdeas, setCompleted }: ProjectListProps) {
    const { toast } = useToast();
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'project',
        drop: (item: { id: string, source: 'ideas' | 'completed' }) => {
            if (item.source !== columnId) {
                onDropItem(item.id, item.source, columnId);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

  const moveCard = (dragId: string, hoverId: string) => {
    const dragIndex = projects.findIndex(p => p.id === dragId);
    const hoverIndex = projects.findIndex(p => p.id === hoverId);
    
    if (dragIndex === -1 || hoverIndex === -1) return;

    const newProjects = [...projects];
    const [draggedItem] = newProjects.splice(dragIndex, 1);
    newProjects.splice(hoverIndex, 0, draggedItem);
    setProjects(newProjects);
  };
  
  const handleDelete = (id: string) => {
    const projectToDelete = projects.find(p => p.id === id);
    if (projectToDelete) {
      setProjects(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Project Deleted',
        description: `"${projectToDelete.title}" has been removed.`,
      });
    }
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
     toast({
        title: 'Progress Updated',
        description: `"${updatedProject.title}" progress saved.`,
      });
  }

  const handleMarkAsCompleted = (project: Project) => {
    setIdeas(prev => prev.filter(p => p.id !== project.id));
    setCompleted(prev => [{ ...project, progress: 100 }, ...prev]);
    toast({
        title: 'Project Completed!',
        description: `"${project.title}" has been moved to Completed.`,
    });
  };

  const handleMoveToIdeas = (project: Project) => {
    setCompleted(prev => prev.filter(p => p.id !== project.id));
    setIdeas(prev => [{ ...project, progress: project.progress === 100 ? 99 : project.progress || 0 }, ...prev]);
    toast({
      title: 'Project Moved',
      description: `"${project.title}" moved back to Ideas.`,
    });
  };

  return (
    <div ref={drop} className={`min-h-[300px] transition-colors ${isOver ? 'bg-accent/50' : ''} rounded-lg p-1`}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => onEdit(project, columnId)}
              onDelete={() => handleDelete(project.id)}
              moveCard={moveCard}
              source={columnId}
              onUpdateProject={handleUpdateProject}
              onMarkAsCompleted={handleMarkAsCompleted}
              onMoveToIdeas={handleMoveToIdeas}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-10">
            {isOver ? "Release to drop" : 
             (columnId === 'ideas' ? "No ideas yet. Add one or drag a completed project here." : "No completed projects yet. Drag an idea here to complete it.")
            }
          </div>
        )}
      </div>
    </div>
  );
}
