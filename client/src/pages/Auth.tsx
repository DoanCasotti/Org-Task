import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn, UserPlus, Upload, Mail, KeyRound } from "lucide-react";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type Mode = "login" | "register" | "reset" | "update_password";

function sanitizeInput(value: string): string {
  return value.trim().replace(/[<>]/g, "");
}

export default function Auth() {
  const { signIn, signUp, uploadAvatar, resetPassword, updatePassword } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) {
      setMode("update_password");
    }
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Formato inválido. Use JPEG, PNG, WebP ou GIF.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Imagem muito grande. Máximo 2MB.");
      e.target.value = "";
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const cleanEmail = sanitizeInput(email);
    const cleanPassword = password;

    try {
      if (mode === "login") {
        const { error } = await signIn(cleanEmail, cleanPassword);
        if (error) toast.error(error.message);
      } else if (mode === "register") {
        const cleanUsername = sanitizeInput(username);

        if (!cleanUsername) {
          toast.error("Nome de usuário é obrigatório");
          setSubmitting(false);
          return;
        }
        if (cleanUsername.length < 3) {
          toast.error("Nome de usuário deve ter pelo menos 3 caracteres");
          setSubmitting(false);
          return;
        }
        if (!/^[a-zA-Z0-9_-]{3,30}$/.test(cleanUsername)) {
          toast.error('Nome de usuário só pode conter letras, números, _ e -');
          setSubmitting(false);
          return;
        }
        if (cleanPassword.length < 6) {
          toast.error("Senha deve ter pelo menos 6 caracteres");
          setSubmitting(false);
          return;
        }

        const { error } = await signUp(cleanEmail, cleanPassword, cleanUsername);
        if (error) {
          toast.error(error.message);
        } else {
          if (avatarFile) await uploadAvatar(avatarFile);
          toast.success("Conta criada! Verifique seu email para confirmar.");
        }
      } else if (mode === "reset") {
        const { error } = await resetPassword(cleanEmail);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Link de recuperação enviado! Verifique seu email.");
          setMode("login");
        }
      } else if (mode === "update_password") {
        if (cleanPassword.length < 6) {
          toast.error("Senha deve ter pelo menos 6 caracteres");
          setSubmitting(false);
          return;
        }
        const { error } = await updatePassword(cleanPassword);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Senha redefinida com sucesso!");
          window.history.replaceState(null, "", window.location.pathname);
          setMode("login");
        }
      }
    } catch {
      toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
    }

    setSubmitting(false);
  };

  const subtitles: Record<Mode, string> = {
    login: "Entre na sua conta",
    register: "Crie sua conta",
    reset: "Recuperar senha",
    update_password: "Redefinir senha",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="/favicon.icon.png"
            alt="Logo"
            className="w-12 h-12 mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitles[mode]}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
        >
          {mode === "register" && (
            <>
              <div>
                <Label htmlFor="username">Nome de usuário</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="seu_nome"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Foto de perfil (opcional)</Label>
                <div className="flex items-center gap-3 mt-1">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="flex-1"
                  />
                </div>
              </div>
            </>
          )}

          {mode !== "update_password" && (
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="mt-1"
                required
              />
            </div>
          )}

          {(mode === "login" || mode === "register" || mode === "update_password") && (
            <div>
              <Label htmlFor="password">
                {mode === "update_password" ? "Nova senha" : "Senha"}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
                required
                minLength={6}
              />
            </div>
          )}

          {mode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="text-sm text-[#07477c] hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full text-white"
            style={{ backgroundColor: "#07477c" }}
          >
            {submitting ? (
              "Aguarde..."
            ) : mode === "login" ? (
              <><LogIn className="w-4 h-4 mr-2" /> Entrar</>
            ) : mode === "register" ? (
              <><UserPlus className="w-4 h-4 mr-2" /> Criar Conta</>
            ) : mode === "reset" ? (
              <><Mail className="w-4 h-4 mr-2" /> Enviar link de recuperação</>
            ) : (
              <><KeyRound className="w-4 h-4 mr-2" /> Redefinir senha</>
            )}
          </Button>
        </form>

        {(mode === "login" || mode === "register") && (
          <p className="text-center text-sm text-gray-500 mt-4">
            {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-[#07477c] font-medium hover:underline"
            >
              {mode === "login" ? "Criar conta" : "Fazer login"}
            </button>
          </p>
        )}

        {mode === "reset" && (
          <p className="text-center text-sm text-gray-500 mt-4">
            <button
              onClick={() => setMode("login")}
              className="text-[#07477c] font-medium hover:underline"
            >
              Voltar ao login
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
