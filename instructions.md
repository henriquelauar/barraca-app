# Barraca App — Handoff para continuação por LLM

## Visão geral

**Barraca App** é uma aplicação web para gerenciamento da república **Barraca Armada**.

A aplicação **não é multi-república**. Toda a modelagem e a lógica foram simplificadas para funcionar apenas para uma única casa. Isso significa que:

- não existe mais conceito de múltiplas repúblicas;
- todos os moradores pertencem implicitamente à Barraca Armada;
- a tabela `republicas` foi removida da modelagem;
- `moradores` é a entidade central para representar as pessoas da casa;
- `auth.users` representa apenas quem pode acessar o sistema.

A inspiração principal para o módulo financeiro é o **Splitwise**:
- registrar gastos;
- definir quem pagou;
- definir para quem foi o gasto;
- dividir automaticamente;
- calcular saldos;
- resumir “quem deve para quem”.

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase**
  - Auth
  - PostgreSQL
  - RLS

---

## Decisões de arquitetura importantes

### 1. Aplicação de república única
A aplicação foi simplificada para atender apenas a **Barraca Armada**.

**Consequências:**
- não usar tabela `republicas`;
- não usar `republica_id` em `moradores`;
- não reintroduzir lógica multi-tenant/multi-república.

### 2. Moradores podem existir sem login
A tabela `moradores` representa as pessoas da casa, independentemente de terem acesso ao sistema.

Por isso:
- `user_id` em `moradores` é **opcional**;
- um morador pode existir sem conta;
- quando uma pessoa cria conta, ela pode ser vinculada a um `moradores.user_id`.

### 3. Auth e moradores são coisas diferentes
- `auth.users`: usuários autenticáveis do Supabase;
- `moradores`: pessoas da casa.

Nem todo morador precisa estar em `auth.users`.

### 4. Módulo de gastos estilo Splitwise
Cada gasto precisa separar:
- **quem pagou**
- **para quem o gasto foi feito**
- **como ele é dividido**

Por isso a modelagem financeira foi quebrada em:
- `gastos`
- `gasto_destinos`
- `gasto_divisoes`

---

## Estrutura lógica atual

## Moradores

Tabela principal para os moradores da casa.

### Estrutura esperada

