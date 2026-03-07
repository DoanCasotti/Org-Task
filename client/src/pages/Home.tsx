import { useState, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MainContent } from "@/components/MainContent";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { useAuth } from "@/contexts/AuthContext";
import { Profile } from "@shared/types";

export default function Home() {
  const { user, uploadAvatar } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<"kanban" | "calendar">("kanban");

  const { projects, addProject, deleteProject } = useProjects();
  const { tasks, addTask, updateTask, deleteTask, reorderTasks } =
    useTasks(selectedProjectId);
  const { members, addMember, removeMember } =
    useProjectMembers(selectedProjectId);

  const memberProfiles: Profile[] = useMemo(() => {
    return members.map(m => m.profiles).filter((p): p is Profile => !!p);
  }, [members]);

  const taskCounts = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {};
    tasks.forEach(t => {
      if (!counts[t.project_id])
        counts[t.project_id] = { total: 0, completed: 0 };
      counts[t.project_id].total++;
      if (t.status === "done") counts[t.project_id].completed++;
    });
    return counts;
  }, [tasks]);

  // When viewing all projects, we need all tasks
  const allTasks = useTasks(null);
  const displayTasks = selectedProjectId ? tasks : allTasks.tasks;

  const allTaskCounts = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {};
    allTasks.tasks.forEach(t => {
      if (!counts[t.project_id])
        counts[t.project_id] = { total: 0, completed: 0 };
      counts[t.project_id].total++;
      if (t.status === "done") counts[t.project_id].completed++;
    });
    return counts;
  }, [allTasks.tasks]);

  const handleSelectProject = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-white relative">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProject}
          onDeleteProject={id => deleteProject.mutate(id)}
          onCreateProject={data => addProject.mutate(data)}
          view={view}
          onViewChange={setView}
          taskCounts={allTaskCounts}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 p-3 border-b border-gray-200 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <img src="/favicon.icon.png" alt="Logo" className="w-6 h-6" />
          <span className="font-semibold text-gray-900">Task Manager</span>
        </div>

        <MainContent
          selectedProjectId={selectedProjectId}
          projects={projects}
          tasks={displayTasks}
          members={memberProfiles}
          rawMembers={members}
          view={view}
          onAddTask={data => addTask.mutate(data)}
          onUpdateTask={(id, updates) => updateTask.mutate({ id, ...updates })}
          onDeleteTask={id => deleteTask.mutate(id)}
          onReorderTasks={tasks => reorderTasks.mutate(tasks)}
          onAddMember={data => addMember.mutate(data)}
          onRemoveMember={id => removeMember.mutate(id)}
        />
      </div>
    </div>
  );
}
