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
  // Programming Languages
  cplusplus: 'cplusplus',
  cpp: 'cplusplus',
  csharp: 'csharp',
  'c#': 'csharp',
  python: 'python',
  java: 'java',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  go: 'go',
  golang: 'go',
  rust: 'rust',
  kotlin: 'kotlin',
  swift: 'swift',
  dart: 'dart',
  php: 'php',
  ruby: 'ruby',
  r: 'r',
  julia: 'julia',
  scala: 'scala',
  haskell: 'haskell',
  elixir: 'elixir',
  perl: 'perl',
  bash: 'bash',
  shell: 'bash',
  powershell: 'powershell',
  assembly: 'wasm',
  verilog: 'verilog',
  vhdl: 'vhdl',
  solidity: 'solidity',
  vyper: 'vyper',
  sql: 'azuresqldatabase',
  nosql: 'mongodb',
  c: 'c',

  // Web Frontend
  html: 'html5',
  css: 'css3',
  bootstrap: 'bootstrap',
  tailwindcss: 'tailwindcss',
  'tailwind css': 'tailwindcss',
  react: 'react',
  angular: 'angular',
  vue: 'vuejs',
  'vue.js': 'vuejs',
  svelte: 'svelte',
  nextjs: 'nextjs',
  'next.js': 'nextjs',
  nuxtjs: 'nuxtjs',
  'nuxt.js': 'nuxtjs',
  remix: 'remix',
  jquery: 'jquery',

  // Web Backend & Frameworks
  nodejs: 'nodejs',
  'node.js': 'nodejs',
  express: 'express',
  'express.js': 'express',
  django: 'django',
  flask: 'flask',
  springboot: 'spring',
  'spring boot': 'spring',
  aspnet: 'dot-net',
  'asp.net': 'dot-net',
  laravel: 'laravel',
  rubyonrails: 'rails',
  'ruby on rails': 'rails',
  fastapi: 'fastapi',
  nestjs: 'nestjs',
  gin: 'go',
  fiber: 'go',

  // Databases
  mysql: 'mysql',
  postgresql: 'postgresql',
  sqlite: 'sqlite',
  mongodb: 'mongodb',
  cassandra: 'cassandra',
  redis: 'redis',
  firebase: 'firebase',
  dynamodb: 'amazonwebservices',
  neo4j: 'neo4j',
  elasticsearch: 'elasticsearch',

  // Linux Distributions
  linux: 'linux',
  ubuntu: 'ubuntu',
  debian: 'debian',
  fedora: 'fedora',
  archlinux: 'archlinux',
  'arch linux': 'archlinux',
  kalilinux: 'kalilinux',
  'kali linux': 'kalilinux',
  centos: 'centos',
  rhel: 'redhat',
  'red hat': 'redhat',
  'red hat enterprise linux': 'redhat',
  parrot: 'parrot',
  'parrot os': 'parrot',
  popos: 'popos',
  'pop!_os': 'popos',
  zorinos: 'zorinos',
  'zorin os': 'zorinos',

  // DevOps & Cloud
  git: 'git',
  github: 'github',
  gitlab: 'gitlab',
  bitbucket: 'bitbucket',
  docker: 'docker',
  kubernetes: 'kubernetes',
  jenkins: 'jenkins',
  terraform: 'terraform',
  ansible: 'ansible',
  cicd: 'githubactions',
  'ci/cd': 'githubactions',
  nginx: 'nginx',
  apache: 'apache',
  aws: 'amazonwebservices',
  'amazon web services': 'amazonwebservices',
  gcp: 'googlecloud',
  'google cloud': 'googlecloud',
  'google cloud platform': 'googlecloud',
  azure: 'azure',
  'microsoft azure': 'azure',
  heroku: 'heroku',
  netlify: 'netlify',
  vercel: 'vercel',
  digitalocean: 'digitalocean',

  // Design & 3D Tools
  figma: 'figma',
  xd: 'xd',
  'adobe xd': 'xd',
  photoshop: 'photoshop',
  'adobe photoshop': 'photoshop',
  illustrator: 'illustrator',
  'adobe illustrator': 'illustrator',
  canva: 'canva',
  webflow: 'webflow',
  framer: 'framer',
  blender: 'blender',
  unity: 'unity',
  unrealengine: 'unrealengine',
  'unreal engine': 'unrealengine',
  godot: 'godot',
  cryengine: 'cryengine',
  maya: 'maya',

  // Data Science & ML
  pandas: 'pandas',
  numpy: 'numpy',
  matplotlib: 'matplotlib',
  seaborn: 'seaborn',
  plotly: 'plotly',
  scikitlearn: 'scikitlearn',
  'scikit-learn': 'scikitlearn',
  tensorflow: 'tensorflow',
  pytorch: 'pytorch',
  keras: 'keras',
  opencv: 'opencv',
  nltk: 'nltk',
  spacy: 'spacy',
  huggingface: 'huggingface',
  'hugging face': 'huggingface',
  transformers: 'huggingface',
  statsmodels: 'statsmodels',
  xgboost: 'xgboost',
  lightgbm: 'lightgbm',
  catboost: 'catboost',
  jupyter: 'jupyter',
  jupyternotebook: 'jupyter',
  'jupyter notebook': 'jupyter',
  googlecolab: 'googlecolab',
  'google colab': 'googlecolab',
  anaconda: 'anaconda',
  tableau: 'tableau',
  powerbi: 'powerbi',
  'power bi': 'powerbi',
  excel: 'microsoftsqlserver',

  // Big Data & Analytics
  hadoop: 'hadoop',
  'apache hadoop': 'hadoop',
  spark: 'apachespark',
  'apache spark': 'apachespark',
  pyspark: 'apachespark',
  kafka: 'apachekafka',
  'apache kafka': 'apachekafka',
  airflow: 'airflow',
  'apache airflow': 'airflow',
  snowflake: 'snowflake',
  databricks: 'databricks',

  // IoT & Embedded
  arduino: 'arduino',
  raspberrypi: 'raspberrypi',
  'raspberry pi': 'raspberrypi',
  matlab: 'matlab',
  simulink: 'matlab',
  ros: 'ros',
  'robot operating system': 'ros',
  opengl: 'opengl',
  opengaigym: 'openai',
  'openai gym': 'openai',
  tensorboard: 'tensorflow',
  mlflow: 'mlflow',

  // Security Tools
  wireshark: 'wireshark',
  burpsuite: 'burpsuite',
  'burp suite': 'burpsuite',
  metasploit: 'metasploit',
  nmap: 'nmap',
  johntheripper: 'johntheripper',
  'john the ripper': 'johntheripper',
  hydra: 'hydra',
  aircrackng: 'aircrackng',
  'aircrack-ng': 'aircrackng',
  hashcat: 'hashcat',
  owaspzap: 'zap',
  'owasp zap': 'zap',

  // IDEs & Editors
  vscode: 'vscode',
  'vs code': 'vscode',
  'visual studio code': 'vscode',
  pycharm: 'pycharm',
  intellij: 'intellij',
  'intellij idea': 'intellij',
  eclipse: 'eclipse',
  androidstudio: 'androidstudio',
  'android studio': 'androidstudio',
  xcode: 'xcode',
  atom: 'atom',
  sublimetext: 'sublimetext',
  'sublime text': 'sublimetext',
  vim: 'vim',
  neovim: 'neovim',
  jupyterlab: 'jupyter',
  'jupyter lab': 'jupyter',
  rstudio: 'rstudio',

  // Collaboration Tools
  slack: 'slack',
  discord: 'discord',
  microsoftteams: 'microsoftteams',
  'microsoft teams': 'microsoftteams',
  notion: 'notion',
  trello: 'trello',
  jira: 'jira',
  obsidian: 'obsidian',
  googleworkspace: 'google',
  'google workspace': 'google',
  miro: 'miro',
  lucidchart: 'lucidchart',
  drawio: 'drawio',

  // API & Web Services
  restapi: 'restapi',
  'rest api': 'restapi',
  graphql: 'graphql',
  postman: 'postman',
  grpc: 'grpc',
  swagger: 'swagger',
  curl: 'curl',

  // Cloud Services
  awsec2: 'amazonwebservices',
  'aws ec2': 'amazonwebservices',
  awslambda: 'amazonwebservices',
  'aws lambda': 'amazonwebservices',
  s3: 'amazonwebservices',
  cloudfront: 'amazonwebservices',
  cloudflare: 'cloudflare',
  firebasehosting: 'firebase',
  'firebase hosting': 'firebase',

  // ML Tools & Platforms
  weightsbiases: 'weightsbiases',
  'weights & biases': 'weightsbiases',
  openai: 'openai',
  'openai api': 'openai',
  langchain: 'langchain',

  // Build Tools
  shellscripting: 'bash',
  'shell scripting': 'bash',
  batchscripting: 'windows',
  'batch scripting': 'windows',
  make: 'make',
  cmake: 'cmake',
  gradle: 'gradle',
  maven: 'maven',

  // Monitoring & Observability
  helm: 'helm',
  prometheus: 'prometheus',
  grafana: 'grafana',
  elasticstack: 'elasticsearch',
  'elastic stack': 'elasticsearch',
  elk: 'elasticsearch',

  // Documentation
  latex: 'latex',
  overleaf: 'overleaf',
  gitbook: 'gitbook',
  markdown: 'markdown',

  // Coding Platforms
  leetcode: 'leetcode',
  codeforces: 'codeforces',
  hackerrank: 'hackerrank',
  atcoder: 'atcoder',
  codechef: 'codechef',
  geeksforgeeks: 'geeksforgeeks',
  hackerearth: 'hackerearth',

  // Data Visualization
  googledatastudio: 'googlecloud',
  'google data studio': 'googlecloud',

  // Virtualization
  virtualbox: 'virtualbox',
  vmware: 'vmware',
  qemu: 'qemu',

  // Shells
  zsh: 'zsh',
  fish: 'fish',
  'fish shell': 'fish',

  // Blockchain
  blockchain: 'blockchain',
  ethereum: 'ethereum',
  smartcontracts: 'ethereum',
  'smart contracts': 'ethereum',
  web3js: 'web3js',
  'web3.js': 'web3js',
  ethersjs: 'ethers',

  // Containerization
  dockercompose: 'docker',
  'docker compose': 'docker',
  awscli: 'amazonwebservices',
  'aws cli': 'amazonwebservices',
  azurecli: 'azure',
  'azure cli': 'azure',
  gcpsdk: 'googlecloud',
  'gcp sdk': 'googlecloud',

  // Computer Vision
  mediapipe: 'mediapipe',
  yolo: 'yolo',
  detectron2: 'detectron',

  // NLP
  bert: 'bert',
  gpt: 'openai',
  rasa: 'rasa',

  // Big Data Processing
  dask: 'dask',
  hadoopmapreduce: 'hadoop',
  'hadoop mapreduce': 'hadoop',

  // Configuration Management
  puppet: 'puppet',
  chef: 'chef',
  saltstack: 'saltstack',

  // CI/CD Platforms
  circleci: 'circleci',
  travisci: 'travisci',
  'travis ci': 'travisci',
  githubactions: 'githubactions',
  'github actions': 'githubactions',

  // API Testing
  insomnia: 'insomnia',

  // Backend as a Service
  supabase: 'supabase',
  appwrite: 'appwrite',
  planetscale: 'planetscale',
  hasura: 'hasura',
  prisma: 'prisma',

  // Note-taking
  roamresearch: 'roam',
  'roam research': 'roam',
  googlekeep: 'google',
  'google keep': 'google',

  // Mobile Development
  flutter: 'flutter',
  reactnative: 'react',
  'react native': 'react',
  ionic: 'ionic',
  xamarin: 'xamarin',
  swiftui: 'swift',
  jetpackcompose: 'androidstudio',
  'jetpack compose': 'androidstudio',

  // Reinforcement Learning
  stablebaselines: 'python',
  'stable baselines': 'python',
  gymnasium: 'python',
  rllib: 'python',

  // Data Processing
  hive: 'hive',
  pig: 'pig',
  hbase: 'hbase',

  // Robotics
  gazebo: 'gazebo',
  vrep: 'vrep',
  tensorflowlite: 'tensorflow',
  'tensorflow lite': 'tensorflow',
  onnx: 'onnx',
  coreml: 'apple',

  // Version Control
  gerrit: 'gerrit',

  // Design Tools
  sketch: 'sketch',
  invision: 'invision',

  // Documentation Platforms
  googledocs: 'google',
  'google docs': 'google',

  // Cloud Providers
  ibmcloud: 'ibm',
  'ibm cloud': 'ibm',
  oraclecloud: 'oracle',
  'oracle cloud': 'oracle'
};

