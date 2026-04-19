"use client";

import { useState } from "react";
import {
  type Story,
  type StoryPriority,
  type StoryStatus,
  STORY_STATUS_LABELS,
  STORY_PRIORITY_LABELS,
} from "../lib/stories";
import type { User } from "../lib/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const selectClass = cn(
  "flex h-8 w-full max-w-[180px] min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "dark:bg-input/30"
);

const STATUSES: StoryStatus[] = ["todo", "doing", "done"];
const PRIORITIES: StoryPriority[] = ["niski", "średni", "wysoki"];

const PRIORITY_ORDER: Record<StoryPriority, number> = {
  wysoki: 0,
  średni: 1,
  niski: 2,
};

function sortByPriority(stories: Story[]): Story[] {
  return [...stories].sort(
    (a, b) => PRIORITY_ORDER[a.priorytet] - PRIORITY_ORDER[b.priorytet]
  );
}

type Props = {
  projectId: string;
  projectTitle: string;
  stories: Story[];
  currentUser: User;
  usersById: Map<string, User>;
  onStoriesChange: () => void;
  onCreateStory: (
    nazwa: string,
    opis: string,
    priorytet: StoryPriority
  ) => void;
  onUpdateStoryStatus: (storyId: string, stan: StoryStatus) => void;
  onUpdateStory: (
    storyId: string,
    patch: Partial<Pick<Story, "nazwa" | "opis" | "priorytet">>
  ) => void;
  onDeleteStory: (storyId: string) => void;
};

export function StoriesSection({
  projectId,
  projectTitle,
  stories,
  currentUser,
  usersById,
  onStoriesChange,
  onCreateStory,
  onUpdateStoryStatus,
  onUpdateStory,
  onDeleteStory,
}: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [addNazwa, setAddNazwa] = useState("");
  const [addOpis, setAddOpis] = useState("");
  const [addPriorytet, setAddPriorytet] = useState<StoryPriority>("średni");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNazwa, setEditNazwa] = useState("");
  const [editOpis, setEditOpis] = useState("");
  const [editPriorytet, setEditPriorytet] = useState<StoryPriority>("średni");

  const todo = sortByPriority(stories.filter((s) => s.stan === "todo"));
  const doing = sortByPriority(stories.filter((s) => s.stan === "doing"));
  const done = sortByPriority(stories.filter((s) => s.stan === "done"));

  function handleAdd() {
    const n = addNazwa.trim();
    if (!n) return;
    onCreateStory(n, addOpis.trim(), addPriorytet);
    setAddNazwa("");
    setAddOpis("");
    setAddPriorytet("średni");
    setAddOpen(false);
    onStoriesChange();
  }

  function startEdit(s: Story) {
    setEditingId(s.id);
    setEditNazwa(s.nazwa);
    setEditOpis(s.opis);
    setEditPriorytet(s.priorytet);
  }

  function saveEdit() {
    if (!editingId) return;
    const n = editNazwa.trim();
    if (!n) return;
    onUpdateStory(editingId, {
      nazwa: n,
      opis: editOpis.trim(),
      priorytet: editPriorytet,
    });
    setEditingId(null);
    onStoriesChange();
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function ownerName(ownerId: string): string {
    const u = usersById.get(ownerId);
    return u ? `${u.firstName} ${u.lastName}` : "—";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">
          Historyjki: {projectTitle}
        </h2>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          + Dodaj historyjkę
        </Button>
      </div>

      {addOpen && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4">
          <h3 className="text-sm font-medium text-foreground">
            Nowa historyjka
          </h3>
          <Input
            placeholder="Nazwa"
            value={addNazwa}
            onChange={(e) => setAddNazwa(e.target.value)}
          />
          <Textarea
            placeholder="Opis"
            value={addOpis}
            onChange={(e) => setAddOpis(e.target.value)}
            rows={2}
          />
          <select
            value={addPriorytet}
            onChange={(e) => setAddPriorytet(e.target.value as StoryPriority)}
            className={selectClass}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {STORY_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Właściciel: {currentUser.firstName} {currentUser.lastName}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setAddOpen(false)}>
              Anuluj
            </Button>
            <Button size="sm" onClick={handleAdd}>
              Dodaj
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUSES.map((status) => {
          const list =
            status === "todo" ? todo : status === "doing" ? doing : done;
          return (
            <div
              key={status}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="border-b border-border bg-muted/60 px-3 py-2 text-sm font-medium text-foreground">
                {STORY_STATUS_LABELS[status]}
              </div>
              <div className="p-2 space-y-2 min-h-[80px]">
                {list.map((s) =>
                  editingId === s.id ? (
                    <div
                      key={s.id}
                      className="space-y-2 rounded-lg border border-primary/30 bg-accent/40 p-3"
                    >
                      <Input
                        value={editNazwa}
                        onChange={(e) => setEditNazwa(e.target.value)}
                        autoFocus
                      />
                      <Textarea
                        value={editOpis}
                        onChange={(e) => setEditOpis(e.target.value)}
                        rows={2}
                      />
                      <select
                        value={editPriorytet}
                        onChange={(e) =>
                          setEditPriorytet(e.target.value as StoryPriority)
                        }
                        className={cn(selectClass, "max-w-none")}
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {STORY_PRIORITY_LABELS[p]}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>
                          Zapisz
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit}>
                          Anuluj
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={s.id}
                      className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40"
                    >
                      <div className="text-sm font-medium text-foreground">
                        {s.nazwa}
                      </div>
                      {s.opis ? (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {s.opis}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
                        <span className="text-xs text-muted-foreground">
                          {STORY_PRIORITY_LABELS[s.priorytet]} ·{" "}
                          {ownerName(s.ownerId)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {STATUSES.filter((st) => st !== s.stan).map((st) => (
                          <Button
                            key={st}
                            size="xs"
                            variant="ghost"
                            className="h-7 px-2 text-[0.7rem]"
                            onClick={() => {
                              onUpdateStoryStatus(s.id, st);
                              onStoriesChange();
                            }}
                          >
                            → {STORY_STATUS_LABELS[st]}
                          </Button>
                        ))}
                        <Button
                          size="xs"
                          variant="ghost"
                          className="h-7 px-2 text-[0.7rem]"
                          onClick={() => startEdit(s)}
                        >
                          Edytuj
                        </Button>
                        <Button
                          size="xs"
                          variant="destructive"
                          className="h-7 px-2 text-[0.7rem]"
                          onClick={() => {
                            onDeleteStory(s.id);
                            onStoriesChange();
                          }}
                        >
                          Usuń
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
