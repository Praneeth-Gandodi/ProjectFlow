
export interface Note {
  id: string;
  date: string;
  content: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  requirements: string;
  links: { title: string; url: string }[];
  logo: string;
  progress: number;
  tags: string[];
  notes?: Note[];
}

export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
}
