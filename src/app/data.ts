
import type { Project, Link, Course } from './types';

// Simple, consistent Base64 placeholder for local-first images
const placeholderLogo = (seed: string) => `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+PHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM4ODgiPnt7${seed}}fTwvdGV4dD48L3N2Zz4=`;

export const INITIAL_IDEAS: Project[] = [
  {
    id: 'idea-1',
    title: 'AI-Powered Project Manager',
    description: 'An intelligent assistant to automate task assignments and progress tracking.',
    requirements: '1. User Authentication\n2. AI Model Integration\n3. Real-time notifications',
    links: [{ title: 'OpenAI API', url: 'https://openai.com' }],
    logo: placeholderLogo('AI'),
    progress: 25,
    tags: ['AI', 'Productivity'],
    notes: [],
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
  },
  {
    id: 'idea-2',
    title: 'Gamified Fitness App',
    description: 'A mobile app that turns workouts into quests and challenges.',
    requirements: '1. Gamification elements\n2. Workout tracking\n3. Social features',
    links: [],
    logo: placeholderLogo('Fit'),
    progress: 50,
    tags: ['Fitness', 'Mobile'],
    notes: [],
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
  },
  {
    id: 'idea-3',
    title: 'Community Skill-Sharing Platform',
    description: 'A web app connecting people who want to teach and learn local skills.',
    requirements: '1. User profiles with skills\n2. Search and filter\n3. Booking and scheduling',
    links: [],
    logo: placeholderLogo('Learn'),
    progress: 10,
    tags: ['Community', 'Education'],
    notes: [],
  },
];

export const INITIAL_COMPLETED: Project[] = [
  {
    id: 'completed-1',
    title: 'Personal Portfolio Website',
    description: 'A responsive website to showcase my work and skills, built with Next.js.',
    requirements: '1. About Me section\n2. Project gallery\n3. Contact form',
    links: [{ title: 'Next.js', url: 'https://nextjs.org' }],
    logo: placeholderLogo('Web'),
    progress: 100,
    tags: ['Web', 'Portfolio'],
    notes: [],
  },
];

export const INITIAL_LINKS: Link[] = [
  {
    id: 'link-1',
    title: 'shadcn/ui',
    url: 'https://ui.shadcn.com',
    description: 'Beautifully designed components that you can copy and paste into your apps.',
  },
  {
    id: 'link-2',
    title: 'Lucide Icons',
    url: 'https://lucide.dev',
    description: 'A simply beautiful and consistent open-source icon set.',
  },
  {
    id: 'link-3',
    title: 'Tailwind CSS',
    url: 'https://tailwindcss.com',
    description: 'A utility-first CSS framework for rapid UI development.',
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    name: 'React - The Complete Guide',
    completed: false,
    links: [{ id: 'link-course-1', title: 'Course on Udemy', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/' }],
    reason: 'To master React for building modern web applications.',
    notes: [],
  },
  {
    id: 'course-2',
    name: 'Python for Everybody',
    completed: false,
    links: [{ id: 'link-course-2', title: 'Coursera', url: 'https://www.coursera.org/specializations/python' }],
    reason: 'For data science and backend development skills.',
    notes: [],
  },
  {
    id: 'course-3',
    name: 'Figma UI/UX Design Essentials',
    completed: true,
    links: [],
    reason: 'To improve my design skills and create better user interfaces.',
    notes: [],
  },
];
