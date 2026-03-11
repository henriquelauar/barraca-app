# Barraca — Administração da República

Aplicativo para gerenciar repúblicas: divisão de gastos, tarefas, empréstimos e mais.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Auth, PostgreSQL, Realtime)

## Setup

1. Instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase (disponíveis em [supabase.com/dashboard](https://supabase.com/dashboard)).

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura do Projeto

```
app/
├── (auth)/          # Login, cadastro
├── (dashboard)/     # Gastos, tarefas, moradores
lib/
├── supabase/        # Cliente Supabase (browser, server, middleware)
├── actions/         # Server Actions
├── db/              # Tipos e queries
└── utils/           # Helpers (divisão de gastos, etc.)
components/
├── ui/              # Componentes base (Button, Card)
└── ...              # Componentes por módulo
```

## Etapa 1 — Concluída

- [x] Configurar Supabase Auth
- [x] Fluxo de login/cadastro
- [x] CRUD de moradores
- [x] Proteção de rotas (redireciona para login)
- [x] Criar república no cadastro

## Próximos Passos (Etapa 2)

- [ ] Módulo de gastos
