import { createContext, useContext, ReactNode } from 'react';
import { Project, Task, TaskStatus, TaskPriority } from '@/../../shared/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { nanoid } from 'nanoid';

interface AppContextType {
  projects: Project[];
  tasks: Task[];
  addProject: (name: string, description?: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (projectId: string, title: string, priority?: TaskPriority) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (tasks: Task[]) => void;
  getProjectTasks: (projectId: string) => Task[];
  getTaskStats: (projectId: string) => { total: number; completed: number; pending: number; inProgress: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useLocalStorage<Project[]>('app-projects', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('app-tasks', []);

  const addProject = (name: string, description?: string) => {
    const newProject: Project = {
      id: nanoid(),
      name,
      description,
      color: '#FF6B35',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      taskCount: 0,
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(
      projects.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    setTasks(tasks.filter((t) => t.projectId !== id));
  };

  const addTask = (projectId: string, title: string, priority: TaskPriority = 'medium') => {
    const newTask: Task = {
      id: nanoid(),
      projectId,
      title,
      status: 'pending',
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: tasks.filter((t) => t.projectId === projectId).length,
    };
    setTasks([...tasks, newTask]);
    
    // Update project task count
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    updateProject(projectId, { taskCount: projectTasks.length + 1 });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const deleteTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setTasks(tasks.filter((t) => t.id !== id));
      const projectTasks = tasks.filter((t) => t.projectId === task.projectId && t.id !== id);
      updateProject(task.projectId, { taskCount: projectTasks.length });
    }
  };

  const reorderTasks = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
  };

  const getProjectTasks = (projectId: string) => {
    return tasks
      .filter((t) => t.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  };

  const getTaskStats = (projectId: string) => {
    const projectTasks = getProjectTasks(projectId);
    return {
      total: projectTasks.length,
      completed: projectTasks.filter((t) => t.status === 'completed').length,
      pending: projectTasks.filter((t) => t.status === 'pending').length,
      inProgress: projectTasks.filter((t) => t.status === 'in-progress').length,
    };
  };

  return (
    <AppContext.Provider
      value={{
        projects,
        tasks,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        reorderTasks,
        getProjectTasks,
        getTaskStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
