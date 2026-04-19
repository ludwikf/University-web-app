"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  type Project,
  getProjects,
  saveProjects,
  createProject,
} from "./lib/projects";
import { getActiveProjectId, setActiveProjectId } from "./lib/activeProject";
import {
  getStoriesByProject,
  createStory,
  updateStory,
  deleteStory,
} from "./lib/stories";
import {
  getTasksByProject,
  createTask,
  deleteTask,
  assignTaskToUser,
  markTaskDone,
  updateTask,
  deleteTasksByStory,
} from "./lib/tasks";
import { MOCK_USERS, usersToMap, getCurrentUser, type User } from "./lib/user";
import type { StoryPriority } from "./lib/stories";
import type { Task } from "./lib/tasks";
import { ProjectsTilesView } from "./components/ProjectsTilesView";
import { ProjectsTableView } from "./components/ProjectsTableView";
import { StoriesSection } from "./components/StoriesSection";
import { TasksKanban } from "./components/TasksKanban";
import { TaskDetailDialog } from "./components/TaskDetailDialog";
import { AddTaskDialog } from "./components/AddTaskDialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [viewMode, setViewMode] = useState<"tiles" | "table">("tiles");
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(
    null
  );
  const [stories, setStories] = useState<
    ReturnType<typeof getStoriesByProject>
  >([]);
  const [tasks, setTasks] = useState<ReturnType<typeof getTasksByProject>>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const hasHydrated = useRef(false);

  const currentUser = useMemo(() => getCurrentUser(), []);
  const usersById = useMemo(() => usersToMap(MOCK_USERS), []);

  useEffect(() => {
    setProjects(getProjects());
    setActiveProjectIdState(getActiveProjectId());
    const id = requestAnimationFrame(() => {
      hasHydrated.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (hasHydrated.current) saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (
      activeProjectId !== null &&
      !projects.some((p) => p.id === activeProjectId)
    ) {
      setActiveProject(null);
    }
  }, [activeProjectId, projects]);

  useEffect(() => {
    if (activeProjectId) setStories(getStoriesByProject(activeProjectId));
    else setStories([]);
  }, [activeProjectId]);

  useEffect(() => {
    if (activeProjectId) setTasks(getTasksByProject(activeProjectId));
    else setTasks([]);
  }, [activeProjectId]);

  function refreshTasks() {
    if (activeProjectId) setTasks(getTasksByProject(activeProjectId));
  }

  function refreshStoriesAndTasks() {
    refreshStories();
    refreshTasks();
  }

  function setActiveProject(id: string | null) {
    setActiveProjectIdState(id);
    setActiveProjectId(id);
    if (id) {
      setStories(getStoriesByProject(id));
      setTasks(getTasksByProject(id));
    }
  }

  function refreshStories() {
    if (activeProjectId) setStories(getStoriesByProject(activeProjectId));
  }

  function handleAddStory(
    nazwa: string,
    opis: string,
    priorytet: "niski" | "średni" | "wysoki"
  ) {
    if (!activeProjectId) return;
    createStory(activeProjectId, nazwa, opis, priorytet, currentUser);
  }

  function handleUpdateStoryStatus(
    storyId: string,
    stan: "todo" | "doing" | "done"
  ) {
    if (!activeProjectId) return;
    updateStory(activeProjectId, storyId, { stan });
  }

  function handleUpdateStory(
    storyId: string,
    patch: {
      nazwa?: string;
      opis?: string;
      priorytet?: "niski" | "średni" | "wysoki";
    }
  ) {
    if (!activeProjectId) return;
    updateStory(activeProjectId, storyId, patch);
  }

  function handleDeleteStory(storyId: string) {
    if (!activeProjectId) return;
    deleteTasksByStory(storyId);
    deleteStory(activeProjectId, storyId);
    refreshStoriesAndTasks();
  }

  function handleCreateTask(
    historiaId: string,
    nazwa: string,
    opis: string,
    priorytet: "niski" | "średni" | "wysoki",
    estimatedHours: number
  ) {
    if (!activeProjectId) return;
    createTask(
      activeProjectId,
      historiaId,
      nazwa,
      opis,
      priorytet,
      estimatedHours
    );
    refreshTasks();
  }

  function handleAdd() {
    const t = title.trim();
    if (!t) return;
    setProjects((prev) => [...prev, createProject(t, description.trim())]);
    setTitle("");
    setDescription("");
    setDialogOpen(false);
  }

  function handleDelete(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function startEdit(p: Project) {
    setEditingId(p.id);
    setEditTitle(p.title);
    setEditDescription(p.description);
  }

  function saveEdit() {
    if (!editingId) return;
    const t = editTitle.trim();
    if (!t) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === editingId
          ? { ...p, title: t, description: editDescription.trim() }
          : p
      )
    );
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="flex justify-between items-center px-[30px] pt-6 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold tracking-tight">
            Project Manager
          </h1>
          <span className="text-sm text-muted-foreground border-l border-border pl-4">
            Zalogowany: {currentUser.firstName} {currentUser.lastName} (
            {currentUser.role})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="text-sm text-muted-foreground">Widok:</span>
          <div
            role="group"
            aria-label="Tryb widoku"
            className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5"
          >
            <button
              type="button"
              onClick={() => setViewMode("tiles")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "tiles"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Kafelki
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "table"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Tabela
            </button>
          </div>
          <Button onClick={() => setDialogOpen(true)}>Dodaj projekt</Button>
        </div>
      </div>
      <Separator className="mt-4" />
      <div className="px-[30px] pb-2 pt-2 text-xs text-muted-foreground">
        Użytkownicy:{" "}
        {MOCK_USERS.map((u) => `${u.firstName} ${u.lastName} (${u.role})`).join(
          " · "
        )}
      </div>

      <section className="flex-1 px-[30px] py-6 overflow-auto space-y-8">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Projekty
          </h2>
          {viewMode === "tiles" ? (
            <ProjectsTilesView
              projects={projects}
              activeProjectId={activeProjectId}
              editingId={editingId}
              editTitle={editTitle}
              editDescription={editDescription}
              onEditTitle={setEditTitle}
              onEditDescription={setEditDescription}
              onStartEdit={startEdit}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              onDelete={handleDelete}
              onSetActiveProject={(id) => setActiveProject(id)}
            />
          ) : (
            <ProjectsTableView
              projects={projects}
              activeProjectId={activeProjectId}
              editingId={editingId}
              editTitle={editTitle}
              editDescription={editDescription}
              onEditTitle={setEditTitle}
              onEditDescription={setEditDescription}
              onStartEdit={startEdit}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              onDelete={handleDelete}
              onSetActiveProject={(id) => setActiveProject(id)}
            />
          )}
        </div>

        {activeProjectId && (
          <>
            <div className="pt-6 border-t border-border">
              <StoriesSection
                projectId={activeProjectId}
                projectTitle={
                  projects.find((p) => p.id === activeProjectId)?.title ?? ""
                }
                stories={stories}
                currentUser={currentUser}
                usersById={usersById}
                onStoriesChange={refreshStoriesAndTasks}
                onCreateStory={handleAddStory}
                onUpdateStoryStatus={handleUpdateStoryStatus}
                onUpdateStory={handleUpdateStory}
                onDeleteStory={handleDeleteStory}
              />
            </div>
            <div className="pt-6 border-t border-border">
              <TasksKanban
                tasks={tasks}
                stories={stories}
                onSelectTask={(id) => setSelectedTaskId(id)}
                onAddTask={() => setAddTaskOpen(true)}
              />
            </div>
          </>
        )}
      </section>

      <TaskDetailDialog
        taskId={selectedTaskId}
        tasks={tasks}
        stories={stories}
        usersById={usersById}
        assignableUsers={MOCK_USERS.filter(
          (u) => u.role === "developer" || u.role === "devops"
        )}
        onClose={() => setSelectedTaskId(null)}
        onAssign={(user: User) => {
          if (!selectedTaskId) return;
          assignTaskToUser(selectedTaskId, user);
          refreshStoriesAndTasks();
        }}
        onMarkDone={() => {
          if (!selectedTaskId) return;
          markTaskDone(selectedTaskId);
          refreshStoriesAndTasks();
        }}
        onUpdateActualHours={(hours: number) => {
          if (!selectedTaskId) return;
          updateTask(selectedTaskId, { actualHoursWorked: hours });
          refreshTasks();
        }}
        onUpdateTask={(
          patch: Partial<
            Pick<Task, "nazwa" | "opis" | "priorytet" | "estimatedHours">
          >
        ) => {
          if (!selectedTaskId) return;
          updateTask(selectedTaskId, patch);
          refreshTasks();
        }}
        onDelete={() => {
          if (!selectedTaskId) return;
          deleteTask(selectedTaskId);
          refreshTasks();
          setSelectedTaskId(null);
        }}
      />

      <AddTaskDialog
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        stories={stories}
        onCreate={(
          hid: string,
          nazwa: string,
          opis: string,
          pri: StoryPriority,
          h: number
        ) => {
          handleCreateTask(hid, nazwa, opis, pri, h);
          setAddTaskOpen(false);
        }}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nowy projekt</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="project-title">Tytuł</Label>
              <Input
                id="project-title"
                placeholder="Tytuł projektu"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-desc">Opis</Label>
              <Textarea
                id="project-desc"
                placeholder="Opis"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleAdd}>Dodaj</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
