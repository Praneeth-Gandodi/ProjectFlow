
export interface Note {
  id: string;
  date: string;
  content: string;
}

export interface Link {
  id?: string; 
  title: string;
  url: string;
  description?: string;
}

export interface Course {
  id: string;
  name: string;
  completed: boolean;
  links?: Link[];
  logo?: string;
  notes?: Note[];
  reason?: string;
}

export interface Requirement {
  id: string;
  text: string;
  completed: boolean;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  requirements?: string | string[];
  logo?: string;
  links?: Link[];
  notes?: Note[];
  progress?: number;
  tags?: string[];
  repoUrl?: string;
  apiKeys?: any[]; 
  apiKeyPin?: string;
  dueDate?: string;
}
