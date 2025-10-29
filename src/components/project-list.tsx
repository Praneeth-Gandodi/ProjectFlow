'use client';

import React from 'react';
import type { Project } from '@/app/types';
import { ProjectCard } from './project-card';
import { useDrop } from 'react-dnd';
import { Card, CardHeader, CardTitle } from './ui/card';

interface ProjectListProps {
  title: string;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  allProjects: Project[];
  onEdit: (project: Project, source: 'ideas' | 'completed') => void;
  columnId: 'ideas' | 'completed';
  onDropItem: (id: string, from: 'ideas' | 'completed', to: 'ideas' | 'completed') => void;
}

export function ProjectList({ title, projects, setProjects, allProjects, onEdit, columnId, onDropItem }: ProjectListProps) {
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
    const dragIndex = allProjects.findIndex(p => p.id === dragId);
    const hoverIndex = allProjects.findIndex(p => p.id === hoverId);
    
    if (dragIndex === -1 || hoverIndex === -1) return;

    const newProjects = [...allProjects];
    const [draggedItem] = newProjects.splice(dragIndex, 1);
    newProjects.splice(hoverIndex, 0, draggedItem);
    setProjects(newProjects);
  };
  
  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <Card ref={drop} className={`min-h-[300px] transition-colors ${isOver ? 'bg-accent' : ''}`}>
        <CardHeader>
            <CardTitle className="font-headline">{title}</CardTitle>
        </CardHeader>
        <div className="p-4 pt-0 flex flex-col gap-4">
            {projects.length > 0 ? (
                projects.map((project, index) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onEdit={() => onEdit(project, columnId)}
                        onDelete={() => handleDelete(project.id)}
                        moveCard={moveCard}
                        source={columnId}
                    />
                ))
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    No projects here.
                </div>
            )}
        </div>
    </Card>
  );
}
