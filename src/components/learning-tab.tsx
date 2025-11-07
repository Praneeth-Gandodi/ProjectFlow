'use client';

import React, { useState, useMemo } from 'react';
import type { Course } from '@/app/types';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CourseCard } from './course-card';
import { CourseForm } from './course-form';

interface LearningTabProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

export function LearningTab({ courses, setCourses }: LearningTabProps) {
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
  
  const handleDeleteCourse = (id: string) => {
    const courseToDelete = courses.find(c => c.id === id);
    if (courseToDelete) {
      setCourses(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Course Deleted",
        description: `"${courseToDelete.name}" has been removed.`
      });
    }
  };

  const handleToggleComplete = (courseToToggle: Course) => {
    const isCompleting = !courseToToggle.completed;
    const updatedCourse = { ...courseToToggle, completed: isCompleting };

    setCourses(prev => {
      // Remove the course from its current position
      const filtered = prev.filter(c => c.id !== courseToToggle.id);
      
      if (isCompleting) {
        // If completing, add it to the end
        return [...filtered, updatedCourse];
      } else {
        // If un-completing, add it to the beginning
        return [updatedCourse, ...filtered];
      }
    });

    toast({
      title: isCompleting ? "Course Completed!" : "Course Marked as Incomplete",
      description: `"${courseToToggle.name}" has been updated.`
    });
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
     setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  }
  
  const moveCard = (dragId: string, hoverId: string) => {
    const dragIndex = courses.findIndex(c => c.id === dragId);
    const hoverIndex = courses.findIndex(c => c.id === hoverId);
    
    if (dragIndex === -1 || hoverIndex === -1) return;

    const newCourses = [...courses];
    const [draggedItem] = newCourses.splice(dragIndex, 1);
    newCourses.splice(hoverIndex, 0, draggedItem);
    setCourses(newCourses);
  };

  return (
    <div className="mt-6">
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddCourse}>
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onEdit={() => handleEditCourse(course)}
            onDelete={() => handleDeleteCourse(course.id)}
            onToggleComplete={() => handleToggleComplete(course)}
            moveCard={moveCard}
          />
        ))}
        {courses.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-10">
            No courses saved yet.
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
