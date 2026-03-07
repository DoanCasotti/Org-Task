import { Task, TaskStatus, TaskPriority } from '@/../../shared/types';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { CheckCircle2, Circle, Clock, Trash2, MoreVertical, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { EditTaskDialog } from './EditTaskDialog';

interface TaskCardProps {
  task: Task;
}

const statusConfig: Record<TaskStatus, { icon: React.ReactNode; label: string; color: string }> = {
  pending: { icon: <Circle className="w-4 h-4" />, label: 'Pendente', color: 'text-yellow-600' },
  'in-progress': { icon: <Clock className="w-4 h-4" />, label: 'Em Progresso', color: 'text-blue-600' },
  completed: { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Concluído', color: 'text-green-600' },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Baixa', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  medium: { label: 'Média', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  high: { label: 'Alta', color: 'text-red-600', bgColor: 'bg-red-100' },
};

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, deleteTask } = useApp();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTask(task.id, { status: newStatus });
  };

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    pending: 'in-progress',
    'in-progress': 'completed',
    completed: 'pending',
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const getPriorityIcon = () => {
    if (task.priority === 'high') {
      return <AlertCircle className="w-3 h-3" />;
    }
    return null;
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 group">
        <div className="flex items-start justify-between gap-3 mb-3">
          <button
            onClick={() => {
              const nextStatus: Record<TaskStatus, TaskStatus> = {
                pending: 'in-progress',
                'in-progress': 'completed',
                completed: 'pending',
              };
              handleStatusChange(nextStatus[task.status]);
            }}
            className={`flex-shrink-0 mt-1 transition-colors duration-200 ${status.color} hover:opacity-70`}
            title="Clique para mudar status"
          >
            {status.icon}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium text-sm leading-tight ${
                task.status === 'completed'
                  ? 'text-gray-400 line-through'
                  : 'text-gray-900'
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:opacity-0 md:group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusChange('pending')}
                className={task.status === 'pending' ? 'bg-gray-100' : ''}
              >
                Pendente
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange('in-progress')}
                className={task.status === 'in-progress' ? 'bg-gray-100' : ''}
              >
                Em Progresso
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange('completed')}
                className={task.status === 'completed' ? 'bg-gray-100' : ''}
              >
                Concluído
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${priority.bgColor} ${priority.color}`}>
              {getPriorityIcon()}
              {priority.label}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600`}>
              {status.label}
            </span>
          </div>
          {task.dueDate && (
            <span className="text-xs text-gray-500">
              {new Date(task.dueDate).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </div>

      <EditTaskDialog
        task={task}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
}
