import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Task, TaskComment } from '@shared/types';
import { toast } from 'sonner';

export function useTaskDetail(taskId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const taskQuery = useQuery({
    queryKey: ['task-detail', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles:assigned_to(id, username, avatar_url)')
        .eq('id', taskId!)
        .single();
      if (error) throw error;
      return data as Task;
    },
    enabled: !!taskId && !!user,
  });

  const subtasksQuery = useQuery({
    queryKey: ['subtasks', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles:assigned_to(id, username, avatar_url)')
        .eq('parent_id', taskId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!taskId && !!user,
  });

  const commentsQuery = useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*, profiles:user_id(id, username, avatar_url)')
        .eq('task_id', taskId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as TaskComment[];
    },
    enabled: !!taskId && !!user,
  });

  const activityQuery = useQuery({
    queryKey: ['task-activity', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*, profiles:user_id(id, username, avatar_url)')
        .eq('entity_id', taskId!)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!taskId && !!user,
  });

  const addSubtask = useMutation({
    mutationFn: async (title: string) => {
      if (!taskId || !taskQuery.data) throw new Error('Tarefa não encontrada');
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: title.trim(),
          project_id: taskQuery.data.project_id,
          parent_id: taskId,
          status: 'todo',
          priority: 'medium',
          start_date: today,
          order: subtasksQuery.data?.length ?? 0,
          created_by: user!.id,
        })
        .select('*, profiles:assigned_to(id, username, avatar_url)')
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (e: Error) => toast.error(`Erro ao criar subtarefa: ${e.message}`),
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('task_comments')
        .insert({ task_id: taskId!, user_id: user!.id, content: content.trim() })
        .select('*, profiles:user_id(id, username, avatar_url)')
        .single();
      if (error) throw error;
      return data as TaskComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
    },
    onError: (e: Error) => toast.error(`Erro ao comentar: ${e.message}`),
  });

  const updateTask = useMutation({
    mutationFn: async (updates: Partial<Task>) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', taskId!)
        .select('*, profiles:assigned_to(id, username, avatar_url)')
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-detail', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['subtasks'] });
    },
    onError: (e: Error) => toast.error(`Erro ao atualizar: ${e.message}`),
  });

  return {
    task: taskQuery.data ?? null,
    subtasks: subtasksQuery.data ?? [],
    comments: commentsQuery.data ?? [],
    activity: activityQuery.data ?? [],
    isLoading: taskQuery.isLoading,
    addSubtask,
    addComment,
    updateTask,
  };
}
