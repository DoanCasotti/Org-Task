# 📋 Task Manager — Gerenciamento de Projetos e Tarefas

**Projeto Integrador III - B | PUC Goiás**

**Alunos:** Livia Moreira Rocha e Igor Leandro Catulio dos Anjos

Sistema web de gerenciamento de projetos e tarefas no estilo Kanban (inspirado no Jira), com autenticação, colaboração entre membros, drag & drop e visualização em calendário.

🔗 **Produção:** [gerenciamentode-projetos.vercel.app](https://gerenciamentode-projetos-gsa5qtm4o-liviamors-projects.vercel.app)

---

## Funcionalidades

- **Autenticação completa** — Cadastro e login com Supabase Auth, upload de foto de perfil
- **Projetos colaborativos** — Crie projetos e adicione membros por nome de usuário
- **Kanban Board** — Colunas "A Fazer", "Em Progresso" e "Concluído" com drag & drop
- **Visualização em Calendário** — Tarefas mapeadas por data de entrega (due_date)
- **Filtros e busca** — Pesquise por título/descrição, filtre por prioridade
- **Responsivo** — Interface adaptada para desktop, tablet e mobile
- **Row Level Security** — Cada usuário só vê projetos e tarefas dos quais é membro
- **CI/CD** — Deploy automático via Vercel com GitHub Actions

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Estilização | Tailwind CSS 4 + shadcn/ui |
| Backend (BaaS) | Supabase (PostgreSQL, Auth, Storage) |
| State Management | TanStack Query (React Query) + Context API |
| Drag & Drop | @hello-pangea/dnd |
| Datas | date-fns |
| Ícones | lucide-react |
| Deploy | Vercel |
| CI | GitHub Actions |
| Package Manager | pnpm |

---

## Arquitetura do Banco de Dados

```
auth.users (Supabase Auth)
    │
    ▼ (trigger: auto-create profile)
profiles (id, username, avatar_url)
    │
    ├──► projects (id, name, description, color, created_by)
    │        │
    │        ├──► project_members (project_id, user_id, role)
    │        │
    │        └──► tasks (id, title, status, priority, due_date, assigned_to, order)
```

- **Relacionamento N:N** entre usuários e projetos via `project_members`
- **RLS (Row Level Security)** ativo em todas as tabelas
- **UUID v4** como chaves primárias
- **Trigger automático** para criação de perfil no cadastro

---

## Instalação Local

### Pré-requisitos

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Conta no [Supabase](https://supabase.com)

### 1. Clone e instale

```bash
git clone https://github.com/seu-usuario/GerenciamentodeProjetos.git
cd GerenciamentodeProjetos
pnpm install
```

### 2. Configure o Supabase

1. Crie um projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor** e execute o conteúdo de `supabase/schema.sql`
3. Copie a **Project URL** e **anon key** em **Settings → API**

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 4. Rode o projeto

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build completo (client + server) |
| `pnpm build:client` | Build apenas do frontend |
| `pnpm check` | Verificação de tipos TypeScript |
| `pnpm format` | Formata código com Prettier |
| `pnpm preview` | Preview da build de produção |

---

## Estrutura do Projeto

```
├── client/
│   ├── public/                  # Arquivos estáticos (favicon, imagens)
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   │   ├── KanbanBoard.tsx  # Board com drag & drop
│   │   │   ├── CalendarView.tsx # Visualização em calendário
│   │   │   ├── Sidebar.tsx      # Navegação lateral
│   │   │   ├── MainContent.tsx  # Conteúdo principal
│   │   │   ├── ManageMembersDialog.tsx  # Gerenciar membros
│   │   │   ├── TaskCard.tsx     # Card de tarefa
│   │   │   └── ui/             # Componentes shadcn/ui
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx  # Autenticação (Supabase Auth)
│   │   │   └── ThemeContext.tsx # Tema claro/escuro
│   │   ├── hooks/
│   │   │   ├── useProjects.ts  # CRUD de projetos (React Query)
│   │   │   ├── useTasks.ts     # CRUD de tarefas (React Query)
│   │   │   └── useProjectMembers.ts # Membros do projeto
│   │   ├── lib/
│   │   │   └── supabase.ts     # Cliente Supabase
│   │   └── pages/
│   │       ├── Auth.tsx        # Login / Cadastro
│   │       └── Home.tsx        # Dashboard principal
│   └── index.html
├── server/
│   └── index.ts                # Servidor Express (produção)
├── shared/
│   └── types.ts                # Tipos TypeScript compartilhados
├── supabase/
│   └── schema.sql              # Schema completo do banco
├── .github/
│   └── workflows/ci.yml        # Pipeline CI/CD
├── vercel.json                 # Configuração Vercel
└── package.json
```

---

## Deploy na Vercel

1. Conecte o repositório GitHub na [Vercel](https://vercel.com)
2. Adicione as variáveis de ambiente em **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. O deploy acontece automaticamente a cada push na branch `main`

---

## Como Usar

### Cadastro e Login
1. Acesse o site e crie uma conta com nome de usuário e senha
2. Opcionalmente, faça upload de uma foto de perfil

### Criar um Projeto
1. Clique em **"Novo Projeto"** na sidebar
2. Escolha nome, descrição e cor
3. Você é adicionado automaticamente como dono

### Adicionar Membros
1. Selecione um projeto
2. Clique no botão **"Membros"** no header
3. Digite o nome de usuário da pessoa (ela precisa ter conta)
4. Clique no botão de adicionar

### Gerenciar Tarefas
1. Clique em **"Nova Tarefa"** para criar
2. Arraste os cards entre as colunas do Kanban para mudar o status
3. Clique em uma tarefa para editar detalhes
4. Use os filtros de busca e prioridade

### Visualização em Calendário
1. Clique em **"Calendário"** na sidebar
2. As tarefas aparecem nos dias correspondentes à data de entrega

---

## Segurança

### Headers HTTP (Vercel)
O projeto configura os seguintes headers de segurança automaticamente via `vercel.json`:
- `Content-Security-Policy` — restringe origens de scripts, estilos, conexões e imagens
- `Strict-Transport-Security` — força HTTPS com HSTS
- `X-Frame-Options: DENY` — previne clickjacking
- `X-Content-Type-Options: nosniff` — previne MIME sniffing
- `Permissions-Policy` — bloqueia acesso a câmera, microfone e geolocalização

### Banco de Dados
- **Row Level Security (RLS)** ativo em todas as tabelas
- Usuários só acessam dados de projetos dos quais são membros
- Apenas o criador do projeto pode deletá-lo ou gerenciar membros

### Upload de Arquivos
- Avatares limitados a **2MB**
- Apenas formatos JPEG, PNG, WebP e GIF são aceitos
- Cada usuário só pode fazer upload na própria pasta no Storage

### Validação de Inputs
- Inputs sanitizados no client antes de enviar ao Supabase
- Validação de tamanho mínimo/máximo em nomes de projeto e tarefas
- Constraints `CHECK` no banco para status, prioridade e roles

### Tratamento de Erros
- Stack traces são exibidos apenas em ambiente de desenvolvimento
- Em produção, o ErrorBoundary mostra mensagem genérica sem expor detalhes internos
- React Query não retenta em erros de autenticação (JWT/401/403)

---

## Licença

MIT
