import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ProjectMember } from "@shared/types";
import { toast } from "sonner";

export function useProjectMembers(projectId?: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select("*, profiles:user_id(id, username, avatar_url)")
        .eq("project_id", projectId!);
      if (error) throw error;
      return data as ProjectMember[];
    },
    enabled: !!user && !!projectId,
  });

  const addMember = useMutation({
    mutationFn: async ({
      userId,
      role = "member",
    }: {
      userId: string;
      role?: string;
    }) => {
      const { error } = await supabase.from("project_members").insert({
        project_id: projectId!,
        user_id: userId,
        role,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-members", projectId],
      });
      toast.success("Membro adicionado ao projeto");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar membro: ${error.message}`);
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-members", projectId],
      });
      toast.success("Membro removido do projeto");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover membro: ${error.message}`);
    },
  });

  return {
    members: query.data ?? [],
    isLoading: query.isLoading,
    addMember,
    removeMember,
  };
}
