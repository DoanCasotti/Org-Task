# Task Manager

**Projeto Integrador III-B** — PUC Goiás, Análise e Desenvolvimento de Sistemas

**Alunos** → Igor Leandro Catúlio dos Anjos e Livia Moreira Rocha

**Professor** → Thalles

**Deploy** → [gerenciamentode-projetos.vercel.app](https://gerenciamentode-projetos-gsa5qtm4o-liviamors-projects.vercel.app)

**Repositório** → [github.com/LiviaMor/GerenciamentodeProjetos](https://github.com/LiviaMor/GerenciamentodeProjetos)

---

## Qual problema ele resolve?

Equipes pequenas e médias frequentemente perdem o controle de tarefas quando usam planilhas, anotações soltas ou conversas em grupo. Falta visibilidade sobre o que está sendo feito, por quem e com qual prazo. O Task Manager resolve isso oferecendo um espaço centralizado, colaborativo e visual para organizar o trabalho.

## Por que usar o Task Manager?

1. **Colaboração em tempo real** — Múltiplos usuários acessam o mesmo projeto, cada um com seu login, vendo tarefas e membros sincronizados via Supabase
2. **Organização visual com Kanban** — Drag & drop entre colunas (A Fazer, Em Progresso, Concluído) dá visibilidade imediata do status de cada tarefa e do fluxo de trabalho
3. **Controle de prazos com calendário** — Visualização mensal das tarefas por data de entrega, facilitando o planejamento e evitando atrasos
4. **Segurança por design** — Row Level Security no banco garante que cada usuário só acessa dados dos projetos onde é membro, com controle de permissões (dono, admin, membro)
5. **Acessível de qualquer lugar** — Aplicação web responsiva (desktop, tablet e mobile) hospedada na Vercel, sem necessidade de instalação
6. **Rastreabilidade** — Tabela de auditoria registra toda criação, edição e exclusão de tarefas com timestamp e detalhes, permitindo acompanhar quem fez o quê

---

## Stack Tecnológica

### Frontend

- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS 4** para estilização utilitária
- **shadcn/ui** (primitivos Radix UI) para componentes de interface
- **wouter** para roteamento client-side (SPA)
- **framer-motion** para animações
- **lucide-react** para ícones

### Estado e Dados

- **TanStack Query v5** (React Query) → cache, sincronização e mutações
- **Context API** → autenticação (`AuthContext`) e tema (`ThemeContext`)
- **react-hook-form** + **zod** → validação de formulários

### Backend (BaaS)

- **Supabase** → PostgreSQL + Auth + Storage
- Sem API REST própria — o cliente React se comunica diretamente com o Supabase via SDK `@supabase/supabase-js`

### Drag & Drop

- **@hello-pangea/dnd** → DragDropContext / Droppable / Draggable

### Utilitários

- **date-fns** (locale pt-BR) → manipulação e formatação de datas
- **sonner** → notificações toast
- **next-themes** → suporte a tema claro/escuro

### Infraestrutura

- **Vercel** → deploy automático (produção)
- **GitHub Actions** → CI (type check + build em cada push)
- **Express** → servidor estático para servir o build fora da Vercel
- **pnpm** → gerenciador de pacotes
- **esbuild** → bundle do servidor

---

## Arquitetura Geral

```
Browser (React SPA)
│
├──► Supabase Auth     login, cadastro, sessão JWT
├──► Supabase DB       PostgreSQL via PostgREST (RLS ativo)
└──► Supabase Storage  avatares dos usuários (bucket: avatars)

Vercel / Express
└──► Serve dist/public  index.html + assets estáticos
```

> Toda a lógica de acesso a dados vive nos hooks React (useProjects, useTasks, useProjectMembers). Não há camada de API server-side própria.

---

## Estrutura de Diretórios

```
/
├── client/
│   ├── index.html
│   └── src/
│       ├── main.tsx                entry point React
│       ├── App.tsx                 providers globais + roteamento
│       ├── index.css               estilos globais (Tailwind)
│       ├── const.ts                constantes do client
│       ├── pages/
│       │   ├── Auth.tsx            página de login/cadastro
│       │   ├── Home.tsx            página principal (estado global)
│       │   └── NotFound.tsx        página 404
│       ├── components/
│       │   ├── Sidebar.tsx         lista de projetos, troca de view, logout
│       │   ├── MainContent.tsx     header, filtros, busca, board/calendar
│       │   ├── KanbanBoard.tsx     board com 3 colunas e drag & drop
│       │   ├── TaskCard.tsx        card individual de tarefa
│       │   ├── CalendarView.tsx    calendário mensal por due_date
│       │   ├── NewProjectDialog.tsx   modal criar projeto
│       │   ├── NewTaskDialog.tsx      modal criar tarefa
│       │   ├── EditTaskDialog.tsx     modal editar tarefa
│       │   ├── ManageMembersDialog.tsx modal gerenciar membros
│       │   ├── ErrorBoundary.tsx   error boundary global
│       │   └── ui/                 componentes shadcn/ui (gerados)
│       ├── contexts/
│       │   ├── AuthContext.tsx     user, profile, session, signIn/Up/Out
│       │   ├── ThemeContext.tsx    tema claro/escuro
│       │   └── AppContext.tsx      contexto legado (não utilizado)
│       ├── hooks/
│       │   ├── useProjects.ts      CRUD de projetos
│       │   ├── useTasks.ts         CRUD + reorder de tarefas + auditoria
│       │   ├── useProjectMembers.ts CRUD de membros
│       │   ├── useMobile.tsx       detecta viewport mobile
│       │   ├── useLocalStorage.ts  persistência local
│       │   ├── useComposition.ts   hook auxiliar
│       │   └── usePersistFn.ts     hook auxiliar
│       └── lib/
│           └── supabase.ts         instância singleton do cliente Supabase
├── server/
│   └── index.ts                    Express servindo arquivos estáticos
├── shared/
│   ├── types.ts                    tipos TypeScript compartilhados
│   └── const.ts                    constantes compartilhadas
├── supabase/
│   └── schema.sql                  SQL completo (tabelas, RLS, triggers, auditoria)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── components.json                 config shadcn/ui
└── vercel.json                     config de deploy Vercel
```

---

## Banco de Dados

### Diagrama de Relacionamento

```
auth.users   (gerenciado pelo Supabase Auth)
│
▼  trigger: on_auth_user_created → handle_new_user()

profiles
├── id           uuid PK → auth.users
├── username     text UNIQUE
├── avatar_url   text
└── created_at   timestamptz
│
├──► projects
│       ├── id           uuid PK
│       ├── name         text NOT NULL
│       ├── description  text
│       ├── color        text  default '#07477c'
│       ├── created_by   uuid → profiles
│       ├── created_at   timestamptz
│       └── updated_at   timestamptz
│            │
│            ├──► project_members
│            │       ├── id          uuid PK
│            │       ├── project_id  uuid → projects
│            │       ├── user_id     uuid → profiles
│            │       ├── role        text  (owner|admin|member)
│            │       └── joined_at   timestamptz
│            │       UNIQUE (project_id, user_id)
│            │
│            └──► tasks
│                    ├── id           uuid PK
│                    ├── project_id   uuid → projects
│                    ├── title        text NOT NULL
│                    ├── description  text
│                    ├── status       text  (todo|in_progress|done)
│                    ├── priority     text  (low|medium|high)
│                    ├── due_date     date
│                    ├── assigned_to  uuid → profiles (nullable)
│                    ├── order        integer  default 0
│                    ├── created_by   uuid → profiles
│                    ├── created_at   timestamptz
│                    └── updated_at   timestamptz
│
├──► audit_log
│       ├── id           uuid PK
│       ├── user_id      uuid → profiles
│       ├── action       text  (create|update|delete)
│       ├── entity_type  text  (task|project)
│       ├── entity_id    uuid
│       ├── details      jsonb
│       └── created_at   timestamptz
│
└──► storage.buckets: 'avatars'  (público)
```

### Políticas RLS (Row Level Security)

| Tabela | Política |
| --- | --- |
| `profiles` | Qualquer autenticado lê; usuário edita/insere apenas o próprio |
| `projects` | Criador tem acesso total; membros podem visualizar |
| `project_members` | Membros veem membros do mesmo projeto; owner gerencia; owner pode inserir qualquer membro |
| `tasks` | Membros do projeto veem, criam e atualizam; apenas o dono do projeto pode deletar |
| `audit_log` | Qualquer autenticado lê; usuário insere apenas registros próprios |
| `storage (avatars)` | Leitura pública; upload/update somente do próprio avatar |

### Função Auxiliar

- **`is_project_member(p_project_id)`** → função `security definer` que verifica membership sem recursão de RLS

### Trigger Automático

- **Nome** → `on_auth_user_created`
- **Evento** → `AFTER INSERT` em `auth.users`
- **Ação** → cria linha em `profiles` com o `username` vindo de `raw_user_meta_data`

---

## Fluxo de Dados Principal

1. **`App.tsx`** monta os providers na ordem:
   `ErrorBoundary` → `QueryClientProvider` → `ThemeProvider` → `AuthProvider` → `TooltipProvider`

2. **`AuthContext`** verifica sessão via `supabase.auth.getSession()` na inicialização e escuta mudanças com `onAuthStateChange`
   - Sem sessão → renderiza `<Auth />`
   - Com sessão → busca perfil em `profiles` e renderiza a aplicação

3. **`Home.tsx`** é o componente raiz da app autenticada
   - Mantém estado de `selectedProjectId` e `view` (`kanban` | `calendar`)
   - Instancia `useProjects`, `useTasks(selectedProjectId)` e `useProjectMembers(selectedProjectId)`
   - Calcula `taskCounts` (total e concluídas por projeto) via `useMemo`
   - Determina `isProjectOwner` comparando `created_by` com o usuário logado

4. **Hooks** usam TanStack Query (`useQuery` + `useMutation`)
   - Buscam e mutam dados diretamente no Supabase
   - Invalidam as queries relevantes após cada mutação bem-sucedida
   - Registram ações na tabela `audit_log` (criar, editar, deletar tarefas)

5. **`Sidebar`** → lista de projetos com barra de progresso, botão "Novo Projeto", toggle de view (Kanban / Calendário), avatar e logout do usuário

6. **`MainContent`** → header do projeto, busca por texto, filtro por prioridade, botão "Nova Tarefa", botão "Membros" (visível quando um projeto está selecionado); decide entre `<KanbanBoard>` ou `<CalendarView>`

7. **`KanbanBoard`** → usa `DragDropContext / Droppable / Draggable`; no `onDragEnd` recalcula `status` e `order` de cada tarefa afetada e dispara N updates paralelos no Supabase via `Promise.all`; botão de deletar tarefa visível apenas para o dono do projeto

8. **`CalendarView`** → usa `date-fns` para construir a grade mensal; mapeia tarefas pelo `due_date` com indicador de prioridade colorido

---

## Componentes Principais

### Sidebar (`Sidebar.tsx`)

- Largura fixa de 256px (`w-64`), fundo `gray-50`
- Em mobile: posicionada como `fixed`, aparece com transição via `translate-x`; overlay escuro fecha ao clicar fora
- **Seções:**
  - Header com logo + botão "Novo Projeto"
  - Toggle Kanban / Calendário
  - Lista de projetos com dot colorido, contador `concluídas/total • %` e botão de deletar (visível no hover)
  - Footer com avatar, username e botão de logout

### KanbanBoard (`KanbanBoard.tsx`)

- 3 colunas fixas: **A Fazer** (amarelo) · **Em Progresso** (azul) · **Concluído** (verde)
- Cada coluna é um `<Droppable>`, cada card é um `<Draggable>`
- Ao soltar (`onDragEnd`):
  - **Mesma coluna** → reordena e persiste os novos `order` values
  - **Colunas diferentes** → atualiza `status` + `order` de todas as tarefas afetadas
- Card em arraste recebe `shadow-lg rotate-2`; coluna de destino recebe `bg-blue-50`
- Botão de deletar tarefa visível apenas para o dono do projeto (`isProjectOwner`)

### AuthContext (`AuthContext.tsx`)

| Propriedade / Método | Tipo | Descrição |
| --- | --- | --- |
| `user` | `User \| null` | Usuário Supabase Auth |
| `profile` | `Profile \| null` | Dados da tabela `profiles` |
| `session` | `Session \| null` | Sessão JWT ativa |
| `loading` | `boolean` | Estado de inicialização |
| `signUp` | `fn` | Cadastro com email + senha + username |
| `signIn` | `fn` | Login com email + senha |
| `signOut` | `fn` | Logout e limpeza de estado |
| `updateProfile` | `fn` | Atualiza campos do perfil |
| `uploadAvatar` | `fn` | Upload para `avatars/<userId>/avatar.<ext>` |

### Hooks de Dados

#### `useProjects`

- `useQuery` → busca todos os projetos do usuário ordenados por `created_at DESC`
- `addProject` → insere projeto + insere criador como `owner` em `project_members`
- `deleteProject` → deleta projeto (cascade apaga membros e tarefas)

#### `useTasks(projectId?)`

- `useQuery` → busca tarefas com join em `profiles` (responsável), ordenadas por `order ASC`
- `addTask` → calcula `maxOrder` na coluna `todo` e insere com `status: "todo"`; registra auditoria
- `updateTask` → atualiza campos e seta `updated_at`; registra auditoria
- `deleteTask` → remove tarefa por id (apenas dono do projeto via RLS); registra auditoria
- `reorderTasks` → dispara N updates em paralelo via `Promise.all`

#### `useProjectMembers(projectId?)`

- `useQuery` → busca membros com join em `profiles`
- `addMember` → insere membro por `userId` + `role`
- `removeMember` → deleta pelo `id` da linha em `project_members`

---

## Funcionalidades Implementadas

### Autenticação

- Cadastro com email, senha e username obrigatório
- Upload opcional de avatar no cadastro (Supabase Storage)
- Login com email e senha
- Logout
- Sessão persistida via JWT no localStorage (gerenciado pelo Supabase)
- Trigger cria perfil automaticamente no cadastro
- Proteção de rotas: app só renderiza se há sessão ativa

### Projetos

- Criar projeto → nome, descrição e cor customizável via color picker
- Listar projetos → apenas projetos onde o usuário é membro (RLS)
- Deletar projeto → apenas o criador pode deletar
- Contador de tarefas (total e concluídas) com percentual na sidebar
- Opção "Todos os Projetos" exibe tarefas de todos os projetos do usuário

### Membros

- Adicionar membro ao projeto buscando por username
- Remover membro do projeto (exceto o dono)
- Papéis disponíveis: `owner` / `admin` / `member`
- Criador é adicionado automaticamente como `owner` na criação do projeto
- Dialog de gerenciamento de membros acessível pelo botão "Membros" no header

### Tarefas

- Criar tarefa → título, descrição, prioridade, data de entrega, responsável
- Editar tarefa → todos os campos via modal
- Deletar tarefa → apenas o dono do projeto pode deletar (RLS + UI)
- Alterar status via drag & drop entre colunas
- Reordenar tarefas dentro da mesma coluna via drag & drop
- Campo `order` numérico persistido no banco

### Auditoria

- Tabela `audit_log` registra todas as ações de criação, edição e exclusão de tarefas
- Cada registro contém: usuário, ação, tipo de entidade, ID da entidade e detalhes em JSON
- Dados consultáveis diretamente no Supabase Dashboard (Table Editor → audit_log)

### Filtros e Busca

- Busca por texto → filtra `título` e `descrição` (client-side)
- Filtro por prioridade → `low` / `medium` / `high` / todas
- Filtros aplicados antes de passar para o board ou calendário

### Visualizações

- **Kanban Board** → 3 colunas com drag & drop
- **Calendário** → grade mensal, tarefas posicionadas pelo `due_date`, indicador de prioridade colorido

### UX / Interface

- Sidebar responsiva e colapsível em mobile com overlay
- Cor primária `#07477c` (azul escuro)
- Toasts de feedback (sonner) em todas as operações CRUD
- Loading spinner animado na inicialização da sessão
- Error boundary global captura erros de renderização

---

## Configuração de Ambiente

### Variáveis de Ambiente

Arquivo → `.env` na raiz do projeto

```
VITE_SUPABASE_URL=https://<projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### Instalação Local

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar banco de dados
# Executar supabase/schema.sql no SQL Editor do Supabase Dashboard

# 3. Configurar variáveis de ambiente
# Criar .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 4. Iniciar desenvolvimento
pnpm dev
```

### Scripts Disponíveis

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento Vite |
| `pnpm build` | Build client (Vite) + server (esbuild) |
| `pnpm build:client` | Build apenas do frontend |
| `pnpm build:server` | Build apenas do servidor Express |
| `pnpm start` | Serve o build via Express (produção) |
| `pnpm check` | Type check TypeScript (`tsc --noEmit`) |
| `pnpm format` | Formata o código com Prettier |
| `pnpm preview` | Preview do build de produção |

---

## Deploy

### Vercel (Produção)

- Deploy automático a cada push na branch `main`
- Configuração via `vercel.json`
- Variáveis de ambiente configuradas em **Settings → Environment Variables** no painel da Vercel

### GitHub Actions (CI)

- Pipeline definido em `.github/workflows/ci.yml`
- Executa type check e build em cada push na `main`
- Variáveis de ambiente placeholder injetadas no build do CI

---

## Melhorias Futuras

### Funcionalidades

- Comentários em tarefas
- Labels / tags em tarefas
- Sub-tarefas ou checklists
- Notificações de vencimento de tarefas
- Exportação de dados (CSV, PDF)
- Busca global entre todos os projetos
- Edição inline de tarefas no board (sem abrir modal)
- Painel de auditoria na interface (atualmente consultável apenas via Supabase Dashboard)

### Técnicas

- Diferenciação prática de permissões entre `admin` e `member`
- Aplicação completa do dark mode na UI
- Paginação ou virtualização de listas para alto volume de tarefas
- Testes automatizados (unitários, integração, e2e)
- Remoção do componente `Map.tsx` (não integrado ao fluxo)

---

## Licença

MIT
