import type { Project, Link, Course } from './types';

export const INITIAL_IDEAS: Project[] = [
  {
    id: 'idea-1',
    title: 'AI-Powered Project Manager',
    description: 'An intelligent assistant to automate task assignments and progress tracking.',
    requirements: '1. User Authentication\n2. AI Model Integration\n3. Real-time notifications',
    links: [{ title: 'OpenAI API', url: 'https://openai.com' }],
    logo: 'https://picsum.photos/seed/1/200/200',
    progress: 25,
    tags: ['AI', 'Productivity'],
    notes: [],
  },
  {
    id: 'idea-2',
    title: 'Gamified Fitness App',
    description: 'A mobile app that turns workouts into quests and challenges.',
    requirements: '1. Gamification elements\n2. Workout tracking\n3. Social features',
    links: [],
    logo: 'https://picsum.photos/seed/2/200/200',
    progress: 50,
    tags: ['Fitness', 'Mobile'],
    notes: [],
  },
  {
    id: 'idea-3',
    title: 'Community Skill-Sharing Platform',
    description: 'A web app connecting people who want to teach and learn local skills.',
    requirements: '1. User profiles with skills\n2. Search and filter\n3. Booking and scheduling',
    links: [],
    logo: 'https://picsum.photos/seed/3/200/200',
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
    logo: 'https://picsum.photos/seed/4/200/200',
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
  },
  {
    id: 'course-2',
    name: 'Python for Everybody',
    completed: false,
    links: [{ id: 'link-course-2', title: 'Coursera', url: 'https://www.coursera.org/specializations/python' }],
  },
  {
    id: 'course-3',
    name: 'Figma UI/UX Design Essentials',
    completed: true,
    links: [],
  },
];
