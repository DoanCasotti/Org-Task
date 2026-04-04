import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Task, TaskStatus, TaskPriority } from "@shared/types";
import { toast } from "sonner";

export function useTasks(projectId?: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      let q = supabase
        .from("tasks")
        .select("*, profiles:assigned_to(id, username, avatar_url)")
        .order("order", { ascending: true });

      if (projectId) {
        q = q.eq("project_id", projectId);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const logAudit = async (action: string, entityType: string, entityId: string, details?: Record<string, unknown>) => {
    await supabase.from("audit_log").insert({
      user_id: user!.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });
  };

  const addTask = useMutation({
    mutationFn: async (input: {
      project_id: string;
      title: string;
      priority?: TaskPriority;
      description?: string;
      due_date?: string;
      assigned_to?: string;
    }) => {
      const cleanTitle = input.title.trim();
      if (!cleanTitle || cleanTitle.length > 500) {
        throw new Error("Título da tarefa inválido");
      }

      const maxOrder = (query.data ?? []).filter(
        t => t.project_id === input.project_id && t.status === "todo"
      ).length;

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...input,
          title: cleanTitle,
          description: input.description?.trim() || null,
          status: "todo" as TaskStatus,
          priority: input.priority || "medium",
          order: maxOrder,
          created_by: user!.id,
        })
        .select("*, profiles:assigned_to(id, username, avatar_url)")
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      logAudit("create", "task", data.id, { title: data.title, project_id: data.project_id });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa criada com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar tarefa: ${error.message}`);
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*, profiles:assigned_to(id, username, avatar_url)")
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      logAudit("update", "task", data.id, { title: data.title, status: data.status });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const task = (query.data ?? []).find(t => t.id === id);
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      return { id, title: task?.title };
    },
    onSuccess: (data) => {
      logAudit("delete", "task", data.id, { title: data.title });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa removida");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao deletar tarefa: ${error.message}`);
    },
  });

  const reorderTasks = useMutation({
    mutationFn: async (
      tasks: { id: string; status: TaskStatus; order: number }[]
    ) => {
      const updates = tasks.map(t =>
        supabase
          .from("tasks")
          .update({ status: t.status, order: t.order })
          .eq("id", t.id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao reordenar tarefas: ${error.message}`);
    },
  });

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
  };
}
