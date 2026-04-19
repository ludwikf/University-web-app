"use client";

import { useEffect, useState } from "react";
import type { Story } from "../lib/stories";
import { STORY_PRIORITY_LABELS } from "../lib/stories";
import type { StoryPriority } from "../lib/stories";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const PRIORITIES: StoryPriority[] = ["niski", "średni", "wysoki"];

const selectClass = cn(
  "flex h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
);

type Props = {
  open: boolean;
  stories: Story[];
  onClose: () => void;
  onCreate: (
    historiaId: string,
    nazwa: string,
    opis: string,
    priorytet: StoryPriority,
    estimatedHours: number
  ) => void;
};

export function AddTaskDialog({ open, stories, onClose, onCreate }: Props) {
  const [historiaId, setHistoriaId] = useState("");
  const [nazwa, setNazwa] = useState("");
  const [opis, setOpis] = useState("");
  const [priorytet, setPriorytet] = useState<StoryPriority>("średni");
  const [estimatedHours, setEstimatedHours] = useState(1);

  useEffect(() => {
    if (open && stories.length) {
      setHistoriaId(stories[0].id);
    }
  }, [open, stories]);

  function submit() {
    const n = nazwa.trim();
    if (!n || !historiaId) return;
    onCreate(historiaId, n, opis.trim(), priorytet, estimatedHours);
    setNazwa("");
    setOpis("");
    setPriorytet("średni");
    setEstimatedHours(1);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nowe zadanie</DialogTitle>
        </DialogHeader>
        {stories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Dodaj najpierw historyjkę w tym projekcie.
          </p>
        ) : (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="add-task-story">Historyjka</Label>
              <select
                id="add-task-story"
                value={historiaId}
                onChange={(e) => setHistoriaId(e.target.value)}
                className={selectClass}
              >
                {stories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nazwa}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-task-name">Nazwa zadania</Label>
              <Input
                id="add-task-name"
                placeholder="Nazwa zadania"
                value={nazwa}
                onChange={(e) => setNazwa(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-task-desc">Opis</Label>
              <Textarea
                id="add-task-desc"
                placeholder="Opis"
                value={opis}
                onChange={(e) => setOpis(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="add-task-pri">Priorytet</Label>
                <select
                  id="add-task-pri"
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
                <Label htmlFor="add-task-h">Przewidywany czas (h)</Label>
                <Input
                  id="add-task-h"
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
          </div>
        )}
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          {stories.length > 0 && (
            <Button onClick={submit}>Dodaj</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
