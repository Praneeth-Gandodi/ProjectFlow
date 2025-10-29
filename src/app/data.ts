import type { Project, Link } from './types';

export const INITIAL_IDEAS: Project[] = [
  {
    id: 'idea-1',
    title: 'AI-Powered Project Manager',
    description: 'An intelligent assistant to automate task assignments and progress tracking.',
  },
  {
    id: 'idea-2',
    title: 'Gamified Fitness App',
    description: 'A mobile app that turns workouts into quests and challenges.',
  },
  {
    id: 'idea-3',
    title: 'Community Skill-Sharing Platform',
    description: 'A web app connecting people who want to teach and learn local skills.',
  },
];

export const INITIAL_COMPLETED: Project[] = [
  {
    id: 'completed-1',
    title: 'Personal Portfolio Website',
    description: 'A responsive website to showcase my work and skills, built with Next.js.',
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
