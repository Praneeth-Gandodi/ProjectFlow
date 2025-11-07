'use client';

import type { Course } from '@/app/types';
import { cn } from '@/lib/utils';
import { Book } from 'lucide-react';
import Image from 'next/image';

interface TechLogoProps {
  course: Course;
  className?: string;
}

const DEVICON_MAP: Record<string, string> = {
  // Languages
  cplusplus: 'cplusplus',
  csharp: 'csharp',
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  go: 'go',
  rust: 'rust',
  kotlin: 'kotlin',
  swift: 'swift',
  php: 'php',
  ruby: 'ruby',
  scala: 'scala',
  haskell: 'haskell',
  lua: 'lua',
  perl: 'perl',
  elixir: 'elixir',
  clojure: 'clojure',
  lisp: 'lisp',
  crystal: 'crystal',
  fsharp: 'fsharp',
  erlang: 'erlang',
  dart: 'dart',
  html5: 'html5',
  css3: 'css3',
  sql: 'azuresqldatabase',
  assembly: 'wasm',
  bash: 'bash',
  powershell: 'powershell',
  solidity: 'solidity',
  vyper: 'vyper',

  // Frameworks & Libraries
  react: 'react',
  angular: 'angular',
  vuejs: 'vuejs',
  svelte: 'svelte',
  nextjs: 'nextjs',
  nuxtjs: 'nuxtjs',
  gatsby: 'gatsby',
  jquery: 'jquery',
  bootstrap: 'bootstrap',
  tailwindcss: 'tailwindcss',
  'node.js': 'nodejs',
  nodejs: 'nodejs',
  express: 'express',
  django: 'django',
  flask: 'flask',
  fastapi: 'fastapi',
  spring: 'spring',
  laravel: 'laravel',
  '.net': 'dot-net',
  dotnet: 'dot-net',
  rails: 'rails',
  redux: 'redux',
  graphql: 'graphql',
  jest: 'jest',
  mocha: 'mocha',
  cypress: 'cypress',
  storybook: 'storybook',
  vite: 'vite',
  webpack: 'webpack',
  babel: 'babel',
  numpy: 'numpy',
  pandas: 'pandas',
  tensorflow: 'tensorflow',
  pytorch: 'pytorch',
  keras: 'keras',
  scikitlearn: 'scikitlearn',
  opencv: 'opencv',

  // DevOps & Tools
  git: 'git',
  github: 'github',
  gitlab: 'gitlab',
  bitbucket: 'bitbucket',
  docker: 'docker',
  kubernetes: 'kubernetes',
  jenkins: 'jenkins',
  travis: 'travisci',
  circleci: 'circleci',
  ansible: 'ansible',
  terraform: 'terraform',
  vagrant: 'vagrant',
  nginx: 'nginx',
  apache: 'apache',
  redis: 'redis',
  mongodb: 'mongodb',
  mysql: 'mysql',
  postgresql: 'postgresql',
  sqlite: 'sqlite',
  microsoftsqlserver: 'microsoftsqlserver',
  amazonwebservices: 'amazonwebservices',
  aws: 'amazonwebservices',
  azure: 'azure',
  googlecloud: 'googlecloud',
  gcp: 'googlecloud',
  heroku: 'heroku',
  digitalocean: 'digitalocean',
  vercel: 'vercel',
  netlify: 'netlify',
  bash: 'bash',
  powershell: 'powershell',
  linux: 'linux',
  ubuntu: 'ubuntu',
  debian: 'debian',
  fedora: 'fedora',
  centos: 'centos',
  archlinux: 'archlinux',
  kalilinux: 'kalilinux',
  yarn: 'yarn',
  npm: 'npm',
  gulp: 'gulp',
  grunt: 'grunt',
  figma: 'figma',
  xd: 'xd',
  photoshop: 'photoshop',
  illustrator: 'illustrator',
  blender: 'blender',
  unity: 'unity',
  unrealengine: 'unrealengine',
  godot: 'godot',
  webflow: 'webflow',
  framer: 'framer',
  selenium: 'selenium',
};

const getDeviconUrl = (courseName: string): string | null => {
  const nameLower = courseName.toLowerCase().replace(/ /g, '');
  
  // Sort keys by length descending to match more specific names first (e.g., "javascript" before "java")
  const sortedKeys = Object.keys(DEVICON_MAP).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    if (nameLower.includes(key)) {
      const iconName = DEVICON_MAP[key];
      return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${iconName}/${iconName}-plain.svg`;
    }
  }

  return null;
};

const getFaviconUrl = (course: Course): string | null => {
  if (course.links && course.links.length > 0) {
    const firstUrl = course.links[0].url;
    if (firstUrl) {
      try {
        const domain = new URL(firstUrl).hostname;
        return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

export function TechLogo({ course, className }: TechLogoProps) {
  // Priority 1: Manual Logo
  if (course.logo) {
    return <Image src={course.logo} alt={course.name} width={48} height={48} className={cn("rounded-sm object-contain", className)} unoptimized />;
  }

  // Priority 2: Devicon
  const deviconUrl = getDeviconUrl(course.name);
  if (deviconUrl) {
    return (
        <img 
            src={deviconUrl} 
            alt={course.name}
            className={cn("rounded-sm object-contain", className)}
        />
    );
  }

  // Priority 3: Favicon
  const faviconUrl = getFaviconUrl(course);
  if (faviconUrl) {
    return <Image src={faviconUrl} alt={course.name} width={48} height={48} className={cn("rounded-sm object-contain", className)} />;
  }

  // Priority 4: Fallback
  return (
    <div className={cn("flex items-center justify-center bg-muted rounded-sm", className)}>
      <Book className="w-1/2 h-1/2 text-muted-foreground" />
    </div>
  );
}
