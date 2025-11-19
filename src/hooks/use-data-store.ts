'use client';

import { useContext, useEffect, useState, useCallback } from 'react';
import { ProfileContext } from '@/context/profile-context';
import { useLocalStorage } from './use-local-storage';
import { Project, Course, Link } from '@/app/types';
import { INITIAL_IDEAS, INITIAL_COMPLETED, INITIAL_LINKS, INITIAL_COURSES } from '@/app/data';
import {
    getProjects, saveProject, deleteProject,
    getCourses, saveCourse, deleteCourse,
    getLinks, saveLink, deleteLink
} from '@/app/actions';

export function useDataStore() {
    const { storageMode } = useContext(ProfileContext);
    const [isLoading, setIsLoading] = useState(true);

    // Local Storage State
    const [localIdeas, setLocalIdeas, isLocalIdeasLoaded] = useLocalStorage<Project[]>('projectflow-ideas', INITIAL_IDEAS);
    const [localCompleted, setLocalCompleted, isLocalCompletedLoaded] = useLocalStorage<Project[]>('projectflow-completed', INITIAL_COMPLETED);
    const [localLinks, setLocalLinks, isLocalLinksLoaded] = useLocalStorage<Link[]>('projectflow-links', INITIAL_LINKS);
    const [localCourses, setLocalCourses, isLocalCoursesLoaded] = useLocalStorage<Course[]>('projectflow-courses', INITIAL_COURSES);

    // SQLite State (Client-side cache)
    const [sqliteIdeas, setSqliteIdeas] = useState<Project[]>([]);
    const [sqliteCompleted, setSqliteCompleted] = useState<Project[]>([]);
    const [sqliteLinks, setSqliteLinks] = useState<Link[]>([]);
    const [sqliteCourses, setSqliteCourses] = useState<Course[]>([]);

    // Fetch SQLite Data
    const fetchSqliteData = useCallback(async () => {
        setIsLoading(true);
        try {
            const projects = await getProjects();
            const links = await getLinks();
            const courses = await getCourses();

            setSqliteIdeas(projects.ideas);
            setSqliteCompleted(projects.completed);
            setSqliteLinks(links);
            setSqliteCourses(courses);
        } catch (error) {
            console.error("Failed to fetch SQLite data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Effect to load data when mode changes
    useEffect(() => {
        if (storageMode === 'sqlite') {
            fetchSqliteData();
        } else {
            // Local storage loading is handled by the hook's internal state
            setIsLoading(!(isLocalIdeasLoaded && isLocalCompletedLoaded && isLocalLinksLoaded && isLocalCoursesLoaded));
        }
    }, [storageMode, fetchSqliteData, isLocalIdeasLoaded, isLocalCompletedLoaded, isLocalLinksLoaded, isLocalCoursesLoaded]);


    // Unified Data Access
    const ideas = storageMode === 'local' ? localIdeas : sqliteIdeas;
    const completed = storageMode === 'local' ? localCompleted : sqliteCompleted;
    const links = storageMode === 'local' ? localLinks : sqliteLinks;
    const courses = storageMode === 'local' ? localCourses : sqliteCourses;

    // Unified Actions
    const actions = {
        // Projects
        addProject: async (project: Project, status: 'idea' | 'completed') => {
            if (storageMode === 'local') {
                if (status === 'idea') setLocalIdeas(prev => [...prev, project]);
                else setLocalCompleted(prev => [...prev, project]);
            } else {
                // Optimistic Update
                const prevIdeas = sqliteIdeas;
                const prevCompleted = sqliteCompleted;

                if (status === 'idea') setSqliteIdeas(prev => [...prev, project]);
                else setSqliteCompleted(prev => [...prev, project]);

                try {
                    await saveProject(project, status);
                } catch (error) {
                    console.error("Failed to add project:", error);
                    // Revert
                    setSqliteIdeas(prevIdeas);
                    setSqliteCompleted(prevCompleted);
                }
            }
        },
        updateProject: async (project: Project, status: 'idea' | 'completed') => {
            if (storageMode === 'local') {
                if (status === 'idea') setLocalIdeas(prev => prev.map(p => p.id === project.id ? project : p));
                else setLocalCompleted(prev => prev.map(p => p.id === project.id ? project : p));
            } else {
                // Optimistic Update
                const prevIdeas = sqliteIdeas;
                const prevCompleted = sqliteCompleted;

                if (status === 'idea') setSqliteIdeas(prev => prev.map(p => p.id === project.id ? project : p));
                else setSqliteCompleted(prev => prev.map(p => p.id === project.id ? project : p));

                try {
                    await saveProject(project, status);
                } catch (error) {
                    console.error("Failed to update project:", error);
                    // Revert
                    setSqliteIdeas(prevIdeas);
                    setSqliteCompleted(prevCompleted);
                }
            }
        },
        deleteProject: async (id: string, status: 'idea' | 'completed') => {
            if (storageMode === 'local') {
                if (status === 'idea') setLocalIdeas(prev => prev.filter(p => p.id !== id));
                else setLocalCompleted(prev => prev.filter(p => p.id !== id));
            } else {
                // Optimistic Update
                const prevIdeas = sqliteIdeas;
                const prevCompleted = sqliteCompleted;

                if (status === 'idea') setSqliteIdeas(prev => prev.filter(p => p.id !== id));
                else setSqliteCompleted(prev => prev.filter(p => p.id !== id));

                try {
                    const success = await deleteProject(id);
                    if (!success) throw new Error("Delete failed on server");
                } catch (error) {
                    console.error("Failed to delete project:", error);
                    // Revert
                    setSqliteIdeas(prevIdeas);
                    setSqliteCompleted(prevCompleted);
                }
            }
        },
        moveProject: async (project: Project, fromStatus: 'idea' | 'completed', toStatus: 'idea' | 'completed') => {
            if (storageMode === 'local') {
                // Remove from source
                if (fromStatus === 'idea') setLocalIdeas(prev => prev.filter(p => p.id !== project.id));
                else setLocalCompleted(prev => prev.filter(p => p.id !== project.id));

                // Add to dest
                if (toStatus === 'idea') setLocalIdeas(prev => [...prev, project]);
                else setLocalCompleted(prev => [...prev, project]);
            } else {
                // Optimistic Update
                const prevIdeas = sqliteIdeas;
                const prevCompleted = sqliteCompleted;

                // Remove from source
                if (fromStatus === 'idea') setSqliteIdeas(prev => prev.filter(p => p.id !== project.id));
                else setSqliteCompleted(prev => prev.filter(p => p.id !== project.id));

                // Add to dest
                if (toStatus === 'idea') setSqliteIdeas(prev => [...prev, project]);
                else setSqliteCompleted(prev => [...prev, project]);

                try {
                    await saveProject(project, toStatus);
                } catch (error) {
                    console.error("Failed to move project:", error);
                    // Revert
                    setSqliteIdeas(prevIdeas);
                    setSqliteCompleted(prevCompleted);
                }
            }
        },
        setIdeas: (value: Project[] | ((prev: Project[]) => Project[])) => {
            if (storageMode === 'local') {
                setLocalIdeas(value);
            } else {
                // For SQLite, we don't support functional updates for reordering yet in this simplified migration.
                // If value is a function, we call it with current sqlite state.
                const newValue = value instanceof Function ? value(sqliteIdeas) : value;
                setSqliteIdeas(newValue);
                // Note: This only updates client cache. Persisting reorder to DB would require an extra step.
            }
        },
        setCompleted: (value: Project[] | ((prev: Project[]) => Project[])) => {
            if (storageMode === 'local') {
                setLocalCompleted(value);
            } else {
                const newValue = value instanceof Function ? value(sqliteCompleted) : value;
                setSqliteCompleted(newValue);
            }
        },

        // Links
        addLink: async (link: Link) => {
            if (storageMode === 'local') setLocalLinks(prev => [...prev, link]);
            else {
                const prevLinks = sqliteLinks;
                setSqliteLinks(prev => [...prev, link]);
                try {
                    await saveLink(link);
                } catch (error) {
                    console.error("Failed to add link:", error);
                    setSqliteLinks(prevLinks);
                }
            }
        },
        updateLink: async (link: Link) => {
            if (storageMode === 'local') setLocalLinks(prev => prev.map(l => l.id === link.id ? link : l));
            else {
                const prevLinks = sqliteLinks;
                setSqliteLinks(prev => prev.map(l => l.id === link.id ? link : l));
                try {
                    await saveLink(link);
                } catch (error) {
                    console.error("Failed to update link:", error);
                    setSqliteLinks(prevLinks);
                }
            }
        },
        deleteLink: async (id: string) => {
            if (storageMode === 'local') setLocalLinks(prev => prev.filter(l => l.id !== id));
            else {
                const prevLinks = sqliteLinks;
                setSqliteLinks(prev => prev.filter(l => l.id !== id));
                try {
                    const success = await deleteLink(id);
                    if (!success) throw new Error("Delete failed on server");
                } catch (error) {
                    console.error("Failed to delete link:", error);
                    setSqliteLinks(prevLinks);
                }
            }
        },
        setLinks: (value: Link[] | ((prev: Link[]) => Link[])) => {
            if (storageMode === 'local') {
                setLocalLinks(value);
            } else {
                const newValue = value instanceof Function ? value(sqliteLinks) : value;
                setSqliteLinks(newValue);
            }
        },

        // Courses
        addCourse: async (course: Course) => {
            if (storageMode === 'local') setLocalCourses(prev => [...prev, course]);
            else {
                const prevCourses = sqliteCourses;
                setSqliteCourses(prev => [...prev, course]);
                try {
                    await saveCourse(course);
                } catch (error) {
                    console.error("Failed to add course:", error);
                    setSqliteCourses(prevCourses);
                }
            }
        },
        updateCourse: async (course: Course) => {
            if (storageMode === 'local') setLocalCourses(prev => prev.map(c => c.id === course.id ? course : c));
            else {
                const prevCourses = sqliteCourses;
                setSqliteCourses(prev => prev.map(c => c.id === course.id ? course : c));
                try {
                    await saveCourse(course);
                } catch (error) {
                    console.error("Failed to update course:", error);
                    setSqliteCourses(prevCourses);
                }
            }
        },
        deleteCourse: async (id: string) => {
            if (storageMode === 'local') setLocalCourses(prev => prev.filter(c => c.id !== id));
            else {
                const prevCourses = sqliteCourses;
                setSqliteCourses(prev => prev.filter(c => c.id !== id));
                try {
                    const success = await deleteCourse(id);
                    if (!success) throw new Error("Delete failed on server");
                } catch (error) {
                    console.error("Failed to delete course:", error);
                    setSqliteCourses(prevCourses);
                }
            }
        },
        setCourses: (value: Course[] | ((prev: Course[]) => Course[])) => {
            if (storageMode === 'local') {
                setLocalCourses(value);
            } else {
                const newValue = value instanceof Function ? value(sqliteCourses) : value;
                setSqliteCourses(newValue);
            }
        }
    };

    return {
        ideas,
        completed,
        links,
        courses,
        isLoading,
        actions,
        storageMode
    };
}
