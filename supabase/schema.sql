-- ============================================================
-- Supabase Schema: Task Manager
-- Execute este SQL no SQL Editor do Supabase Dashboard
-- ============================================================

-- ============================================================
-- PASSO 1: Tabelas
-- ============================================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  color text default '#07477c',
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.project_members (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz default now(),
  unique(project_id, user_id)
);

create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  assigned_to uuid references public.profiles(id) on delete set null,
  "order" integer default 0,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PASSO 2: RLS + Policies
-- ============================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;

-- Profiles
drop policy if exists "Profiles visíveis para usuários autenticados" on public.profiles;
create policy "Profiles visíveis para usuários autenticados"
  on public.profiles for select to authenticated using (true);

drop policy if exists "Usuário edita próprio perfil" on public.profiles;
create policy "Usuário edita próprio perfil"
  on public.profiles for update to authenticated using (auth.uid() = id);

drop policy if exists "Usuário insere próprio perfil" on public.profiles;
create policy "Usuário insere próprio perfil"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Projects
drop policy if exists "Criador gerencia projeto" on public.projects;
create policy "Criador gerencia projeto"
  on public.projects for all to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "Membros veem projetos" on public.projects;
create policy "Membros veem projetos"
  on public.projects for select to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.project_members
      where project_id = id and user_id = auth.uid()
    )
  );

-- Project Members
drop policy if exists "Membros veem membros do projeto" on public.project_members;
drop policy if exists "Owner gerencia membros" on public.project_members;
drop policy if exists "Usuário se adiciona como membro" on public.project_members;
drop policy if exists "Owner insere membros" on public.project_members;
create policy "Membros gerenciam project_members"
  on public.project_members for all to authenticated
  using (true)
  with check (true);

-- Função auxiliar (necessária antes das policies de tasks)
create or replace function public.is_project_member(p_project_id uuid)
returns boolean as $$
  select exists(
    select 1 from public.project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- Tasks
drop policy if exists "Membros veem tarefas do projeto" on public.tasks;
create policy "Membros veem tarefas do projeto"
  on public.tasks for select to authenticated
  using (project_id in (select project_id from public.project_members where user_id = auth.uid()));

drop policy if exists "Membros gerenciam tarefas" on public.tasks;
drop policy if exists "Membros criam e atualizam tarefas" on public.tasks;
create policy "Membros atualizam tarefas"
  on public.tasks for update to authenticated
  using (project_id in (
    select project_id from public.project_members where user_id = auth.uid()
  ))
  with check (project_id in (
    select project_id from public.project_members where user_id = auth.uid()
  ));

drop policy if exists "Membros inserem tarefas" on public.tasks;
create policy "Membros inserem tarefas"
  on public.tasks for insert to authenticated
  with check (public.is_project_member(project_id));

drop policy if exists "Dono deleta tarefas" on public.tasks;
create policy "Dono deleta tarefas"
  on public.tasks for delete to authenticated
  using (
    project_id in (
      select id from public.projects where created_by = auth.uid()
    )
  );

-- ============================================================
-- PASSO 3: Trigger auto-create profile
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- PASSO 4: Storage bucket para avatares
-- ============================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Qualquer um vê avatares" on storage.objects;
create policy "Qualquer um vê avatares"
  on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "Usuário faz upload do próprio avatar" on storage.objects;
create policy "Usuário faz upload do próprio avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Usuário atualiza próprio avatar" on storage.objects;
create policy "Usuário atualiza próprio avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- PASSO 5: Tabela de Auditoria
-- ============================================================

create table if not exists public.audit_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

alter table public.audit_log enable row level security;

drop policy if exists "Dono vê auditoria" on public.audit_log;
drop policy if exists "Usuário vê própria auditoria" on public.audit_log;
create policy "Usuário vê própria auditoria"
  on public.audit_log for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Sistema insere auditoria" on public.audit_log;
create policy "Sistema insere auditoria"
  on public.audit_log for insert to authenticated
  with check (user_id = auth.uid());

-- ============================================================
-- PASSO 6: Constraint de username
-- ============================================================
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS username_format;
ALTER TABLE public.profiles
  ADD CONSTRAINT username_format
  CHECK (username ~ '^[a-zA-Z0-9_-]{3,30}$');

-- ============================================================
-- PASSO 7: Subtarefas e Comentários
-- ============================================================

-- Coluna parent_id para hierarquia de subtarefas
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS parent_id uuid references public.tasks(id) on delete cascade;

-- Tabela de comentários
create table if not exists public.task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

alter table public.task_comments enable row level security;

drop policy if exists "Membros veem comentários" on public.task_comments;
create policy "Membros veem comentários"
  on public.task_comments for select to authenticated
  using (
    task_id in (
      select t.id from public.tasks t
      where public.is_project_member(t.project_id)
    )
  );

drop policy if exists "Membros inserem comentários" on public.task_comments;
create policy "Membros inserem comentários"
  on public.task_comments for insert to authenticated
  with check (
    user_id = auth.uid() and
    task_id in (
      select t.id from public.tasks t
      where public.is_project_member(t.project_id)
    )
  );

drop policy if exists "Autor deleta comentário" on public.task_comments;
create policy "Autor deleta comentário"
  on public.task_comments for delete to authenticated
  using (user_id = auth.uid());