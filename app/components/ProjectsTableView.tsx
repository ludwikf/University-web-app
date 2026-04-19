"use client";

import type { Project } from "../lib/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

export function ProjectsTableView({
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
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-sm font-semibold text-foreground">
              Tytuł
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-foreground">
              Opis
            </th>
            <th className="w-[100px] px-4 py-3 text-sm font-semibold text-foreground">
              Aktywny
            </th>
            <th className="w-[140px] px-4 py-3 text-sm font-semibold text-foreground">
              Akcje
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) =>
            editingId === p.id ? (
              <tr
                key={p.id}
                className="border-b border-border bg-accent/30"
              >
                <td className="px-4 py-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => onEditTitle(e.target.value)}
                    autoFocus
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={editDescription}
                    onChange={(e) => onEditDescription(e.target.value)}
                  />
                </td>
                <td className="px-4 py-2">—</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <Button size="sm" onClick={onSaveEdit}>
                      Zapisz
                    </Button>
                    <Button size="sm" variant="ghost" onClick={onCancelEdit}>
                      Anuluj
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr
                key={p.id}
                className={cn(
                  "border-b border-border transition-colors hover:bg-muted/50",
                  activeProjectId === p.id && "bg-accent/40"
                )}
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {p.title}
                </td>
                <td className="max-w-md px-4 py-3 text-sm text-muted-foreground">
                  {p.description || "—"}
                </td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant={
                      activeProjectId === p.id ? "secondary" : "ghost"
                    }
                    onClick={() => onSetActiveProject(p.id)}
                  >
                    {activeProjectId === p.id ? "Aktywny" : "Ustaw"}
                  </Button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onStartEdit(p)}
                    >
                      Edytuj
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(p.id)}
                    >
                      Usuń
                    </Button>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
      {projects.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          Brak projektów. Kliknij „Dodaj projekt”, aby dodać pierwszy.
        </div>
      )}
    </div>
  );
}
