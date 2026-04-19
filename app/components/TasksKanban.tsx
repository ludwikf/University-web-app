"use client";

import type { Task } from "../lib/tasks";
import { TASK_STATUS_LABELS } from "../lib/tasks";
import type { Story } from "../lib/stories";
import { STORY_PRIORITY_LABELS } from "../lib/stories";
import type { StoryPriority } from "../lib/stories";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">
          Tablica zadań (Kanban)
        </h2>
        <Button size="sm" onClick={onAddTask}>
          + Dodaj zadanie
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cols.map(({ key, list }) => (
          <div
            key={key}
            className="flex min-h-[120px] flex-col rounded-xl border border-border bg-muted/40"
          >
            <div className="border-b border-border px-3 py-2 text-sm font-medium text-foreground">
              {TASK_STATUS_LABELS[key]}
            </div>
            <div className="flex-1 space-y-2 p-2">
              {list.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTask(t.id)}
                  className={cn(
                    "w-full rounded-lg border border-border bg-card p-3 text-left transition-colors",
                    "hover:border-primary/50 hover:shadow-sm"
                  )}
                >
                  <div className="text-sm font-medium text-foreground">
                    {t.nazwa}
                  </div>
                  <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {storyTitle(t.historiaId)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground/80">
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
