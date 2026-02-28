export type Project = {
  id: string;
  title: string;
  description: string;
  createdAt: number;
};

const STORAGE_KEY = "projects";

export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function createProject(title: string, description: string): Project {
  return {
    id: crypto.randomUUID(),
    title,
    description,
    createdAt: Date.now(),
  };
}
