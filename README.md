# Task Manager

Aplicação web de gerenciamento de projetos e tarefas com Kanban, calendário, subtarefas, colaboração em tempo real e auditoria de ações.

**Repositório** → [github.com/LiviaMor/GerenciamentodeProjetos](https://github.com/LiviaMor/GerenciamentodeProjetos)

---

## Stack

**Frontend:** React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + shadcn/ui  
**Estado:** TanStack Query v5 + Context API  
**Backend:** Supabase (PostgreSQL + Auth + Storage) — sem API própria  
**Drag & Drop:** @hello-pangea/dnd  
**Editor Markdown:** @uiw/react-md-editor  
**Servidor:** Express + helmet + express-rate-limit  
**Testes:** Vitest + Testing Library  
**CI:** GitHub Actions (typecheck → test → build)  
**Deploy:** Docker (dev e produção) — compatível com AWS ECS

---

## Funcionalidades

- Autenticação com email/senha, avatar e recuperação de senha
- Projetos com cor customizável e controle de membros (owner / admin / member)
- Kanban com drag & drop e reordenação persistida
- Calendário mensal por data de vencimento
- **Task Detail Modal** (estilo ClickUp):
  - Descrição em Markdown com editor split
  - Subtarefas recursivas ilimitadas
  - Painel de atividade com logs automáticos + comentários com `@menção`
- Busca por texto e filtro por prioridade
- Auditoria completa de ações (create / update / delete)
- Row Level Security no banco — cada usuário acessa apenas seus projetos

---

## Banco de Dados

Execute `supabase/schema.sql` no SQL Editor do Supabase Dashboard antes de rodar o projeto.

### Tabelas

| Tabela | Descrição |
|---|---|
| `profiles` | Perfil do usuário (criado via trigger no cadastro) |
| `projects` | Projetos |
| `project_members` | Relação N:N usuários ↔ projetos com role |
| `tasks` | Tarefas com `parent_id` para subtarefas recursivas |
| `task_comments` | Comentários por tarefa |
| `audit_log` | Log de todas as ações |

---

## Configuração

### Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```
VITE_SUPABASE_URL=https://<projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

> As variáveis `VITE_*` são embutidas no bundle durante o build — não são lidas em runtime.

---

## Rodando localmente

### Sem Docker

```bash
pnpm install
pnpm dev
```

### Com Docker

```bash
# Desenvolvimento (hot reload)
docker compose --profile dev up

# Produção
docker compose --profile prod up --build
```

---

## Deploy na AWS (ECS)

```bash
# Build da imagem com as variáveis de ambiente
docker build \
  --build-arg VITE_SUPABASE_URL=https://seu-projeto.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=sua-anon-key \
  -t task-manager .

# Push para o ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag task-manager:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/task-manager:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/task-manager:latest
```

**Configuração do container no ECS:**
- Porta: `3000`
- Variáveis de ambiente em runtime: `NODE_ENV=production`, `PORT=3000`

---

## Scripts

| Comando | Descrição |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build client + server |
| `pnpm start` | Serve o build via Express |
| `pnpm test` | Testes em modo watch |
| `pnpm test:run` | Testes uma vez (CI) |
| `pnpm typecheck` | Type check TypeScript |
| `pnpm lint` | ESLint + type check |
| `pnpm format` | Formata com Prettier |

---

## Estrutura

```
client/src/
├── components/       # UI components
│   └── ui/           # shadcn/ui primitives
├── contexts/         # AuthContext, ThemeContext
├── hooks/            # useProjects, useTasks, useTaskDetail, useProjectMembers
├── lib/              # supabase.ts, kanban.ts, dates.ts, validation.ts
└── pages/            # Auth, Home, NotFound

server/               # Express (serve static + rate limit + helmet)
shared/               # types.ts, const.ts
supabase/             # schema.sql
```

---

## Licença

MIT
