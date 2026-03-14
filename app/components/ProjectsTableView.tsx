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
  editingId: string | null;
  editTitle: string;
  editDescription: string;
  onEditTitle: (value: string) => void;
  onEditDescription: (value: string) => void;
  onStartEdit: (p: Project) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
};

export function ProjectsTableView({
  projects,
  editingId,
  editTitle,
  editDescription,
  onEditTitle,
  onEditDescription,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: Props) {
  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            <th className="px-4 py-3 text-sm font-semibold text-zinc-700">
              Tytuł
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-zinc-700">
              Opis
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-zinc-700 w-[140px]">
              Akcje
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) =>
            editingId === p.id ? (
              <tr
                key={p.id}
                className="border-b border-zinc-100 bg-indigo-50/30"
              >
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => onEditTitle(e.target.value)}
                    className={`${inputBase} ${inputSm}`}
                    autoFocus
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => onEditDescription(e.target.value)}
                    className={`${inputBase} ${inputSm}`}
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
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
                </td>
              </tr>
            ) : (
              <tr
                key={p.id}
                className="border-b border-zinc-100 hover:bg-zinc-50/80 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {p.title}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600 max-w-md">
                  {p.description || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
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
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
      {projects.length === 0 && (
        <div className="px-4 py-8 text-center text-zinc-500 text-sm">
          Brak projektów. Kliknij „Dodaj projekt”, aby dodać pierwszy.
        </div>
      )}
    </div>
  );
}
