import { Task, TaskStatus, TaskPriority } from "@shared/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, AlertCircle, Calendar } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
}

const priorityConfig: Record<
  TaskPriority,
  { label: string; color: string; bgColor: string }
> = {
  low: { label: "Baixa", color: "text-gray-600", bgColor: "bg-gray-100" },
  medium: {
    label: "Média",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  high: { label: "Alta", color: "text-red-600", bgColor: "bg-red-100" },
};

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const isOverdue =
    task.due_date &&
    isPast(new Date(task.due_date)) &&
    !isToday(new Date(task.due_date)) &&
    task.status !== "done";
  const assignee = task.profiles;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow duration-200 group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3
          className={`font-medium text-sm leading-tight flex-1 ${
            task.status === "done"
              ? "text-gray-400 line-through"
              : "text-gray-900"
          }`}
        >
          {task.title}
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="md:opacity-0 md:group-hover:opacity-100 transition-opacity h-6 w-6 p-0 shrink-0"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onStatusChange("todo")}
              className={task.status === "todo" ? "bg-gray-100" : ""}
            >
              A Fazer
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusChange("in_progress")}
              className={task.status === "in_progress" ? "bg-gray-100" : ""}
            >
              Em Progresso
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusChange("done")}
              className={task.status === "done" ? "bg-gray-100" : ""}
            >
              Concluído
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Deletar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${priority.bgColor} ${priority.color}`}
          >
            {task.priority === "high" && <AlertCircle className="w-3 h-3" />}
            {priority.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {task.due_date && (
            <span
              className={`inline-flex items-center gap-1 text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-500"}`}
            >
              <Calendar className="w-3 h-3" />
              {format(new Date(task.due_date), "dd MMM", { locale: ptBR })}
            </span>
          )}
          {assignee && (
            <div
              className="flex items-center gap-1"
              title={assignee.username || ""}
            >
              {assignee.avatar_url ? (
                <img
                  src={assignee.avatar_url}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#07477c]/10 flex items-center justify-center text-[10px] font-medium text-[#07477c]">
                  {(assignee.username || "?")[0].toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
