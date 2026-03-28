"use client";

import { useEffect, useRef, useState } from "react";
import type { Story } from "../lib/stories";
import { STORY_PRIORITY_LABELS } from "../lib/stories";
import type { StoryPriority } from "../lib/stories";

const inputBase =
  "w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-[0.9375rem] outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";
const inputSm = "px-3 py-2 text-sm";
const btnBase =
  "rounded-lg font-medium cursor-pointer border-none transition-colors";
const btnSm = "py-1.5 px-3 text-[0.8125rem]";
const btnPrimary = "bg-indigo-500 text-white hover:bg-indigo-400";
const btnGhost =
  "bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100";

const PRIORITIES: StoryPriority[] = ["niski", "średni", "wysoki"];

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
  const ref = useRef<HTMLDialogElement>(null);
  const [historiaId, setHistoriaId] = useState("");
  const [nazwa, setNazwa] = useState("");
  const [opis, setOpis] = useState("");
  const [priorytet, setPriorytet] = useState<StoryPriority>("średni");
  const [estimatedHours, setEstimatedHours] = useState(1);

  useEffect(() => {
    if (!ref.current) return;
    if (open) ref.current.showModal();
    else ref.current.close();
  }, [open]);

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
    <dialog
      ref={ref}
      onCancel={onClose}
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl backdrop:bg-black/20 backdrop:backdrop-blur-sm"
    >
      <h2 className="text-xl font-semibold tracking-tight mb-4">
        Nowe zadanie
      </h2>
      {stories.length === 0 ? (
        <p className="text-sm text-zinc-600 mb-4">
          Dodaj najpierw historyjkę w tym projekcie.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-500 block mb-1">
              Historyjka
            </label>
            <select
              value={historiaId}
              onChange={(e) => setHistoriaId(e.target.value)}
              className={`${inputBase} ${inputSm}`}
            >
              {stories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nazwa}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Nazwa zadania"
            value={nazwa}
            onChange={(e) => setNazwa(e.target.value)}
            className={inputBase}
          />
          <textarea
            placeholder="Opis"
            value={opis}
            onChange={(e) => setOpis(e.target.value)}
            rows={2}
            className={`${inputBase} resize-y`}
          />
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
                Przewidywany czas (h)
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
        </div>
      )}
      <div className="flex gap-2 justify-end pt-4">
        <button
          type="button"
          onClick={onClose}
          className={`${btnBase} ${btnSm} ${btnGhost}`}
        >
          Anuluj
        </button>
        {stories.length > 0 && (
          <button
            type="button"
            onClick={submit}
            className={`${btnBase} ${btnSm} ${btnPrimary}`}
          >
            Dodaj
          </button>
        )}
      </div>
    </dialog>
  );
}
