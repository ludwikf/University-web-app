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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-zinc-800">
          Historyjki: {projectTitle}
        </h2>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className={`${btnBase} ${btnSm} ${btnPrimary}`}
        >
          + Dodaj historyjkę
        </button>
      </div>

      {addOpen && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-sm font-medium text-zinc-700">Nowa historyjka</h3>
          <input
            type="text"
            placeholder="Nazwa"
            value={addNazwa}
            onChange={(e) => setAddNazwa(e.target.value)}
            className={`${inputBase} ${inputSm}`}
          />
          <textarea
            placeholder="Opis"
            value={addOpis}
            onChange={(e) => setAddOpis(e.target.value)}
            rows={2}
            className={`${inputBase} ${inputSm} resize-y`}
          />
          <select
            value={addPriorytet}
            onChange={(e) => setAddPriorytet(e.target.value as StoryPriority)}
            className={`${inputBase} ${inputSm} max-w-[180px]`}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {STORY_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-500">
            Właściciel: {currentUser.firstName} {currentUser.lastName}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
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
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUSES.map((status) => {
          const list =
            status === "todo" ? todo : status === "doing" ? doing : done;
          return (
            <div
              key={status}
              className="bg-white border border-zinc-200 rounded-xl overflow-hidden"
            >
              <div className="px-3 py-2 bg-zinc-100 border-b border-zinc-200 text-sm font-medium text-zinc-700">
                {STORY_STATUS_LABELS[status]}
              </div>
              <div className="p-2 space-y-2 min-h-[80px]">
                {list.map((s) =>
                  editingId === s.id ? (
                    <div
                      key={s.id}
                      className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-200 space-y-2"
                    >
                      <input
                        type="text"
                        value={editNazwa}
                        onChange={(e) => setEditNazwa(e.target.value)}
                        className={`${inputBase} ${inputSm}`}
                        autoFocus
                      />
                      <textarea
                        value={editOpis}
                        onChange={(e) => setEditOpis(e.target.value)}
                        rows={2}
                        className={`${inputBase} ${inputSm} resize-y`}
                      />
                      <select
                        value={editPriorytet}
                        onChange={(e) =>
                          setEditPriorytet(e.target.value as StoryPriority)
                        }
                        className={`${inputBase} ${inputSm}`}
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {STORY_PRIORITY_LABELS[p]}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
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
                      key={s.id}
                      className="p-3 border border-zinc-200 rounded-lg hover:border-zinc-300 bg-white"
                    >
                      <div className="font-medium text-zinc-900 text-sm">
                        {s.nazwa}
                      </div>
                      {s.opis ? (
                        <p className="text-xs text-zinc-600 mt-1 line-clamp-2">
                          {s.opis}
                        </p>
                      ) : null}
                      <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
                        <span className="text-xs text-zinc-500">
                          {STORY_PRIORITY_LABELS[s.priorytet]} ·{" "}
                          {ownerName(s.ownerId)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {STATUSES.filter((st) => st !== s.stan).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              onUpdateStoryStatus(s.id, st);
                              onStoriesChange();
                            }}
                            className={`${btnBase} text-[0.7rem] px-2 py-1 ${btnGhost}`}
                          >
                            → {STORY_STATUS_LABELS[st]}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => startEdit(s)}
                          className={`${btnBase} text-[0.7rem] px-2 py-1 ${btnGhost}`}
                        >
                          Edytuj
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteStory(s.id);
                            onStoriesChange();
                          }}
                          className={`${btnBase} text-[0.7rem] px-2 py-1 ${btnDanger}`}
                        >
                          Usuń
                        </button>
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
