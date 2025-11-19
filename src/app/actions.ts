'use server';

import db from '@/lib/db';
import { Project, Course, Link } from './types';
import { revalidatePath } from 'next/cache';

// --- Helper for Safe JSON Parsing ---
function safeParse<T>(jsonString: string | null | undefined, fallback: T): T {
    if (!jsonString) return fallback;
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Failed to parse JSON:', error);
        return fallback;
    }
}

// --- Projects ---

export async function getProjects(): Promise<{ ideas: Project[], completed: Project[] }> {
    const rows = db.prepare('SELECT * FROM projects').all() as any[];

    const projects = rows.map(row => ({
        ...row,
        requirements: safeParse(row.requirements, []),
        links: safeParse(row.links, []),
        notes: safeParse(row.notes, []),
        tags: safeParse(row.tags, []),
        apiKeys: safeParse(row.apiKeys, []),
    }));

    return {
        ideas: projects.filter(p => p.status === 'idea'),
        completed: projects.filter(p => p.status === 'completed'),
    };
}

export async function saveProject(project: Project, status: 'idea' | 'completed'): Promise<Project> {
    const stmt = db.prepare(`
    INSERT OR REPLACE INTO projects (id, title, description, requirements, logo, links, notes, progress, tags, repoUrl, apiKeys, apiKeyPin, dueDate, status)
    VALUES (@id, @title, @description, @requirements, @logo, @links, @notes, @progress, @tags, @repoUrl, @apiKeys, @apiKeyPin, @dueDate, @status)
  `);

    const projectToSave = {
        ...project,
        requirements: JSON.stringify(project.requirements || []),
        links: JSON.stringify(project.links || []),
        notes: JSON.stringify(project.notes || []),
        tags: JSON.stringify(project.tags || []),
        apiKeys: JSON.stringify(project.apiKeys || []),
        status
    };

    stmt.run(projectToSave);

    revalidatePath('/');
    return project;
}

export async function deleteProject(id: string): Promise<boolean> {
    try {
        db.prepare('DELETE FROM projects WHERE id = ?').run(id);
        revalidatePath('/');
        return true;
    } catch (error) {
        console.error('Failed to delete project:', error);
        return false;
    }
}

// --- Courses ---

export async function getCourses(): Promise<Course[]> {
    const rows = db.prepare('SELECT * FROM courses').all() as any[];
    return rows.map(row => ({
        ...row,
        completed: Boolean(row.completed),
        links: safeParse(row.links, []),
        notes: safeParse(row.notes, []),
    }));
}

export async function saveCourse(course: Course): Promise<Course> {
    const stmt = db.prepare(`
    INSERT OR REPLACE INTO courses (id, name, completed, links, logo, notes, reason)
    VALUES (@id, @name, @completed, @links, @logo, @notes, @reason)
  `);

    const courseToSave = {
        ...course,
        completed: course.completed ? 1 : 0,
        links: JSON.stringify(course.links || []),
        notes: JSON.stringify(course.notes || []),
    };

    stmt.run(courseToSave);

    revalidatePath('/');
    return course;
}

export async function deleteCourse(id: string): Promise<boolean> {
    try {
        db.prepare('DELETE FROM courses WHERE id = ?').run(id);
        revalidatePath('/');
        return true;
    } catch (error) {
        console.error('Failed to delete course:', error);
        return false;
    }
}

// --- Links ---

export async function getLinks(): Promise<Link[]> {
    return db.prepare('SELECT * FROM links').all() as Link[];
}

export async function saveLink(link: Link): Promise<Link> {
    const stmt = db.prepare(`
    INSERT OR REPLACE INTO links (id, title, url, description)
    VALUES (@id, @title, @url, @description)
  `);
    stmt.run(link);
    revalidatePath('/');
    return link;
}

export async function deleteLink(id: string): Promise<boolean> {
    try {
        db.prepare('DELETE FROM links WHERE id = ?').run(id);
        revalidatePath('/');
        return true;
    } catch (error) {
        console.error('Failed to delete link:', error);
        return false;
    }
}
