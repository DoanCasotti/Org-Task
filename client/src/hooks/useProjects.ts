import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Project } from "@shared/types";
import { toast } from "sonner";

export function useProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });

  const addProject = useMutation({
    mutationFn: async ({
      name,
      description,
      color,
    }: {
      name: string;
      description?: string;
      color?: string;
    }) => {
      const cleanName = name.trim();
      if (!cleanName || cleanName.length > 200) {
        throw new Error("Nome do projeto inválido");
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: cleanName,
          description: description?.trim() || null,
          color: color || "#07477c",
          created_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;

      // Auto-add creator as owner
      await supabase.from("project_members").insert({
        project_id: data.id,
        user_id: user!.id,
        role: "owner",
      });

      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projeto criado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar projeto: ${error.message}`);
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Projeto deletado");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao deletar projeto: ${error.message}`);
    },
  });

  return {
    projects: query.data ?? [],
    isLoading: query.isLoading,
    addProject,
    deleteProject,
  };
}
