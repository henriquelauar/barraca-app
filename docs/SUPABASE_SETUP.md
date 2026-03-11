# Como criar o projeto no Supabase

Passo a passo para configurar o Supabase para o Barraca App.

---

## 1. Acesse o Supabase

1. Abra **[database.new](https://database.new)** no navegador  
   (ou acesse [supabase.com](https://supabase.com) e clique em **Start your project**)

2. Faça login com **GitHub**, **Google** ou **e-mail**

---

## 2. Crie um novo projeto

1. Clique em **New Project**

2. Preencha:
   - **Organization**: use a padrão ou crie uma nova
   - **Name**: `barraca-app` (ou o nome que preferir)
   - **Database Password**: crie uma senha forte e **guarde** (será usada para acessar o banco)
   - **Region**: escolha a mais próxima (ex: `South America (São Paulo)`)

3. Clique em **Create new project**

4. Aguarde 1–2 minutos até o projeto ficar pronto (status verde)

---

## 3. Copie as credenciais

1. No menu lateral, vá em **Project Settings** (ícone de engrenagem)

2. Clique em **API** na barra lateral

3. Na seção **Project URL**, copie a URL (ex: `https://xxxxxxxx.supabase.co`)

4. Na seção **Project API keys**:
   - Copie a chave **anon** (pública) — começa com `eyJ...`  
   - ⚠️ **Não** compartilhe a chave **service_role** (secreta)

---

## 4. Configure o .env.local no projeto

1. Na raiz do projeto `barraca-app`, copie o arquivo de exemplo:
   ```bash
   cp .env.local.example .env.local
   ```

2. Abra o `.env.local` e preencha:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Salve o arquivo

---

## 5. Teste a conexão

1. Rode o app:
   ```bash
   npm run dev
   ```

2. Acesse http://localhost:3000

Se não houver erro de variáveis Supabase no console, a configuração está correta.

---

## 6. Criar as tabelas (Etapa 1)

Execute o SQL do arquivo `supabase/migrations/001_republicas_moradores.sql` no **SQL Editor** do Supabase:

1. Abra o SQL Editor no dashboard
2. Cole o conteúdo do arquivo
3. Clique em **Run**

---

## Onde encontrar cada coisa no dashboard

| O que você precisa    | Onde encontrar                              |
|-----------------------|---------------------------------------------|
| URL do projeto        | Project Settings → API → Project URL        |
| Chave anon            | Project Settings → API → anon public        |
| Editor SQL            | SQL Editor (menu lateral)                   |
| Tabelas               | Table Editor (menu lateral)                 |
| Usuários/Auth         | Authentication (menu lateral)               |
