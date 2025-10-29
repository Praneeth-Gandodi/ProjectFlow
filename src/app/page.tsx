'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppHeader } from '@/components/app-header';
import { DashboardStats } from '@/components/dashboard-stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectTab } from '@/components/project-tab';
import { LinkTab } from '@/components/link-tab';
import type { Project, Link } from './types';
import { INITIAL_IDEAS, INITIAL_COMPLETED, INITIAL_LINKS } from './data';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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
  
  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col min-h-screen">
        <AppHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

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
                 ideas={filteredIdeas} 
                 completed={filteredCompleted}
                 setIdeas={setIdeas}
                 setCompleted={setCompleted}
                 allIdeas={ideas}
                 allCompleted={completed}
               />
            </TabsContent>
            <TabsContent value="completed">
                <ProjectTab 
                 ideas={filteredIdeas} 
                 completed={filteredCompleted}
                 setIdeas={setIdeas}
                 setCompleted={setCompleted}
                 allIdeas={ideas}
                 allCompleted={completed}
                 isCompletedTab={true}
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
