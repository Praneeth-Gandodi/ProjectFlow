'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppHeader } from '@/components/app-header';
import { DashboardStats } from '@/components/dashboard-stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectTab } from '@/components/project-tab';
import { LinkTab } from '@/components/link-tab';
import type { Project, Link } from './types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { INITIAL_IDEAS, INITIAL_COMPLETED, INITIAL_LINKS } from './data';
import Papa from 'papaparse';

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

export default function Home() {
  const [ideas, setIdeas] = useLocalStorage<Project[]>('projectflow-ideas', INITIAL_IDEAS);
  const [completed, setCompleted] = useLocalStorage<Project[]>('projectflow-completed', INITIAL_COMPLETED);
  const [links, setLinks] = useLocalStorage<Link[]>('projectflow-links', INITIAL_LINKS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredIdeas = useMemo(() =>
    ideas.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase())),
    [ideas, searchTerm]
  );

  const filteredCompleted = useMemo(() =>
    completed.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase())),
    [completed, searchTerm]
  );

  const filteredLinks = useMemo(() =>
    links.filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()) || (l.description && l.description.toLowerCase().includes(searchTerm.toLowerCase()))),
    [links, searchTerm]
  );

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExport = (format: 'json' | 'csv-projects' | 'csv-links') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    switch (format) {
      case 'json': {
        const allData = {
          ideas,
          completed,
          links,
          exportedAt: new Date().toISOString(),
        };
        downloadFile(`projectflow-backup-${timestamp}.json`, JSON.stringify(allData, null, 2), 'application/json');
        break;
      }
      case 'csv-projects': {
        const allProjects = [
          ...ideas.map(p => ({ ...p, status: 'idea' })),
          ...completed.map(p => ({ ...p, status: 'completed' })),
        ];
        const csvData = Papa.unparse(allProjects.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          status: p.status,
          progress: p.progress,
          tags: p.tags.join(', '),
          links: JSON.stringify(p.links),
          requirements: p.requirements,
        })));
        downloadFile(`projectflow-projects-${timestamp}.csv`, csvData, 'text/csv;charset=utf-8;');
        break;
      }
      case 'csv-links': {
        const csvData = Papa.unparse(links);
        downloadFile(`projectflow-links-${timestamp}.csv`, csvData, 'text/csv;charset=utf-8;');
        break;
      }
    }
  };
  
  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col min-h-screen">
        <AppHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} onExport={handleExport} />

        <main className="flex-1 container mx-auto py-8 px-4 md:px-6">
          <DashboardStats ideasCount={ideas.length} completedCount={completed.length} />

          <Tabs defaultValue="ideas" className="mt-8">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="ideas">Ideas</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="links">Links</TabsTrigger>
            </TabsList>
            <TabsContent value="ideas">
               <ProjectTab 
                 projects={filteredIdeas} 
                 setProjects={setIdeas}
                 setIdeas={setIdeas}
                 setCompleted={setCompleted}
                 allIdeas={ideas}
                 allCompleted={completed}
                 isCompletedTab={false}
                 title="Ideas"
               />
            </TabsContent>
            <TabsContent value="completed">
                <ProjectTab 
                 projects={filteredCompleted} 
                 setProjects={setCompleted}
                 setIdeas={setIdeas}
                 setCompleted={setCompleted}
                 allIdeas={ideas}
                 allCompleted={completed}
                 isCompletedTab={true}
                 title="Completed"
               />
            </TabsContent>
            <TabsContent value="links">
              <LinkTab links={filteredLinks} setLinks={setLinks} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </DndProvider>
  );
}
