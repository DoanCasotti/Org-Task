-- ============================================================
-- Supabase Schema: Task Manager
-- Execute este SQL no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles visíveis para usuários autenticados"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Usuário edita próprio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Usuário insere próprio perfil"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Trigger para criar perfil automaticamente no signup
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

-- 2. Projects
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  color text default '#07477c',
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;

create policy "Membros veem projetos"
  on public.projects for select
  to authenticated
  using (
    id in (
      select project_id from public.project_members
      where user_id = auth.uid()
    )
  );

create policy "Criador gerencia projeto"
  on public.projects for all
  to authenticated
  using (created_by = auth.uid());

-- 3. Project Members
create table if not exists public.project_members (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz default now(),
  unique(project_id, user_id)
);

alter table public.project_members enable row level security;

create policy "Membros veem membros do projeto"
  on public.project_members for select
  to authenticated
  using (
    project_id in (
      select project_id from public.project_members pm
      where pm.user_id = auth.uid()
    )
  );

create policy "Owner gerencia membros"
  on public.project_members for all
  to authenticated
  using (
    project_id in (
      select id from public.projects
      where created_by = auth.uid()
    )
  );

-- Permitir que qualquer autenticado insira a si mesmo como membro
create policy "Usuário se adiciona como membro"
  on public.project_members for insert
  to authenticated
  with check (user_id = auth.uid());

-- 4. Tasks
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

alter table public.tasks enable row level security;

create policy "Membros veem tarefas do projeto"
  on public.tasks for select
  to authenticated
  using (
    project_id in (
      select project_id from public.project_members
      where user_id = auth.uid()
    )
  );

create policy "Membros gerenciam tarefas"
  on public.tasks for all
  to authenticated
  using (
    project_id in (
      select project_id from public.project_members
      where user_id = auth.uid()
    )
  );

-- 5. Storage bucket para avatares
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Qualquer um vê avatares"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Usuário faz upload do próprio avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Usuário atualiza próprio avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
