export interface Project {
  id: string;
  title: string;
  description: string;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
}
