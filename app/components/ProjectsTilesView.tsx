"use client";

import type { Project } from "../lib/projects";

const inputBase =
  "w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-[0.9375rem] outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";
const inputSm = "px-3 py-2 text-sm";
const btnBase =
  "rounded-lg font-medium cursor-pointer border-none transition-colors";
const btnSm = "py-1.5 px-3 text-[0.8125rem]";
const btnPrimary = "bg-indigo-500 text-white hover:bg-indigo-400";
const btnGhost =
  "bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100";
const btnDanger =
  "bg-transparent text-red-600 hover:bg-red-50 hover:text-red-700";

type Props = {
  projects: Project[];
  activeProjectId: string | null;
  editingId: string | null;
  editTitle: string;
  editDescription: string;
  onEditTitle: (value: string) => void;
  onEditDescription: (value: string) => void;
  onStartEdit: (p: Project) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onSetActiveProject: (projectId: string) => void;
};

export function ProjectsTilesView({
  projects,
  activeProjectId,
  editingId,
  editTitle,
  editDescription,
  onEditTitle,
  onEditDescription,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onSetActiveProject,
}: Props) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
      {projects.map((p) =>
        editingId === p.id ? (
          <div
            key={p.id}
            className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col gap-3.5"
          >
            <input
              type="text"
              value={editTitle}
              onChange={(e) => onEditTitle(e.target.value)}
              className={`${inputBase} ${inputSm}`}
              autoFocus
            />
            <textarea
              value={editDescription}
              onChange={(e) => onEditDescription(e.target.value)}
              rows={3}
              className={`${inputBase} ${inputSm} resize-y min-h-[60px]`}
            />
            <div className="flex gap-2 mt-auto pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={onSaveEdit}
                className={`${btnBase} ${btnSm} ${btnPrimary}`}
              >
                Zapisz
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className={`${btnBase} ${btnSm} ${btnGhost}`}
              >
                Anuluj
              </button>
            </div>
          </div>
        ) : (
          <div
            key={p.id}
            className={`bg-white border rounded-xl p-5 flex flex-col gap-3 transition-colors hover:border-zinc-300 hover:shadow-lg ${
              activeProjectId === p.id
                ? "border-indigo-500 ring-2 ring-indigo-500/20"
                : "border-zinc-200"
            }`}
          >
            <h2 className="text-[1.0625rem] font-semibold tracking-tight m-0 leading-tight">
              {p.title}
            </h2>
            {p.description ? (
              <p className="text-sm text-zinc-600 m-0 leading-relaxed flex-1">
                {p.description}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => onSetActiveProject(p.id)}
                className={`${btnBase} ${btnSm} ${
                  activeProjectId === p.id
                    ? "bg-indigo-100 text-indigo-700"
                    : btnGhost
                }`}
              >
                {activeProjectId === p.id ? "Aktywny" : "Ustaw jako aktywny"}
              </button>
              <button
                type="button"
                onClick={() => onStartEdit(p)}
                className={`${btnBase} ${btnSm} ${btnGhost}`}
              >
                Edytuj
              </button>
              <button
                type="button"
                onClick={() => onDelete(p.id)}
                className={`${btnBase} ${btnSm} ${btnDanger}`}
              >
                Usuń
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
