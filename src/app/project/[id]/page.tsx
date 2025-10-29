'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, Link as LinkIcon, Tag, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import type { Project } from '@/app/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ProfileContext } from '@/context/profile-context';
import { cn } from '@/lib/utils';


export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [ideas] = useLocalStorage<Project[]>('projectflow-ideas', []);
  const [completed] = useLocalStorage<Project[]>('projectflow-completed', []);
  const [project, setProject] = useState<Project | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { font, layout } = useContext(ProfileContext);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (id && isClient) {
      const allProjects = [...ideas, ...completed];
      const foundProject = allProjects.find(p => p.id === id);
      setProject(foundProject || null);
    }
  }, [id, ideas, completed, isClient]);

  if (!isClient || !project) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold mb-4">{!isClient ? 'Loading Project...' : '404 - Project Not Found'}</h1>
            {!isClient ? null :
              <>
                <p className="text-muted-foreground mb-8">The project you are looking for does not exist.</p>
                <Button onClick={() => router.push('/')}><ArrowLeft className="mr-2"/> Go Back Home</Button>
              </>
            }
        </div>
    );
  }
  
  const logoSrc = project.logo || `https://picsum.photos/seed/${project.id}/200/200`;
  const isCompleted = project.progress === 100 || completed.some(p => p.id === project.id);

  return (
      <div className={cn("flex flex-col min-h-screen", font === 'serif' ? 'font-serif' : 'font-sans')}>
         {/* Dummy header props as they are not used on this page */}
        <AppHeader searchTerm="" setSearchTerm={() => {}} onExport={() => {}} onImport={() => {}} />
        <main className={cn("flex-1 container mx-auto py-8 px-4 md:px-6", layout === 'compact' ? 'max-w-7xl' : 'max-w-5xl' )}>
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push('/')}><ArrowLeft className="mr-2"/> Back to Dashboard</Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="md:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <Image
                            src={logoSrc}
                            alt={`${project.title} logo`}
                            width={400}
                            height={400}
                            className="rounded-lg border object-cover w-full aspect-square"
                        />
                    </CardHeader>
                    <CardContent>
                        <h1 className="text-3xl font-headline font-bold">{project.title}</h1>
                        <p className="text-lg text-muted-foreground mt-1">{project.description}</p>
                    </CardContent>
                </Card>

                {project.tags && project.tags.length > 0 && (
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline text-xl"><Tag size={20} /> Tags</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {project.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </CardContent>
                    </Card>
                )}

                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{isCompleted ? "Completed" : "In Progress"}</span>
                            <span className="text-lg font-bold text-primary">{project.progress}%</span>
                         </div>
                         <Progress value={project.progress} className="h-2" />
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-base text-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md border min-h-48">{project.requirements || 'No requirements specified.'}</div>
                    </CardContent>
                </Card>

                {project.links && project.links.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">Useful Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {project.links.map((link, index) => (
                                <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-md bg-muted/50 border hover:bg-muted/80 transition-colors">
                                    <LinkIcon className="h-5 w-5 text-primary" />
                                    <div className="flex-1">
                                        <p className="font-semibold">{link.title}</p>
                                        <p className="text-sm text-muted-foreground break-all">{link.url}</p>
                                    </div>
                                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                                </a>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
          </div>
        </main>
      </div>
  );
}
