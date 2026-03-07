import { Button } from "@/components/ui/button";
import {
  Plus,
  FolderOpen,
  Trash2,
  LogOut,
  Calendar,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { NewProjectDialog } from "./NewProjectDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Project } from "@shared/types";

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onDeleteProject: (id: string) => void;
  onCreateProject: (data: {
    name: string;
    description?: string;
    color: string;
  }) => void;
  view: "kanban" | "calendar";
  onViewChange: (view: "kanban" | "calendar") => void;
  taskCounts: Record<string, { total: number; completed: number }>;
}

export function Sidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onDeleteProject,
  onCreateProject,
  view,
  onViewChange,
  taskCounts,
}: SidebarProps) {
  const { profile, signOut } = useAuth();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  return (
    <>
      <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-screen">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <img src="/favicon.icon.png" alt="Logo" className="w-8 h-8" />
            <h1 className="text-xl font-bold text-gray-900">Task Manager</h1>
          </div>
          <Button
            onClick={() => setIsNewProjectOpen(true)}
            className="w-full text-white"
            style={{ backgroundColor: "#07477c" }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Projeto
          </Button>
        </div>

        {/* View toggle */}
        <div className="px-3 pt-3 flex gap-1">
          <button
            onClick={() => onViewChange("kanban")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "kanban"
                ? "bg-[#07477c]/10 text-[#07477c]"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Kanban
          </button>
          <button
            onClick={() => onViewChange("calendar")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "calendar"
                ? "bg-[#07477c]/10 text-[#07477c]"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Calendário
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-3 space-y-1">
            <button
              onClick={() => onSelectProject(null)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                selectedProjectId === null
                  ? "bg-[#07477c]/10 text-[#07477c]"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Todos os Projetos</span>
            </button>

            {projects.map(project => {
              const counts = taskCounts[project.id] || {
                total: 0,
                completed: 0,
              };
              const pct =
                counts.total > 0
                  ? Math.round((counts.completed / counts.total) * 100)
                  : 0;
              return (
                <div
                  key={project.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    selectedProjectId === project.id
                      ? "bg-[#07477c]/10"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <button
                    onClick={() => onSelectProject(project.id)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${selectedProjectId === project.id ? "text-[#07477c]" : "text-gray-700"}`}
                      >
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {counts.completed}/{counts.total} • {pct}%
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => onDeleteProject(project.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                    title="Deletar projeto"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#07477c]/10 flex items-center justify-center text-sm font-medium text-[#07477c]">
                {(profile?.username || "?")[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {profile?.username || "Usuário"}
              </p>
            </div>
            <button
              onClick={signOut}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="Sair"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </aside>

      <NewProjectDialog
        open={isNewProjectOpen}
        onOpenChange={setIsNewProjectOpen}
        onSubmit={onCreateProject}
      />
    </>
  );
}
