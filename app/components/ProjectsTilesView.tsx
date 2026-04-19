"use client";

import type { Project } from "../lib/projects";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export function ProjectsTilesView({
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
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
      {projects.map((p) =>
        editingId === p.id ? (
          <Card key={p.id} className="gap-3 py-4">
            <CardContent className="flex flex-col gap-3 px-4">
              <Input
                value={editTitle}
                onChange={(e) => onEditTitle(e.target.value)}
                autoFocus
              />
              <Textarea
                value={editDescription}
                onChange={(e) => onEditDescription(e.target.value)}
                rows={3}
                className="min-h-[60px]"
              />
            </CardContent>
            <CardFooter className="flex gap-2 border-t px-4 pt-3">
              <Button size="sm" onClick={onSaveEdit}>
                Zapisz
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancelEdit}>
                Anuluj
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card
            key={p.id}
            className={cn(
              "gap-3 py-4 transition-shadow hover:shadow-md",
              activeProjectId === p.id &&
                "ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
            )}
          >
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-base leading-tight">{p.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-0">
              {p.description ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              ) : null}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 border-t px-4 pt-3">
              <Button
                size="sm"
                variant={
                  activeProjectId === p.id ? "secondary" : "ghost"
                }
                onClick={() => onSetActiveProject(p.id)}
              >
                {activeProjectId === p.id ? "Aktywny" : "Ustaw jako aktywny"}
              </Button>
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
            </CardFooter>
          </Card>
        )
      )}
    </div>
  );
}
