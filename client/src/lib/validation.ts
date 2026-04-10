export function validateTaskTitle(title: string): string | null {
  const clean = title.trim();
  if (!clean) return 'Título é obrigatório';
  if (clean.length > 500) return 'Título deve ter no máximo 500 caracteres';
  return null;
}

export function validateProjectName(name: string): string | null {
  const clean = name.trim();
  if (!clean) return 'Nome é obrigatório';
  if (clean.length > 200) return 'Nome deve ter no máximo 200 caracteres';
  return null;
}

export function validateUsername(username: string): string | null {
  const clean = username.trim();
  if (!clean) return 'Nome de usuário é obrigatório';
  if (clean.length < 3) return 'Nome de usuário deve ter pelo menos 3 caracteres';
  if (!/^[a-zA-Z0-9_-]{3,30}$/.test(clean))
    return 'Nome de usuário só pode conter letras, números, _ e -';
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
  return null;
}
