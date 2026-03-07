import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Trash2, Crown, Shield, User } from "lucide-react";
import { useState } from "react";
import { Profile, ProjectMember } from "@shared/types";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ManageMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: ProjectMember[];
  onAddMember: (data: { userId: string; role?: string }) => void;
  onRemoveMember: (memberId: string) => void;
}

const roleIcons: Record<string, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  member: User,
};

const roleLabels: Record<string, string> = {
  owner: "Dono",
  admin: "Admin",
  member: "Membro",
};

export function ManageMembersDialog({
  open,
  onOpenChange,
  members,
  onAddMember,
  onRemoveMember,
}: ManageMembersDialogProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddMember = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      // Buscar usuário pelo username
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", email.trim())
        .single();

      if (error || !profile) {
        toast.error("Usuário não encontrado. Verifique o nome de usuário.");
        return;
      }

      const alreadyMember = members.some(
        m => m.user_id === profile.id || m.profiles?.id === profile.id
      );
      if (alreadyMember) {
        toast.error("Este usuário já é membro do projeto.");
        return;
      }

      onAddMember({ userId: profile.id });
      setEmail("");
    } catch {
      toast.error("Erro ao buscar usuário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Membros do Projeto</DialogTitle>
          <DialogDescription>
            Gerencie quem tem acesso a este projeto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add member */}
          <div className="flex gap-2">
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Nome de usuário"
              onKeyDown={e => e.key === "Enter" && handleAddMember()}
            />
            <Button
              onClick={handleAddMember}
              disabled={!email.trim() || loading}
              className="bg-[#07477c]/80 hover:bg-[#07477c] text-white shrink-0"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>

          {/* Members list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {members.map(member => {
              const RoleIcon = roleIcons[member.role] || User;
              const profile = member.profiles;
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
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
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <RoleIcon className="w-3 h-3" />
                      {roleLabels[member.role] || member.role}
                    </div>
                  </div>
                  {member.role !== "owner" && (
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      className="p-1.5 hover:bg-red-100 rounded transition-colors"
                      title="Remover membro"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              );
            })}
            {members.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum membro ainda
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