// Icons that should use the "original" (colored) version
const COLORED_ICONS = new Set([
  'c', 'cplusplus', 'python', 'java', 'javascript', 'typescript', 
  'csharp', 'go', 'rust', 'kotlin', 'swift', 'dart', 'php', 
  'ruby', 'r', 'julia', 'scala', 'haskell', 'elixir', 'html5', 
  'css3', 'bash', 'powershell', 'solidity', 'vyper',
  'react', 'vuejs', 'angular', 'svelte', 'nextjs', 'nuxtjs', 
  'remix', 'jquery', 'bootstrap', 'tailwindcss',
  'nodejs', 'express', 'django', 'flask', 'spring', 'dot-net', 
  'laravel', 'rails', 'fastapi', 'nestjs',
  'mysql', 'postgresql', 'sqlite', 'mongodb', 'cassandra', 
  'redis', 'firebase', 'neo4j', 'elasticsearch',
  'linux', 'ubuntu', 'debian', 'fedora', 'archlinux', 'kalilinux', 
  'centos', 'redhat', 'parrot', 'popos', 'zorinos',
  'git', 'github', 'gitlab', 'bitbucket', 'docker', 'kubernetes', 
  'jenkins', 'terraform', 'ansible', 'nginx', 'apache', 
  'amazonwebservices', 'googlecloud', 'azure', 'heroku', 
  'netlify', 'vercel', 'digitalocean', 'cloudflare',
  'figma', 'xd', 'photoshop', 'illustrator', 'canva', 'webflow', 
  'framer', 'blender', 'unity', 'unrealengine', 'godot', 
  'cryengine', 'maya', 'sketch',
  'pandas', 'numpy', 'matplotlib', 'seaborn', 'plotly', 
  'scikitlearn', 'tensorflow', 'pytorch', 'keras', 'opencv', 
  'nltk', 'spacy', 'huggingface', 'statsmodels', 'xgboost', 
  'lightgbm', 'catboost', 'jupyter', 'googlecolab', 'anaconda', 
  'tableau', 'powerbi',
  'hadoop', 'apachespark', 'apachekafka', 'airflow', 'snowflake', 
  'databricks',
  'arduino', 'raspberrypi', 'matlab', 'ros', 'opengl', 'openai',
  'wireshark', 'burpsuite', 'metasploit', 'nmap', 'johntheripper', 
  'hydra', 'aircrackng', 'hashcat', 'zap',
  'vscode', 'pycharm', 'intellij', 'eclipse', 'androidstudio', 
  'xcode', 'atom', 'sublimetext', 'vim', 'neovim', 'rstudio',
  'slack', 'discord', 'microsoftteams', 'notion', 'trello', 
  'jira', 'obsidian', 'miro', 'lucidchart', 'drawio',
  'graphql', 'postman', 'swagger', 'grpc', 'curl',
  'ethereum', 'web3js', 'ethers', 'blockchain',
  'latex', 'markdown', 'gitbook', 'overleaf'
]);

const getDeviconUrl = (courseName: string): { url: string | null, colored: boolean } => {
  const nameLower = courseName.toLowerCase();
  const nameLowerNoSpecial = nameLower.replace(/[.#+]/g, '').replace(/ /g, '');

  // Sort keys by length descending to match more specific names first
  const sortedKeys = Object.keys(DEVICON_MAP).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const processedKey = key.replace(/ /g, '');
    if (nameLowerNoSpecial.includes(processedKey)) {
      const iconName = DEVICON_MAP[key];
      const useOriginal = COLORED_ICONS.has(iconName);
      // Prefer 'plain' for non-colored, 'original' for colored
      const version = useOriginal ? 'original' : 'plain';
      return {
        url: `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${iconName}/${iconName}-${version}.svg`,
        colored: useOriginal
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
          !colored && "dark:invert dark:opacity-90",
          className
        )}
        unoptimized
        onError={(e) => {
          const faviconUrl = getFaviconUrl(course);
          if (faviconUrl) {
            (e.target as HTMLImageElement).src = faviconUrl;
            // Remove the dark mode inversion if we fall back to a favicon
            (e.target as HTMLImageElement).classList.remove("dark:invert", "dark:opacity-90");
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
