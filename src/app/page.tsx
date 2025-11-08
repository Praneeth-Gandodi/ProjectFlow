
'use client';

import React, { useState, useMemo, useContext, useRef, useCallback } from 'react';
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
import { getLogoBlob } from '@/lib/logo-storage';

// Helper to convert Blob to Base64 data URL
const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
};

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

  const downloadFile = useCallback((filename: string, content: string, mimeType: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, []);

  const handleExport = useCallback(async (format: 'json' | 'csv-projects' | 'csv-links' | 'csv-courses') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    switch (format) {
      case 'json': {
        try {
          toast({ title: "Exporting data...", description: "Preparing your backup file." });

          // Process projects to embed local logos
          const processItems = async <T extends Project | Course>(items: T[]): Promise<T[]> => {
            return Promise.all(
              items.map(async (item) => {
                if (item.logo?.startsWith('indexeddb:')) {
                  const blob = await getLogoBlob(item.logo.replace('indexeddb:', ''));
                  if (blob) {
                    const dataUrl = await blobToDataURL(blob);
                    return { ...item, logo: dataUrl };
                  }
                }
                return item;
              })
            );
          };

          const exportableIdeas = await processItems(ideas);
          const exportableCompleted = await processItems(completed);
          const exportableCourses = await processItems(courses);

          const allData = {
            ideas: exportableIdeas,
            completed: exportableCompleted,
            links,
            courses: exportableCourses,
            exportedAt: new Date().toISOString(),
          };

          downloadFile(`projectflow-backup-${timestamp}.json`, JSON.stringify(allData, null, 2), 'application/json');
          toast({ title: "Export complete!", description: "Your data has been saved." });
        } catch (error) {
          console.error("Export failed:", error);
          toast({ variant: 'destructive', title: "Export Failed", description: "Could not create backup file." });
        }
        break;
      }
      case 'csv-projects': {
        const allProjects = [
          ...ideas.map(p => ({ ...p, status: 'idea' })),
          ...completed.map(p => ({ ...p, status: 'completed' })),
        ];
        const csvData = Papa.unparse(allProjects.map(p => ({
          id: p.id, title: p.title, description: p.description, status: p.status,
          progress: p.progress, tags: p.tags?.join(', '), dueDate: p.dueDate,
          repoUrl: p.repoUrl, links: JSON.stringify(p.links),
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
          id: c.id, name: c.name, completed: c.completed, reason: c.reason,
          links: JSON.stringify(c.links), notes: JSON.stringify(c.notes),
        })));
        downloadFile(`projectflow-courses-${timestamp}.csv`, csvData, 'text/csv;charset=utf-8;');
        break;
      }
    }
  }, [ideas, completed, links, courses, downloadFile, toast]);

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
        
        // Basic validation to ensure it's a plausible backup file
        if (data && typeof data === 'object' && ('ideas' in data || 'completed' in data || 'links' in data || 'courses' in data)) {
          setIdeas(data.ideas || []);
          setCompleted(data.completed || []);
          setLinks(data.links || []);
          setCourses(data.courses || []);
          toast({ title: 'Import Successful', description: 'Your data has been restored.' });
        } else {
          throw new Error('Invalid backup file format.');
        }
      } catch (error) {
        console.error('Import failed:', error);
        toast({ variant: 'destructive', title: 'Import Failed', description: 'The selected file is not a valid backup file.' });
      } finally {
        // Reset the input value to allow importing the same file again
        if (event.target) {
            event.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  };
  
  if (!isClient) {
    return null;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn("flex flex-col min-h-screen", font === 'serif' ? 'font-serif' : 'font-sans')}>
        <AppHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} onExport={handleExport} onImport={handleImportClick} />
        <input type="file" ref={importInputRef} className="hidden" accept="application/json" onChange={handleImport} />

        <main className={cn("flex-1 container mx-auto py-8 px-4 md:px-6", layout === 'compact' ? 'max-w-screen-2xl' : 'max-w-7xl' )}>
          <DashboardStats 
            ideasCount={ideas.length} 
            completedCount={completed.length}
            coursesCount={courses.length}
            completedCoursesCount={courses.filter(c => c.completed).length}
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
                 ideas={ideas}
                 setIdeas={setIdeas}
                 completed={completed}
                 setCompleted={setCompleted}
                 isCompletedTab={false}
                 searchTerm={searchTerm}
               />
            </TabsContent>
            <TabsContent value="completed">
                <ProjectTab 
                 ideas={ideas}
                 setIdeas={setIdeas}
                 completed={completed}
                 setCompleted={setCompleted}
                 isCompletedTab={true}
                 searchTerm={searchTerm}
               />
            </TabsContent>
            <TabsContent value="links">
              <LinkTab links={links} setLinks={setLinks} searchTerm={searchTerm} />
            </TabsContent>
            <TabsContent value="learning">
              <LearningTab courses={courses} setCourses={setCourses} searchTerm={searchTerm} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </DndProvider>
  );
}
