"use client";

import type { Task } from "../lib/tasks";
import { TASK_STATUS_LABELS } from "../lib/tasks";
import type { Story } from "../lib/stories";
import { STORY_PRIORITY_LABELS } from "../lib/stories";
import type { StoryPriority } from "../lib/stories";

const btnBase =
  "rounded-lg font-medium cursor-pointer border-none transition-colors";
const btnSm = "py-1.5 px-3 text-[0.8125rem]";
const btnPrimary = "bg-indigo-500 text-white hover:bg-indigo-400";
const PRIORITY_ORDER: Record<StoryPriority, number> = {
  wysoki: 0,
  średni: 1,
  niski: 2,
};

function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => PRIORITY_ORDER[a.priorytet] - PRIORITY_ORDER[b.priorytet]
  );
}

type Props = {
  tasks: Task[];
  stories: Story[];
  onSelectTask: (taskId: string) => void;
  onAddTask: () => void;
};

export function TasksKanban({
  tasks,
  stories,
  onSelectTask,
  onAddTask,
}: Props) {
  const storyTitle = (id: string) =>
    stories.find((s) => s.id === id)?.nazwa ?? "—";

  const todo = sortTasksByPriority(tasks.filter((t) => t.stan === "todo"));
  const doing = sortTasksByPriority(tasks.filter((t) => t.stan === "doing"));
  const done = sortTasksByPriority(tasks.filter((t) => t.stan === "done"));

  const cols = [
    { key: "todo" as const, list: todo },
    { key: "doing" as const, list: doing },
    { key: "done" as const, list: done },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-zinc-800">
          Tablica zadań (Kanban)
        </h2>
        <button
          type="button"
          onClick={onAddTask}
          className={`${btnBase} ${btnSm} ${btnPrimary}`}
        >
          + Dodaj zadanie
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cols.map(({ key, list }) => (
          <div
            key={key}
            className="bg-zinc-50 border border-zinc-200 rounded-xl min-h-[120px] flex flex-col"
          >
            <div className="px-3 py-2 border-b border-zinc-200 text-sm font-medium text-zinc-700">
              {TASK_STATUS_LABELS[key]}
            </div>
            <div className="p-2 space-y-2 flex-1">
              {list.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTask(t.id)}
                  className="w-full text-left p-3 rounded-lg border border-zinc-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-colors"
                >
                  <div className="font-medium text-zinc-900 text-sm">
                    {t.nazwa}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 line-clamp-1">
                    {storyTitle(t.historiaId)}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {STORY_PRIORITY_LABELS[t.priorytet]} · {t.estimatedHours} h
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
