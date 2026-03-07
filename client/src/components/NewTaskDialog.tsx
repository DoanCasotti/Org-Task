import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskPriority, Project, Profile } from "@shared/types";
import { useState, useEffect } from "react";

interface NewTaskDialogProps {
  projectId: string | null;
  projects: Project[];
  members: Profile[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    project_id: string;
    title: string;
    priority: TaskPriority;
    description?: string;
    due_date?: string;
    assigned_to?: string;
  }) => void;
}

export function NewTaskDialog({
  projectId,
  projects,
  members,
  open,
  onOpenChange,
  onSubmit,
}: NewTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedProjectId(projectId || "");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setAssignedTo("");
    }
  }, [open, projectId]);

  const handleCreate = () => {
    if (title.trim() && selectedProjectId) {
      onSubmit({
        project_id: selectedProjectId,
        title: title.trim(),
        priority,
        description: description.trim() || undefined,
        due_date: dueDate || undefined,
        assigned_to: assignedTo || undefined,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>
            Adicione uma nova tarefa ao projeto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="project">Projeto</Label>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="taskTitle">Título</Label>
            <Input
              id="taskTitle"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="O que precisa ser feito?"
              className="mt-1"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="taskDesc">Descrição (opcional)</Label>
            <Input
              id="taskDesc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalhes adicionais"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Prioridade</Label>
              <Select
                value={priority}
                onValueChange={v => setPriority(v as TaskPriority)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data de Vencimento</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {members.length > 0 && (
            <div>
              <Label>Atribuir a</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Ninguém" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguém</SelectItem>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.username || m.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || !selectedProjectId}
            className="bg-[#07477c]/80 hover:bg-[#07477c] text-white disabled:opacity-50"
          >
            Criar Tarefa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
