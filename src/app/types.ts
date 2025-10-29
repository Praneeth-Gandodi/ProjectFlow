export interface Project {
  id: string;
  title: string;
  description: string;
  requirements: string;
  links: { title: string; url: string }[];
  logo: string;
  progress: number;
  tags: string[];
}

export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
}
