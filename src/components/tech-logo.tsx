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
  assembly: 'wasm', // Best guess for assembly
  bash: 'bash',
  powershell: 'powershell',
  solidity: 'solidity',
  vyper: 'vyper',
  r: 'r',
  julia: 'julia',
  verilog: 'verilog',
  vhdl: 'vhdl',
  c: 'c',

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
  nestjs: 'nestjs',
  gin: 'go', // No specific Gin logo, use Go
  fiber: 'go', // No specific Fiber logo, use Go
  seaborn: 'python', // Use python as fallback
  matplotlib: 'python', // Use python as fallback
  
  // Databases
  mysql: 'mysql',
  postgresql: 'postgresql',
  sqlite: 'sqlite',
  mongodb: 'mongodb',
  redis: 'redis',
  firebase: 'firebase',
  dynamodb: 'amazonwebservices',
  cassandra: 'cassandra',
  neo4j: 'neo4j',
  elasticsearch: 'elasticsearch',
  microsoftsqlserver: 'microsoftsqlserver',
  supabase: 'supabase',
  appwrite: 'appwrite',
  prisma: 'prisma',
  planetscale: 'planetscale',
  
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
  amazonwebservices: 'amazonwebservices',
  aws: 'amazonwebservices',
  azure: 'azure',
  googlecloud: 'googlecloud',
  gcp: 'googlecloud',
  heroku: 'heroku',
  digitalocean: 'digitalocean',
  vercel: 'vercel',
  netlify: 'netlify',
  linux: 'linux',
  ubuntu: 'ubuntu',
  debian: 'debian',
  fedora: 'fedora',
  centos: 'centos',
  archlinux: 'archlinux',
  blackarch: 'archlinux', // using archlinux for blackarch
  kalilinux: 'kalilinux',
  popos: 'pop',
  'pop!_os': 'pop',
  parrotos: 'parrot',
  zorinos: 'zorin',
  rhel: 'redhat',
  redhat: 'redhat',
  yarn: 'yarn',
  npm: 'npm',
  gulp: 'gulp',
  grunt: 'grunt',
  prometheus: 'prometheus',
  grafana: 'grafana',

  // Design & 3D
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
  canva: 'canva',
  
  // Editors
  vscode: 'vscode',
  pycharm: 'pycharm',
  intellij: 'intellij',
  androidstudio: 'androidstudio',
  atom: 'atom',
  sublimetext: 'sublimetext',
  vim: 'vim',
  neovim: 'neovim',
  
  // Other
  jupyter: 'jupyter',
  arduino: 'arduino',
  raspberrypi: 'raspberrypi',
  flutter: 'flutter',
  'react native': 'react',
};

// Icons that should use the "original" (colored) version. Most plain icons are single-color and can be themed.
const COLORED_ICONS = new Set([
  'react', 'vuejs', 'nextjs', 'python', 'java', 'html5', 'css3', 
  'javascript', 'typescript', 'svelte', 'angular', 'bootstrap',
  'tailwindcss', 'nodejs', 'express', 'django', 'flask', 'spring',
  'laravel', 'rails', 'flutter', 'linux', 'ubuntu', 'docker', 
  'kubernetes', 'amazonwebservices', 'googlecloud', 'azure', 'firebase', 'figma',
  'pandas', 'numpy', 'tensorflow', 'pytorch', 'jupyter', 'vscode',
  'github', 'gitlab', 'mongodb', 'redis', 'mysql', 'postgresql',
  'bootstrap', 'jquery', 'redux', 'graphql'
]);

const getDeviconUrl = (courseName: string): { url: string | null, colored: boolean } => {
  const nameLower = courseName.toLowerCase().replace(/ /g, '').replace(/[#.+]/g, '');
  
  // Sort keys by length descending to match more specific names first (e.g., "javascript" before "java")
  const sortedKeys = Object.keys(DEVICON_MAP).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    if (nameLower.includes(key)) {
      const iconName = DEVICON_MAP[key];
      // Use 'plain' for themeable single-color icons, and 'original' for iconic multi-color logos
      const version = COLORED_ICONS.has(iconName) ? 'original' : 'plain';
      return {
        url: `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${iconName}/${iconName}-${version}.svg`,
        colored: COLORED_ICONS.has(iconName)
      };
    }
  }

  return { url: null, colored: false };
};

const getFaviconUrl = (course: Course): string | null => {
  if (course.links && course.links.length > 0) {
    const firstUrl = course.links[0].url;
    if (firstUrl) {
      try {
        // Ensure the URL has a protocol
        let fullUrl = firstUrl;
        if (!/^https?:\/\//i.test(fullUrl)) {
          fullUrl = 'https://' + fullUrl;
        }
        const domain = new URL(fullUrl).hostname;
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
    return (
      <Image 
        src={course.logo} 
        alt={course.name} 
        width={48} 
        height={48} 
        className={cn("rounded-sm object-contain", className)} 
        unoptimized 
      />
    );
  }

  // Priority 2: Devicon
  const { url: deviconUrl, colored } = getDeviconUrl(course.name);
  if (deviconUrl) {
    return (
      <Image
        src={deviconUrl}
        alt={course.name}
        width={48}
        height={48}
        className={cn(
          "rounded-sm object-contain",
          // Only apply dark mode inversion to monochrome (plain) icons
          !colored && "dark:invert dark:opacity-90",
          className
        )}
        unoptimized
        // Fallback to favicon if the devicon fails to load
        onError={(e) => {
          const faviconUrl = getFaviconUrl(course);
          if (faviconUrl) {
            (e.target as HTMLImageElement).src = faviconUrl;
          } else {
            (e.target as HTMLImageElement).style.display = 'none';
          }
        }}
      />
    );
  }

  // Priority 3: Favicon
  const faviconUrl = getFaviconUrl(course);
  if (faviconUrl) {
    return (
      <Image 
        src={faviconUrl} 
        alt={course.name} 
        width={48} 
        height={48} 
        className={cn("rounded-sm object-contain", className)} 
        unoptimized
      />
    );
  }

  // Priority 4: Fallback
  return (
    <div className={cn("flex items-center justify-center bg-muted rounded-sm", className)}>
      <Book className="w-1/2 h-1/2 text-muted-foreground" />
    </div>
  );
}
