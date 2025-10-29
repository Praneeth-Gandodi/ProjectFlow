export interface Note {
  id: string;
  date: string;
  content: string;
}

export interface Link {
  id?: string; // Optional for new links
  title: string;
  url: string;
  description?: string;
}

export interface Requirement {
  id: string;
  text: string;
  completed: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;

  // Allow string for backward compatibility, but prefer Requirement[]
  requirements?: string | string[] | Requirement[];

  links: Link[];

  logo?: string;
  progress: number;
  tags: string[];

  notes?: Note[];
}
