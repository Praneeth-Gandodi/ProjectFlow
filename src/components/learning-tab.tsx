
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { Course } from '@/app/types';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CourseCard } from './course-card';
import { CourseForm } from './course-form';

interface LearningTabProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  searchTerm: string;
}

export function LearningTab({ courses, setCourses, searchTerm }: LearningTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  const handleAddCourse = () => {
    setEditingCourse(null);
    setIsFormOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };
  
  const handleDeleteCourse = useCallback((id: string) => {
    setCourses(prev => {
        const courseToDelete = prev.find(c => c.id === id);
        if (courseToDelete) {
            toast({ title: "Course Deleted", description: `"${courseToDelete.name}" has been removed.` });
        }
        return prev.filter(c => c.id !== id);
    });
  }, [setCourses, toast]);

  const handleToggleComplete = useCallback((courseToToggle: Course) => {
    const isCompleting = !courseToToggle.completed;
    const updatedCourse = { ...courseToToggle, completed: isCompleting };

    setCourses(prev => {
      const filtered = prev.filter(c => c.id !== courseToToggle.id);
      return isCompleting ? [...filtered, updatedCourse] : [updatedCourse, ...filtered];
    });

    toast({
      title: isCompleting ? "Course Completed!" : "Course Marked as Incomplete",
      description: `"${courseToToggle.name}" has been updated.`
    });
  }, [setCourses, toast]);

  const handleUpdateCourse = useCallback((updatedCourse: Course) => {
     setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  }, [setCourses]);
  
  const moveCard = useCallback((dragId: string, hoverId: string) => {
    setCourses(prevCourses => {
        const dragIndex = prevCourses.findIndex(c => c.id === dragId);
        const hoverIndex = prevCourses.findIndex(c => c.id === hoverId);
        if (dragIndex === -1 || hoverIndex === -1) return prevCourses;

        const newCourses = [...prevCourses];
        const [draggedItem] = newCourses.splice(dragIndex, 1);
        newCourses.splice(hoverIndex, 0, draggedItem);
        return newCourses;
    });
  }, [setCourses]);

  const filteredCourses = useMemo(() => {
    if (!searchTerm) return courses;
    return courses.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.reason || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  return (
    <div className="mt-6">
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddCourse}>
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCourses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onEdit={() => handleEditCourse(course)}
            onDelete={() => handleDeleteCourse(course.id)}
            onToggleComplete={() => handleToggleComplete(course)}
            moveCard={moveCard}
          />
        ))}
        {filteredCourses.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-10">
            {searchTerm ? 'No courses match your search.' : 'No courses saved yet.'}
          </div>
        )}
      </div>
      <CourseForm 
        isOpen={isFormOpen} 
        setIsOpen={setIsFormOpen} 
        course={editingCourse} 
        setCourses={setCourses}
        onUpdateCourse={handleUpdateCourse}
      />
    </div>
  );
}
