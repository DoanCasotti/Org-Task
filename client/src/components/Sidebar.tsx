import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { NewProjectDialog } from './NewProjectDialog';

interface SidebarProps {
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
}

export function Sidebar({ selectedProjectId, onSelectProject }: SidebarProps) {
  const { projects, deleteProject, getTaskStats } = useApp();
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
            style={{ backgroundColor: '#07477c' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Projeto
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-3 space-y-1">
            <button
              onClick={() => onSelectProject(null)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                selectedProjectId === null
                  ? 'bg-[#07477c]/10 text-[#07477c]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Todas as Tarefas</span>
            </button>

            {projects.map((project) => {
              const stats = getTaskStats(project.id);
              const completedPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

              return (
                <div
                  key={project.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    selectedProjectId === project.id
                      ? 'bg-[#07477c]/10'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <button
                    onClick={() => onSelectProject(project.id)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        selectedProjectId === project.id
                          ? 'text-[#07477c]'
                          : 'text-gray-700'
                      }`}>
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {stats.completed}/{stats.total} • {completedPercent}%
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => deleteProject(project.id)}
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

        <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Total de projetos: {projects.length}</p>
        </div>
      </aside>

      <NewProjectDialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen} />
    </>
  );
}
