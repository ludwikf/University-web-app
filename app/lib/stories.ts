import type { User } from "./user";

export type StoryPriority = "niski" | "średni" | "wysoki";
export type StoryStatus = "todo" | "doing" | "done";

export type Story = {
  id: string;
  nazwa: string;
  opis: string;
  priorytet: StoryPriority;
  projektId: string;
  createdAt: number;
  stan: StoryStatus;
  ownerId: string;
};

const STORAGE_KEY = "stories";

function getStored(): Story[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStored(stories: Story[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
}

export function getStoriesByProject(projectId: string): Story[] {
  return getStored()
    .filter((s) => s.projektId === projectId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function saveStories(stories: Story[]): void {
  setStored(stories);
}

export function createStory(
  projectId: string,
  nazwa: string,
  opis: string,
  priorytet: StoryPriority,
  owner: User
): Story {
  const story: Story = {
    id: crypto.randomUUID(),
    nazwa: nazwa.trim(),
    opis: opis.trim(),
    priorytet,
    projektId: projectId,
    createdAt: Date.now(),
    stan: "todo",
    ownerId: owner.id,
  };
  const all = getStored();
  all.push(story);
  setStored(all);
  return story;
}

export function updateStory(
  projectId: string,
  storyId: string,
  patch: Partial<Pick<Story, "nazwa" | "opis" | "priorytet" | "stan" | "ownerId">>
): Story | null {
  const all = getStored();
  const idx = all.findIndex((s) => s.id === storyId && s.projektId === projectId);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  setStored(all);
  return all[idx];
}

export function deleteStory(projectId: string, storyId: string): boolean {
  const all = getStored().filter(
    (s) => !(s.id === storyId && s.projektId === projectId)
  );
  if (all.length === getStored().length) return false;
  setStored(all);
  return true;
}

export const STORY_STATUS_LABELS: Record<StoryStatus, string> = {
  todo: "Czekające na wykonanie",
  doing: "Aktualnie wykonywane",
  done: "Zamknięte",
};

export const STORY_PRIORITY_LABELS: Record<StoryPriority, string> = {
  niski: "Niski",
  średni: "Średni",
  wysoki: "Wysoki",
};
