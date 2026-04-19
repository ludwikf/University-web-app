"use client";

import { useEffect, useState } from "react";
import type { Task } from "../lib/tasks";
import { TASK_STATUS_LABELS } from "../lib/tasks";
import type { Story } from "../lib/stories";
import { STORY_PRIORITY_LABELS } from "../lib/stories";
import type { StoryPriority } from "../lib/stories";
import type { User } from "../lib/user";
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

const PRIORITIES: StoryPriority[] = ["niski", "średni", "wysoki"];

const selectClass = cn(
  "flex h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
);

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

export function TaskDetailDialog({
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
}: Props) {
  const open = taskId !== null;
  const task = taskId ? (tasks.find((t) => t.id === taskId) ?? null) : null;
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        {task && (
          <>
            <DialogHeader className="shrink-0 border-b border-border px-5 py-4">
              <div className="flex items-start justify-between gap-2">
                <DialogTitle>Szczegóły zadania</DialogTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Zamknij
                </Button>
              </div>
            </DialogHeader>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="task-nazwa">Nazwa</Label>
                <Input
                  id="task-nazwa"
                  value={nazwa}
                  onChange={(e) => setNazwa(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-opis">Opis</Label>
                <Textarea
                  id="task-opis"
                  value={opis}
                  onChange={(e) => setOpis(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="task-priorytet">Priorytet</Label>
                  <select
                    id="task-priorytet"
                    value={priorytet}
                    onChange={(e) =>
                      setPriorytet(e.target.value as StoryPriority)
                    }
                    className={selectClass}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {STORY_PRIORITY_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task-est">Szac. czas (h)</Label>
                  <Input
                    id="task-est"
                    type="number"
                    min={0}
                    step={0.5}
                    value={estimatedHours}
                    onChange={(e) =>
                      setEstimatedHours(Number(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
              <Button size="sm" onClick={saveBasics}>
                Zapisz zmiany
              </Button>

              <Separator />

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Historyjka: </span>
                  <span className="font-medium">{story?.nazwa ?? "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Stan zadania: </span>
                  {TASK_STATUS_LABELS[task.stan]}
                </div>
                <div>
                  <span className="text-muted-foreground">Data dodania: </span>
                  {fmt(task.createdAt)}
                </div>
                <div>
                  <span className="text-muted-foreground">Data startu: </span>
                  {fmt(task.startedAt)}
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Data zakończenia:{" "}
                  </span>
                  {fmt(task.completedAt)}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-actual">Zrealizowane roboczogodziny</Label>
                <div className="flex flex-wrap gap-2">
                  <Input
                    id="task-actual"
                    type="number"
                    min={0}
                    step={0.25}
                    value={actualHours}
                    onChange={(e) =>
                      setActualHours(Number(e.target.value) || 0)
                    }
                    className="max-w-[120px]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={saveHours}
                  >
                    Zapisz godziny
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-assign">
                  Przypisz osobę (devops / developer)
                </Label>
                <div className="flex flex-wrap gap-2">
                  <select
                    id="task-assign"
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                    className={cn(selectClass, "min-w-[200px] flex-1")}
                  >
                    <option value="">— wybierz —</option>
                    {assignableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.role})
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={applyAssign}
                    disabled={!assignUserId || task.stan === "done"}
                  >
                    Przypisz
                  </Button>
                </div>
                {task.assigneeId && (
                  <p className="text-xs text-muted-foreground">
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
                <Button
                  size="sm"
                  onClick={onMarkDone}
                  disabled={!task.assigneeId || task.stan === "done"}
                >
                  Oznacz jako zakończone
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onDelete}
                >
                  Usuń zadanie
                </Button>
              </div>
            </div>
          </>
        )}
        {taskId && !task && (
          <div className="p-6">
            <p className="text-muted-foreground">Nie znaleziono zadania.</p>
            <Button className="mt-4" onClick={onClose}>
              Zamknij
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
