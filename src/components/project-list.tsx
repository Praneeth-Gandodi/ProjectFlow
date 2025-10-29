'use client';

import React from 'react';
import type { Project } from '@/app/types';
import { ProjectCard } from './project-card';
import { useDrop } from 'react-dnd';

interface ProjectListProps {
  title: string;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  onEdit: (project: Project, source: 'ideas' | 'completed') => void;
  columnId: 'ideas' | 'completed';
  onDropItem: (id: string, from: 'ideas' | 'completed', to: 'ideas' | 'completed') => void;
  setIdeas: React.Dispatch<React.SetStateAction<Project[]>>;
  setCompleted: React.Dispatch<React.SetStateAction<Project[]>>;
}

export function ProjectList({ title, projects, setProjects, onEdit, columnId, onDropItem, setIdeas, setCompleted }: ProjectListProps) {
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
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  }

  const handleMarkAsCompleted = (project: Project) => {
    setIdeas(prev => prev.filter(p => p.id !== project.id));
    setCompleted(prev => [...prev, { ...project, progress: 100 }]);
  };

  return (
    <div ref={drop} className={`min-h-[300px] transition-colors ${isOver ? 'bg-accent/50' : ''} rounded-lg p-1`}>
        <div className="flex flex-col gap-4">
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
                    />
                ))
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    No projects here. Drag projects to this list.
                </div>
            )}
        </div>
    </div>
  );
}
