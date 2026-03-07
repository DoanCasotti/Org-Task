import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { TaskCard } from './TaskCard';
import { NewTaskDialog } from './NewTaskDialog';
import { TaskStatus, TaskPriority } from '@/../../shared/types';

interface MainContentProps {
  selectedProjectId: string | null;
}

export function MainContent({ selectedProjectId }: MainContentProps) {
  const { projects, getProjectTasks, tasks } = useApp();
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');

  const project = projects.find((p) => p.id === selectedProjectId);
  const projectTasks = selectedProjectId ? getProjectTasks(selectedProjectId) : tasks;

  const filteredTasks = useMemo(() => {
    return projectTasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projectTasks, searchQuery, statusFilter, priorityFilter]);

  const stats = {
    total: projectTasks.length,
    completed: projectTasks.filter((t) => t.status === 'completed').length,
    pending: projectTasks.filter((t) => t.status === 'pending').length,
    inProgress: projectTasks.filter((t) => t.status === 'in-progress').length,
  };

  return (
    <>
      <div className="flex-1 flex flex-col bg-white min-h-0">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="min-w-0">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                {project ? project.name : 'Todas as Tarefas'}
              </h2>
              {project?.description && (
                <p className="text-sm text-gray-600 mt-1 truncate">{project.description}</p>
              )}
            </div>
            <Button
              onClick={() => setIsNewTaskOpen(true)}
              className="text-white shrink-0"
              style={{ backgroundColor: '#07477c' }}
            >
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Nova Tarefa</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <div className="bg-gray-50 rounded-lg p-2 md:p-3">
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2 md:p-3">
              <p className="text-xs text-yellow-600">Pendentes</p>
              <p className="text-lg md:text-xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 md:p-3">
              <p className="text-xs text-blue-600">Em Progresso</p>
              <p className="text-lg md:text-xl font-bold text-blue-700">{stats.inProgress}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2 md:p-3">
              <p className="text-xs text-green-600">Concluídas</p>
              <p className="text-lg md:text-xl font-bold text-green-700">{stats.completed}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in-progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
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
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma tarefa encontrada</h3>
              <p className="text-sm text-gray-600">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Tente ajustar seus filtros'
                  : 'Crie uma nova tarefa para começar'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>

      <NewTaskDialog
        projectId={selectedProjectId}
        open={isNewTaskOpen}
        onOpenChange={setIsNewTaskOpen}
      />
    </>
  );
}
