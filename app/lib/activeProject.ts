const STORAGE_KEY = "activeProjectId";

export function getActiveProjectId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setActiveProjectId(projectId: string | null): void {
  if (typeof window === "undefined") return;
  if (projectId === null) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, projectId);
}
