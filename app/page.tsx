"use client";

import { useState, useEffect, useRef } from "react";
import {
  type Project,
  getProjects,
  saveProjects,
  createProject,
} from "./lib/projects";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const hasHydrated = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setProjects(getProjects());
    const id = requestAnimationFrame(() => {
      hasHydrated.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (hasHydrated.current) saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (dialogOpen) dialogRef.current.showModal();
    else dialogRef.current.close();
  }, [dialogOpen]);

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
  const inputSm = "px-3 py-2 text-sm";
  const btnBase =
    "rounded-lg font-medium cursor-pointer border-none transition-colors";
  const btnAdd =
    "py-2.5 px-5 bg-indigo-500 text-white hover:bg-indigo-400 text-[0.9375rem]";
  const btnSm = "py-1.5 px-3 text-[0.8125rem]";
  const btnPrimary = "bg-indigo-500 text-white hover:bg-indigo-400";
  const btnGhost =
    "bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100";
  const btnDanger =
    "bg-transparent text-red-600 hover:bg-red-50 hover:text-red-700";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-between items-center px-[30px] pt-6">
        <h1 className="text-xl font-semibold tracking-tight">
          Project Manager
        </h1>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className={`${btnBase} ${btnAdd}`}
        >
          Dodaj projekt
        </button>
      </div>
      <div className="border-t border-zinc-200 mt-4" />

      <section className="flex-1 px-[30px] py-6 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
        {projects.map((p) =>
          editingId === p.id ? (
            <div
              key={p.id}
              className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col gap-3.5"
            >
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={`${inputBase} ${inputSm}`}
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className={`${inputBase} ${inputSm} resize-y min-h-[60px]`}
              />
              <div className="flex gap-2 mt-auto pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={saveEdit}
                  className={`${btnBase} ${btnSm} ${btnPrimary}`}
                >
                  Zapisz
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className={`${btnBase} ${btnSm} ${btnGhost}`}
                >
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            <div
              key={p.id}
              className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col gap-3 transition-colors hover:border-zinc-300 hover:shadow-lg"
            >
              <h2 className="text-[1.0625rem] font-semibold tracking-tight m-0 leading-tight">
                {p.title}
              </h2>
              {p.description ? (
                <p className="text-sm text-zinc-600 m-0 leading-relaxed flex-1">
                  {p.description}
                </p>
              ) : null}
              <div className="flex gap-2 mt-auto pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className={`${btnBase} ${btnSm} ${btnGhost}`}
                >
                  Edytuj
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className={`${btnBase} ${btnSm} ${btnDanger}`}
                >
                  Usuń
                </button>
              </div>
            </div>
          )
        )}
      </section>

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
