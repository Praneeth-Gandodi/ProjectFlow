
'use client';

import React, { useState, useMemo, useContext, useRef } from 'react';
import { AppHeader } from '@/components/app-header';
import { DashboardStats } from '@/components/dashboard-stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectTab } from '@/components/project-tab';
import { LinkTab } from '@/components/link-tab';
import { LearningTab } from '@/components/learning-tab';
import type { Project, Link, Course } from './types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { INITIAL_IDEAS, INITIAL_COMPLETED, INITIAL_LINKS, INITIAL_COURSES } from './data';
import Papa from 'papaparse';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ProfileContext } from '@/context/profile-context';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [ideas, setIdeas, isIdeasLoaded] = useLocalStorage<Project[]>('projectflow-ideas', INITIAL_IDEAS);
  const [completed, setCompleted, isCompletedLoaded] = useLocalStorage<Project[]>('projectflow-completed', INITIAL_COMPLETED);
  const [links, setLinks, isLinksLoaded] = useLocalStorage<Link[]>('projectflow-links', INITIAL_LINKS);
  const [courses, setCourses, isCoursesLoaded] = useLocalStorage<Course[]>('projectflow-courses', INITIAL_COURSES);

  const [searchTerm, setSearchTerm] = useState('');
  const { font, layout } = useContext(ProfileContext);
  const importInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const isClient = isIdeasLoaded && isCompletedLoaded && isLinksLoaded && isCoursesLoaded;

  const filteredIdeas = useMemo(() =>
    (ideas || []).filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase())),
    [ideas, searchTerm]
  );

  const filteredCompleted = useMemo(() =>
    (completed || []).filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase())),
    [completed, searchTerm]
  );

  const filteredLinks = useMemo(() =>
    (links || []).filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()) || (l.description && l.description.toLowerCase().includes(searchTerm.toLowerCase()))),
    [links, searchTerm]
  );

  const filteredCourses = useMemo(() =>
    (courses || []).filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [courses, searchTerm]
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

  const handleExport = (format: 'json' | 'csv-projects' | 'csv-links' | 'csv-courses') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    switch (format) {
      case 'json': {
        const allData = {
          ideas,
          completed,
          links,
          courses,
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
          tags: p.tags?.join(', '),
          dueDate: p.dueDate,
          repoUrl: p.repoUrl,
          links: JSON.stringify(p.links),
          requirements: Array.isArray(p.requirements) ? p.requirements.join('\\n') : p.requirements,
        })));
        downloadFile(`projectflow-projects-${timestamp}.csv`, csvData, 'text/csv;charset=utf-8;');
        break;
      }
      case 'csv-links': {
        const csvData = Papa.unparse(links);
        downloadFile(`projectflow-links-${timestamp}.csv`, csvData, 'text/csv;charset=utf-8;');
        break;
      }
      case 'csv-courses': {
        const csvData = Papa.unparse(courses.map(c => ({
          id: c.id,
          name: c.name,
          completed: c.completed,
          reason: c.reason,
          links: JSON.stringify(c.links),
          notes: JSON.stringify(c.notes),
        })));
        downloadFile(`projectflow-courses-${timestamp}.csv`, csvData, 'text/csv;charset=utf-8;');
        break;
      }
    }
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        
        if (data.ideas || data.completed || data.links || data.courses) {
          setIdeas(data.ideas || []);
          setCompleted(data.completed || []);
          setLinks(data.links || []);
          setCourses(data.courses || []);
          toast({
            title: 'Import Successful',
            description: 'Your data has been restored from the backup.',
          });
        } else {
          throw new Error('Invalid backup file format.');
        }
      } catch (error) {
        console.error('Import failed:', error);
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: 'The selected file is not a valid backup file.',
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  
  if (!isClient) {
    return null;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn("flex flex-col min-h-screen", font === 'serif' ? 'font-serif' : 'font-sans')}>
        <AppHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} onExport={handleExport} onImport={handleImportClick} />
        <input
          type="file"
          ref={importInputRef}
          className="hidden"
          accept="application/json"
          onChange={handleImport}
        />

        <main className={cn("flex-1 container mx-auto py-8 px-4 md:px-6", layout === 'compact' ? 'max-w-7xl' : 'max-w-5xl' )}>
          <DashboardStats 
            ideasCount={(ideas || []).length} 
            completedCount={(completed || []).length}
            coursesCount={(courses || []).length}
            completedCoursesCount={(courses || []).filter(c => c.completed).length}
          />

          <Tabs defaultValue="ideas" className="mt-8">
            <TabsList className="grid w-full grid-cols-4 max-w-lg mx-auto">
              <TabsTrigger value="ideas">Ideas</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="links">Links</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
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
            <TabsContent value="learning">
              <LearningTab courses={filteredCourses} setCourses={setCourses} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </DndProvider>
  );
}
