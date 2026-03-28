"use client";

import { forwardRef, useEffect, useState } from "react";
import type { Task } from "../lib/tasks";
import { TASK_STATUS_LABELS } from "../lib/tasks";
import type { Story } from "../lib/stories";
import { STORY_PRIORITY_LABELS } from "../lib/stories";
import type { StoryPriority } from "../lib/stories";
import type { User } from "../lib/user";

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

const PRIORITIES: StoryPriority[] = ["niski", "średni", "wysoki"];

function fmt(ts: number | null): string {
  if (ts == null) return "—";
  return new Date(ts).toLocaleString("pl-PL");
}

type Props = {
  taskId: string | null;
  tasks: Task[];
  stories: Story[];
  usersById: Map<string, User>;
  assignableUsers: User[];
  onClose: () => void;
  onAssign: (user: User) => void;
  onMarkDone: () => void;
  onUpdateActualHours: (hours: number) => void;
  onUpdateTask: (
    patch: Partial<
      Pick<Task, "nazwa" | "opis" | "priorytet" | "estimatedHours">
    >
  ) => void;
  onDelete: () => void;
};

export const TaskDetailDialog = forwardRef<HTMLDialogElement, Props>(
  function TaskDetailDialog(
    {
      taskId,
      tasks,
      stories,
      usersById,
      assignableUsers,
      onClose,
      onAssign,
      onMarkDone,
      onUpdateActualHours,
      onUpdateTask,
      onDelete,
    },
    ref
  ) {
    const task = taskId ? tasks.find((t) => t.id === taskId) ?? null : null;
    const story = task
      ? stories.find((s) => s.id === task.historiaId) ?? null
      : null;

    const [nazwa, setNazwa] = useState("");
    const [opis, setOpis] = useState("");
    const [priorytet, setPriorytet] = useState<StoryPriority>("średni");
    const [estimatedHours, setEstimatedHours] = useState(0);
    const [actualHours, setActualHours] = useState(0);
    const [assignUserId, setAssignUserId] = useState("");

    useEffect(() => {
      if (!task) return;
      setNazwa(task.nazwa);
      setOpis(task.opis);
      setPriorytet(task.priorytet);
      setEstimatedHours(task.estimatedHours);
      setActualHours(task.actualHoursWorked);
      setAssignUserId(task.assigneeId ?? "");
    }, [task]);

    function saveBasics() {
      const n = nazwa.trim();
      if (!n || !task) return;
      onUpdateTask({
        nazwa: n,
        opis: opis.trim(),
        priorytet,
        estimatedHours,
      });
    }

    function saveHours() {
      onUpdateActualHours(actualHours);
    }

    function applyAssign() {
      const u = assignableUsers.find((x) => x.id === assignUserId);
      if (u) onAssign(u);
    }

    return (
      <dialog
        ref={ref}
        onCancel={onClose}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] rounded-xl border border-zinc-200 bg-white shadow-xl backdrop:bg-black/20 backdrop:backdrop-blur-sm overflow-hidden flex flex-col"
      >
        {task && (
          <>
            <div className="px-5 py-4 border-b border-zinc-200 flex justify-between items-start gap-2 shrink-0">
              <h2 className="text-lg font-semibold text-zinc-900">
                Szczegóły zadania
              </h2>
              <button
                type="button"
                onClick={onClose}
                className={`${btnBase} ${btnSm} ${btnGhost}`}
              >
                Zamknij
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto space-y-4 flex-1 min-h-0">
              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">
                  Nazwa
                </label>
                <input
                  type="text"
                  value={nazwa}
                  onChange={(e) => setNazwa(e.target.value)}
                  className={`${inputBase} ${inputSm}`}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">
                  Opis
                </label>
                <textarea
                  value={opis}
                  onChange={(e) => setOpis(e.target.value)}
                  rows={3}
                  className={`${inputBase} ${inputSm} resize-y`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-1">
                    Priorytet
                  </label>
                  <select
                    value={priorytet}
                    onChange={(e) =>
                      setPriorytet(e.target.value as StoryPriority)
                    }
                    className={`${inputBase} ${inputSm}`}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {STORY_PRIORITY_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-1">
                    Szac. czas (h)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={estimatedHours}
                    onChange={(e) =>
                      setEstimatedHours(Number(e.target.value) || 0)
                    }
                    className={`${inputBase} ${inputSm}`}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={saveBasics}
                className={`${btnBase} ${btnSm} ${btnPrimary}`}
              >
                Zapisz zmiany
              </button>

              <div className="border-t border-zinc-200 pt-4 space-y-2 text-sm">
                <div>
                  <span className="text-zinc-500">Historyjka: </span>
                  <span className="font-medium">{story?.nazwa ?? "—"}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Stan zadania: </span>
                  {TASK_STATUS_LABELS[task.stan]}
                </div>
                <div>
                  <span className="text-zinc-500">Data dodania: </span>
                  {fmt(task.createdAt)}
                </div>
                <div>
                  <span className="text-zinc-500">Data startu: </span>
                  {fmt(task.startedAt)}
                </div>
                <div>
                  <span className="text-zinc-500">Data zakończenia: </span>
                  {fmt(task.completedAt)}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">
                  Zrealizowane roboczogodziny
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    step={0.25}
                    value={actualHours}
                    onChange={(e) =>
                      setActualHours(Number(e.target.value) || 0)
                    }
                    className={`${inputBase} ${inputSm} max-w-[120px]`}
                  />
                  <button
                    type="button"
                    onClick={saveHours}
                    className={`${btnBase} ${btnSm} ${btnGhost}`}
                  >
                    Zapisz godziny
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">
                  Przypisz osobę (devops / developer)
                </label>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                    className={`${inputBase} ${inputSm} flex-1 min-w-[200px]`}
                  >
                    <option value="">— wybierz —</option>
                    {assignableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.role})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={applyAssign}
                    disabled={!assignUserId || task.stan === "done"}
                    className={`${btnBase} ${btnSm} ${btnPrimary} disabled:opacity-40`}
                  >
                    Przypisz
                  </button>
                </div>
                {task.assigneeId && (
                  <p className="text-xs text-zinc-600 mt-1">
                    Obecnie:{" "}
                    {(() => {
                      const u = usersById.get(task.assigneeId!);
                      return u
                        ? `${u.firstName} ${u.lastName} (${u.role})`
                        : task.assigneeId;
                    })()}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={onMarkDone}
                  disabled={!task.assigneeId || task.stan === "done"}
                  className={`${btnBase} ${btnSm} ${btnPrimary} disabled:opacity-40`}
                >
                  Oznacz jako zakończone
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className={`${btnBase} ${btnSm} ${btnDanger}`}
                >
                  Usuń zadanie
                </button>
              </div>
            </div>
          </>
        )}
        {taskId && !task && (
          <div className="p-6">
            <p className="text-zinc-600">Nie znaleziono zadania.</p>
            <button
              type="button"
              onClick={onClose}
              className={`${btnBase} ${btnSm} ${btnPrimary} mt-4`}
            >
              Zamknij
            </button>
          </div>
        )}
      </dialog>
    );
  }
);
