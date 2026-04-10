import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Users } from "lucide-react";
import { useState, useMemo } from "react";
import { KanbanBoard } from "./KanbanBoard";
import { CalendarView } from "./CalendarView";
import { NewTaskDialog } from "./NewTaskDialog";
import { TaskDetailModal } from "./TaskDetailModal";
import { ManageMembersDialog } from "./ManageMembersDialog";
import {
  Task,
  TaskStatus,
  TaskPriority,
  Project,
  Profile,
  ProjectMember,
} from "@shared/types";

interface MainContentProps {
  selectedProjectId: string | null;
  projects: Project[];
  tasks: Task[];
  members: Profile[];
  rawMembers: ProjectMember[];
  view: "kanban" | "calendar";
  onAddTask: (data: {
    project_id: string;
    title: string;
    priority: TaskPriority;
    description?: string;
    due_date?: string;
    assigned_to?: string;
  }) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (
    tasks: { id: string; status: TaskStatus; order: number }[]
  ) => void;
  onAddMember: (data: { userId: string; role?: string }) => void;
  onRemoveMember: (memberId: string) => void;
  isProjectOwner?: boolean;
}

export function MainContent({
  selectedProjectId,
  projects,
  tasks,
  members,
  rawMembers,
  view,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
  onAddMember,
  onRemoveMember,
  isProjectOwner = false,
}: MainContentProps) {
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">(
    "all"
  );

  const project = projects.find(p => p.id === selectedProjectId);
  const projectTasks = selectedProjectId
    ? tasks.filter(t => t.project_id === selectedProjectId)
    : tasks;

  const filteredTasks = useMemo(() => {
    return projectTasks.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false);
      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [projectTasks, searchQuery, priorityFilter]);

  const stats = {
    total: projectTasks.length,
    done: projectTasks.filter(t => t.status === "done").length,
    todo: projectTasks.filter(t => t.status === "todo").length,
    inProgress: projectTasks.filter(t => t.status === "in_progress").length,
  };

  return (
    <>
      <div className="flex-1 flex flex-col bg-white min-h-0">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="min-w-0">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                {project ? project.name : "Todos os Projetos"}
              </h2>
              {project?.description && (
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {project.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selectedProjectId && (
                <Button
                  variant="outline"
                  onClick={() => setIsMembersOpen(true)}
                  className="border-[#07477c]/30 text-[#07477c]"
                >
                  <Users className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Membros</span>
                </Button>
              )}
              <Button
                onClick={() => setIsNewTaskOpen(true)}
                className="text-white"
                style={{ backgroundColor: "#07477c" }}
              >
                <Plus className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Nova Tarefa</span>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <div className="bg-gray-50 rounded-lg p-2 md:p-3">
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">
                {stats.total}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2 md:p-3">
              <p className="text-xs text-yellow-600">A Fazer</p>
              <p className="text-lg md:text-xl font-bold text-yellow-700">
                {stats.todo}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 md:p-3">
              <p className="text-xs text-blue-600">Em Progresso</p>
              <p className="text-lg md:text-xl font-bold text-blue-700">
                {stats.inProgress}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-2 md:p-3">
              <p className="text-xs text-green-600">Concluídas</p>
              <p className="text-lg md:text-xl font-bold text-green-700">
                {stats.done}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200 px-4 md:px-6 py-3 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={priorityFilter}
              onValueChange={v => setPriorityFilter(v as TaskPriority | "all")}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Prioridades</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {view === "kanban" ? (
            <KanbanBoard
              tasks={filteredTasks}
              onReorder={onReorderTasks}
              onEditTask={task => setEditingTask(task)}
              onDeleteTask={onDeleteTask}
              onStatusChange={(id, status) => onUpdateTask(id, { status })}
              isProjectOwner={isProjectOwner}
            />
          ) : (
            <CalendarView
              tasks={filteredTasks}
              onTaskClick={task => setEditingTask(task)}
            />
          )}
        </div>
      </div>

      <NewTaskDialog
        projectId={selectedProjectId}
        projects={projects}
        members={members}
        open={isNewTaskOpen}
        onOpenChange={setIsNewTaskOpen}
        onSubmit={onAddTask}
      />

      <TaskDetailModal
        task={editingTask}
        open={!!editingTask}
        onOpenChange={open => { if (!open) setEditingTask(null); }}
        members={members}
        projects={projects}
      />

      {selectedProjectId && (
        <ManageMembersDialog
          open={isMembersOpen}
          onOpenChange={setIsMembersOpen}
          members={rawMembers}
          onAddMember={onAddMember}
          onRemoveMember={onRemoveMember}
        />
      )}
    </>
  );
}
