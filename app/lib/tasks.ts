import { getStoryById, updateStory } from "./stories";
import type { StoryPriority } from "./stories";
import type { User } from "./user";
import { canAssignToTask } from "./user";

export type TaskStatus = "todo" | "doing" | "done";

export type Task = {
  id: string;
  nazwa: string;
  opis: string;
  priorytet: StoryPriority;
  historiaId: string;
  projektId: string;
  estimatedHours: number;
  stan: TaskStatus;
  createdAt: number;
  startedAt: number | null;
  completedAt: number | null;
  assigneeId: string | null;
  actualHoursWorked: number;
};

const STORAGE_KEY = "tasks";

function getStored(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStored(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function getTasksByProject(projectId: string): Task[] {
  return getStored()
    .filter((t) => t.projektId === projectId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getTasksByStory(historiaId: string): Task[] {
  return getStored().filter((t) => t.historiaId === historiaId);
}

export function getTaskById(taskId: string): Task | null {
  return getStored().find((t) => t.id === taskId) ?? null;
}

export function createTask(
  projektId: string,
  historiaId: string,
  nazwa: string,
  opis: string,
  priorytet: StoryPriority,
  estimatedHours: number
): Task {
  const task: Task = {
    id: crypto.randomUUID(),
    nazwa: nazwa.trim(),
    opis: opis.trim(),
    priorytet,
    historiaId,
    projektId,
    estimatedHours,
    stan: "todo",
    createdAt: Date.now(),
    startedAt: null,
    completedAt: null,
    assigneeId: null,
    actualHoursWorked: 0,
  };
  const all = getStored();
  all.push(task);
  setStored(all);
  return task;
}

export function updateTask(
  taskId: string,
  patch: Partial<
    Pick<
      Task,
      | "nazwa"
      | "opis"
      | "priorytet"
      | "estimatedHours"
      | "actualHoursWorked"
    >
  >
): Task | null {
  const all = getStored();
  const idx = all.findIndex((t) => t.id === taskId);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  setStored(all);
  return all[idx];
}

export function deleteTask(taskId: string): boolean {
  const all = getStored().filter((t) => t.id !== taskId);
  if (all.length === getStored().length) return false;
  setStored(all);
  return true;
}

export function deleteTasksByStory(historiaId: string): void {
  setStored(getStored().filter((t) => t.historiaId !== historiaId));
}

function maybeCompleteStory(historiaId: string, projektId: string): void {
  const tasks = getTasksByStory(historiaId);
  if (tasks.length === 0) return;
  if (tasks.every((t) => t.stan === "done")) {
    updateStory(projektId, historiaId, { stan: "done" });
  }
}

export function assignTaskToUser(
  taskId: string,
  assignee: User
): Task | null {
  if (!canAssignToTask(assignee)) return null;
  const all = getStored();
  const idx = all.findIndex((t) => t.id === taskId);
  if (idx === -1) return null;
  const task = all[idx];
  if (task.stan === "done") return null;
  const now = Date.now();
  const becomesDoing = task.stan === "todo";
  all[idx] = {
    ...task,
    assigneeId: assignee.id,
    stan: becomesDoing ? "doing" : task.stan,
    startedAt: task.startedAt ?? now,
  };
  setStored(all);
  const story = getStoryById(task.historiaId);
  if (becomesDoing && story && story.stan === "todo") {
    updateStory(task.projektId, task.historiaId, { stan: "doing" });
  }
  return all[idx];
}

export function markTaskDone(taskId: string): Task | null {
  const all = getStored();
  const idx = all.findIndex((t) => t.id === taskId);
  if (idx === -1) return null;
  const task = all[idx];
  if (!task.assigneeId) return null;
  const now = Date.now();
  all[idx] = {
    ...task,
    stan: "done",
    completedAt: now,
  };
  setStored(all);
  maybeCompleteStory(task.historiaId, task.projektId);
  return all[idx];
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Do zrobienia",
  doing: "W trakcie",
  done: "Zakończone",
};
