# Task List Manager

Uma aplicação responsiva de gerenciamento de projetos e tarefas com armazenamento local (localStorage), construída com React 19, Vite e Tailwind CSS.

## Características

- ✅ **Gerenciamento de Projetos**: Crie e organize múltiplos projetos
- ✅ **Gerenciamento de Tarefas**: Adicione, edite e delete tarefas
- ✅ **Status e Prioridade**: Controle o status (pendente, em progresso, concluído) e prioridade (baixa, média, alta) das tarefas
- ✅ **Filtros Avançados**: Busque por título/descrição, filtre por status e prioridade
- ✅ **Armazenamento Local**: Todos os dados são salvos no localStorage do navegador
- ✅ **Design Responsivo**: Interface otimizada para desktop, tablet e mobile
- ✅ **Estatísticas**: Visualize progresso dos projetos em tempo real

## Stack Tecnológico

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**: React Context + localStorage
- **Package Manager**: pnpm

## Instalação Local

### Pré-requisitos

- Node.js 18+ 
- pnpm (ou npm/yarn)

### Passos

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd task-list-manager
```

2. Instale as dependências:
```bash
pnpm install
```

3. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## Desenvolvimento

### Comandos Disponíveis

- `pnpm dev` - Inicia o servidor de desenvolvimento
- `pnpm build` - Compila para produção
- `pnpm preview` - Visualiza a build de produção localmente
- `pnpm check` - Verifica tipos TypeScript
- `pnpm format` - Formata o código com Prettier

## Deploy no Vercel

### Opção 1: Via Git (Recomendado)

1. Faça push do projeto para GitHub, GitLab ou Bitbucket
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Selecione seu repositório
5. Vercel detectará automaticamente as configurações (Vite)
6. Clique em "Deploy"

### Opção 2: Via Vercel CLI

1. Instale a CLI do Vercel:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Siga as instruções interativas

### Opção 3: Via ZIP (Este Projeto)

1. Extraia o arquivo ZIP
2. Abra o terminal na pasta do projeto
3. Execute `pnpm install` e `pnpm build`
4. Faça upload da pasta `dist/` para o Vercel

## Estrutura do Projeto

```
task-list-manager/
├── client/
│   ├── public/           # Arquivos estáticos
│   ├── src/
│   │   ├── components/   # Componentes React reutilizáveis
│   │   ├── contexts/     # React Contexts (AppContext)
│   │   ├── hooks/        # Custom hooks (useLocalStorage)
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── App.tsx       # Componente raiz
│   │   ├── main.tsx      # Entry point
│   │   └── index.css     # Estilos globais
│   └── index.html        # Template HTML
├── shared/
│   └── types.ts          # Tipos TypeScript compartilhados
├── server/               # Placeholder para compatibilidade
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── vercel.json           # Configuração do Vercel
└── README.md
```

## Como Usar

### Criar um Projeto

1. Clique em "Novo Projeto" na sidebar
2. Digite o nome e descrição (opcional)
3. Escolha uma cor para o projeto
4. Clique em "Criar Projeto"

### Adicionar uma Tarefa

1. Selecione um projeto ou clique em "Todas as Tarefas"
2. Clique em "Nova Tarefa"
3. Preencha o título, selecione a prioridade
4. Clique em "Criar Tarefa"

### Gerenciar Tarefas

- **Mudar Status**: Clique no ícone de status (círculo) para ciclar entre pendente → em progresso → concluído
- **Editar**: Clique no menu (⋮) e selecione "Editar"
- **Deletar**: Clique no menu (⋮) e selecione "Deletar"
- **Filtrar**: Use os filtros de status e prioridade na parte superior

## Dados Locais

Todos os dados são armazenados no `localStorage` do navegador:
- `app-projects` - Lista de projetos
- `app-tasks` - Lista de tarefas

**Nota**: Os dados são específicos do navegador e dispositivo. Limpar o cache/cookies do navegador resultará em perda de dados.

## Design

A aplicação segue o design **Minimalismo Funcional com Acentos Quentes**:
- **Cores Primárias**: Laranja quente (#FF6B35) para ações principais
- **Paleta Neutra**: Tons de cinza para foco e clareza
- **Tipografia**: Poppins para títulos, Inter para corpo
- **Espaçamento**: Generoso e respirável
- **Interações**: Suaves e responsivas

## Responsividade

A aplicação é totalmente responsiva:
- **Desktop**: Layout com sidebar + conteúdo principal
- **Tablet**: Sidebar colapsível, grid 2 colunas
- **Mobile**: Sidebar como drawer, grid 1 coluna

## Performance

- Builds otimizados com Vite
- Code splitting automático
- Lazy loading de componentes
- Caching eficiente com localStorage

## Troubleshooting

### Dados não aparecem após reload
Verifique se o localStorage está habilitado no seu navegador.

### Aplicação lenta
Limpe o cache do navegador ou localStorage se houver muitas tarefas (>1000).

### Erro ao fazer build
Execute `pnpm install` novamente e certifique-se de usar Node.js 18+.

## Licença

MIT

## Suporte

Para reportar bugs ou sugerir melhorias, abra uma issue no repositório.
