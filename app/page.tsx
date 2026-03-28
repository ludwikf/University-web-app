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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const taskDetailRef = useRef<HTMLDialogElement>(null);

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

  useEffect(() => {
    if (!dialogRef.current) return;
    if (dialogOpen) dialogRef.current.showModal();
    else dialogRef.current.close();
  }, [dialogOpen]);

  useEffect(() => {
    if (!taskDetailRef.current) return;
    if (selectedTaskId) taskDetailRef.current.showModal();
    else taskDetailRef.current.close();
  }, [selectedTaskId]);

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

  const inputBase =
    "w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-[0.9375rem] outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";
  const btnBase =
    "rounded-lg font-medium cursor-pointer border-none transition-colors";
  const btnAdd =
    "py-2.5 px-5 bg-indigo-500 text-white hover:bg-indigo-400 text-[0.9375rem]";
  const btnSm = "py-1.5 px-3 text-[0.8125rem]";
  const btnPrimary = "bg-indigo-500 text-white hover:bg-indigo-400";
  const btnGhost =
    "bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-between items-center px-[30px] pt-6 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold tracking-tight">
            Project Manager
          </h1>
          <span className="text-sm text-zinc-500 border-l border-zinc-200 pl-4">
            Zalogowany: {currentUser.firstName} {currentUser.lastName} (
            {currentUser.role})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Widok:</span>
          <div
            role="group"
            aria-label="Tryb widoku"
            className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5"
          >
            <button
              type="button"
              onClick={() => setViewMode("tiles")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "tiles"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Kafelki
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Tabela
            </button>
          </div>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className={`${btnBase} ${btnAdd}`}
          >
            Dodaj projekt
          </button>
        </div>
      </div>
      <div className="px-[30px] pb-2 text-xs text-zinc-500">
        Użytkownicy:{" "}
        {MOCK_USERS.map((u) => `${u.firstName} ${u.lastName} (${u.role})`).join(
          " · "
        )}
      </div>

      <section className="flex-1 px-[30px] py-6 overflow-auto space-y-8">
        <div>
          <h2 className="text-sm font-medium text-zinc-500 mb-3">Projekty</h2>
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
            <div className="pt-6 border-t border-zinc-200">
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
            <div className="pt-6 border-t border-zinc-200">
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
        ref={taskDetailRef}
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

      <dialog
        ref={dialogRef}
        onCancel={() => setDialogOpen(false)}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl backdrop:bg-black/20 backdrop:backdrop-blur-sm"
      >
        <h2 className="text-xl font-semibold tracking-tight mb-4">
          Nowy projekt
        </h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Tytuł projektu"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className={inputBase}
          />
          <textarea
            placeholder="Opis"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputBase} resize-y min-h-[60px]`}
          />
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className={`${btnBase} ${btnSm} ${btnGhost}`}
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className={`${btnBase} ${btnSm} ${btnPrimary}`}
            >
              Dodaj
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