```sql
create table moradores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  nome text not null,
  email text not null unique,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
Regras

email é único;

user_id é opcional;

user_id é único;

morador pode ser desativado via ativo.

Gastos
Tabela gastos

Guarda os dados principais do gasto.

create table gastos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  valor_total numeric(10,2) not null check (valor_total > 0),
  categoria text,
  data_gasto date not null default current_date,
  pagador_morador_id uuid not null references moradores(id) on delete restrict,
  criado_por uuid references auth.users(id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
Tabela gasto_destinos

Define para quem o gasto foi feito.

create table gasto_destinos (
  id uuid primary key default gen_random_uuid(),
  gasto_id uuid not null references gastos(id) on delete cascade,
  morador_id uuid references moradores(id) on delete cascade,
  tipo_destino text not null check (tipo_destino in ('casa', 'morador')),
  criado_em timestamptz not null default now(),
  check (
    (tipo_destino = 'casa' and morador_id is null)
    or
    (tipo_destino = 'morador' and morador_id is not null)
  )
);
Tabela gasto_divisoes

Define quanto cada morador deve dentro do gasto.

create table gasto_divisoes (
  id uuid primary key default gen_random_uuid(),
  gasto_id uuid not null references gastos(id) on delete cascade,
  morador_id uuid not null references moradores(id) on delete cascade,
  valor_devido numeric(10,2) not null check (valor_devido >= 0),
  valor_pago numeric(10,2) not null default 0,
  criado_em timestamptz not null default now(),
  unique (gasto_id, morador_id)
);
Como o gasto funciona hoje

Ao criar um gasto, o usuário informa:

nome do gasto;

valor total;

data;

categoria;

descrição opcional;

quem pagou (pagador_morador_id);

para quem foi o gasto:

Casa

ou moradores específicos

Regras atuais de comportamento

se o destino for Casa, o gasto é dividido entre todos os moradores ativos;

se o destino for moradores específicos, o gasto é dividido apenas entre os selecionados;

a divisão é igualitária, com ajuste por centavos;

o pagador recebe crédito pelo valor total;

cada participante recebe um débito em gasto_divisoes.

Resultado

É possível calcular:

total pago por morador;

total devido por morador;

saldo líquido por morador;

resumo “quem deve para quem”.

Funcionalidades implementadas
1. Autenticação
Status: implementado
Fluxo atual

login via Supabase Auth;

cadastro via Supabase Auth;

logout;

redirecionamento após login.

Regras

no cadastro, a aplicação cria o usuário em auth.users;

em seguida, também cria o registro em moradores;

não existe mais criação de republica.

Importante

O fluxo de login/cadastro foi ajustado para usar corretamente Server Actions com useFormState.

2. Página de Moradores
Status: implementado
Funcionalidades

listar moradores;

adicionar morador;

remover morador;

mostrar se o morador possui conta vinculada (user_id) ou não.

Regras

não depende de republica_id;

qualquer usuário autenticado pode ver/gerenciar moradores;

não criar conta Auth ao adicionar morador pela tela;

adicionar morador só cria registro em moradores.

Observação

A remoção impede autoexclusão quando a lógica usa user_id do usuário autenticado.

3. Página de Gastos
Status: implementado
Funcionalidades

adicionar gasto;

listar gastos;

remover gasto;

escolher quem pagou;

escolher para quem o gasto foi feito;

calcular divisão automaticamente;

mostrar lista de divisões;

mostrar resumo de saldos;

mostrar “quem deve para quem”.

UX atual

O formulário de gastos possui:

nome do gasto;

valor total;

data;

categoria;

descrição;

quem pagou;

para quem pagou:

Casa

moradores específicos

Regras de UI

“Casa” e “moradores específicos” são mutuamente exclusivos;

quando o usuário escolhe “Casa”, o gasto é dividido entre todos os moradores ativos;

quando escolhe moradores específicos, só os marcados entram na divisão.

Resumo financeiro implementado

Existe lógica para calcular:

1. Resumo por morador

Para cada morador:

total pago;

total devido;

saldo líquido.

Fórmula:

saldo = total_pago - total_devido
2. Encontro de contas

Com base nos saldos:

quem tem saldo positivo é credor;

quem tem saldo negativo é devedor;

o sistema simplifica o pagamento em transferências mínimas.

Exemplo:

João deve R$ 32,50 para Henrique

Maria deve R$ 18,00 para João

Problemas já resolvidos
1. Usuário autenticado não aparecia em moradores
Causa

O fluxo anterior criava Auth, mas não garantia o insert em moradores.

Solução

O cadastro foi ajustado para:

criar Auth;

criar moradores;

falhar se o insert em moradores falhar.

2. Módulo de moradores dependia de republica_id
Causa

A lógica vinha do modelo antigo de múltiplas repúblicas.

Solução

O módulo foi refeito para república única, removendo toda dependência de republica_id.

3. Erro com signIn is not a function
Causa

Uso incorreto de Server Action dentro de callback no useFormState.

Solução

Passar a Server Action diretamente para useFormState.

4. Erro com listarGastos is not a function
Causa provável

Problema de export/caching/build após refatoração.

Solução

Substituição consistente de lib/actions/gastos.ts e limpeza de cache .next.

Organização de arquivos esperada
app/
  (auth)/
    login/
    signup/
  (dashboard)/
    gastos/
      page.tsx
    moradores/
      page.tsx

components/
  auth/
    login-form.tsx
    signup-form.tsx
  gastos/
    add-gasto-form.tsx
  moradores/
    add-morador-form.tsx
  ui/
    button.tsx
    card.tsx
    input.tsx

lib/
  actions/
    auth.ts
    gastos.ts
    moradores.ts
  supabase/
    server.ts
    client.ts
    middleware.ts
Estado atual do produto

Hoje o sistema já permite:

Autenticação

criar conta

login

logout

Moradores

cadastrar moradores

listar moradores

remover moradores

Gastos

cadastrar gastos

definir quem pagou

definir se o gasto foi para Casa ou moradores específicos

dividir automaticamente

listar gastos

remover gastos

mostrar saldo por morador

mostrar quem deve para quem

O que ainda falta implementar
Prioridade alta
1. Quitação / pagamento de dívidas

Ainda não existe fluxo para registrar que uma dívida foi paga.

Hoje o sistema:

calcula quem deve;

mas não permite registrar pagamento real.

Solução recomendada

Criar uma tabela de pagamentos, por exemplo:

create table pagamentos (
  id uuid primary key default gen_random_uuid(),
  de_morador_id uuid not null references moradores(id) on delete cascade,
  para_morador_id uuid not null references moradores(id) on delete cascade,
  valor numeric(10,2) not null check (valor > 0),
  data_pagamento date not null default current_date,
  observacao text,
  criado_por uuid references auth.users(id) on delete set null,
  criado_em timestamptz not null default now()
);

Depois, os saldos líquidos precisam considerar:

gastos/divisões

pagamentos registrados

Prioridade média
2. Edição de gastos

Ainda não existe edição.
Hoje só é possível:

criar

listar

remover

3. Inativar morador em vez de remover

Atualmente existe remoção.
Seria melhor:

manter histórico;

permitir ativo = false.

4. Melhorias visuais no estilo Splitwise

Melhorias possíveis:

cards com destaque de credor/devedor;

resumo visual de saldo;

badges de categoria;

filtros por período;

filtros por morador;

lista agrupada por mês.

5. Dashboard inicial

Criar uma home do dashboard com:

total de gastos do mês;

quantidade de moradores ativos;

maiores devedores;

maiores credores;

gastos recentes.

Prioridade futura
6. Tarefas domésticas

Módulo futuro:

tarefa;

responsável;

status;

data limite;

recorrência.

7. Empréstimos

Módulo futuro:

empréstimos diretos entre moradores;

integração com saldo geral.

8. Fechamento mensal

Criar visão mensal com:

gastos do mês;

saldo de cada morador;

pagamentos realizados;

pendências.

Regras e cuidados para próximas implementações
1. Não reintroduzir multi-república

A aplicação é de casa única.
Não usar:

republicas

republica_id

políticas ou queries por república

2. Manter moradores como entidade principal da casa

Toda lógica da casa deve girar em torno de moradores.

3. Manter compatibilidade com gastos atuais

Qualquer evolução futura deve respeitar a modelagem:

gastos

gasto_destinos

gasto_divisoes

4. Sempre tratar centavos corretamente

Divisões monetárias devem:

trabalhar com arredondamento consistente;

preferencialmente dividir em centavos e redistribuir o resto.

5. Preferir Server Actions

A estrutura atual usa:

Server Actions;

useFormState;

revalidação com revalidatePath.

Manter esse padrão.

6. Sempre considerar usuários autenticados e moradores separadamente

Nem todo morador tem conta.
Nem todo fluxo deve depender de auth.users.

Próxima etapa recomendada para LLM

A próxima implementação recomendada é:

Implementar pagamento/quitação de dívidas
Objetivo

Permitir registrar que um morador pagou outro.

Entrega mínima recomendada

criar tabela pagamentos;

criar lib/actions/pagamentos.ts;

criar seção na página de gastos ou página própria de pagamentos;

recalcular saldos descontando pagamentos já feitos;

mostrar histórico de pagamentos.

Regra de cálculo futura

Saldo final por morador deve considerar:

saldo_final = total_pago_em_gastos - total_devido_em_divisoes + total_recebido_em_pagamentos - total_pago_em_pagamentos
Resumo executivo para outro LLM

A aplicação Barraca App já possui:

login/cadastro funcionando;

moradores funcionando;

gastos funcionando;

divisão automática funcionando;

resumo financeiro funcionando.

As próximas implementações devem continuar sobre o modelo de república única e manter a inspiração do Splitwise.

A próxima prioridade técnica é implementar pagamentos/quitação.

Não regredir para o modelo antigo com republicas.
Não reintroduzir republica_id.
Não acoplar tudo em auth.users.
Usar moradores como entidade principal da casa.


Se você quiser, eu também posso te mandar uma **versão mais curta e mais “operacional”**, pensada es