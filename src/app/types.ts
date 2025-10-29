
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

export interface Project {
  id: string;
  title: string;
  description: string;
  requirements: string;
  links: Link[];
  logo: string;
  progress: number;
  tags: string[];
  notes?: Note[];
}

    