create table public.emprestimos (
  id uuid primary key default gen_random_uuid(),
  nome_item text not null,
  tipo text not null,
  data_emprestimo date not null,
  status text not null default 'em_aberto',
  pessoa_nome text not null,
  pessoa_republica text,
  observacao text,
  data_devolucao date,
  criado_por uuid references public.moradores(id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint emprestimos_nome_item_nao_vazio
    check (char_length(trim(nome_item)) > 0),

  constraint emprestimos_pessoa_nome_nao_vazio
    check (char_length(trim(pessoa_nome)) > 0),

  constraint emprestimos_tipo_valido
    check (tipo in ('emprestei', 'peguei_emprestado')),

  constraint emprestimos_status_valido
    check (status in ('em_aberto', 'devolvido')),

  constraint emprestimos_devolucao_coerente
    check (
      data_devolucao is null
      or data_devolucao >= data_emprestimo
    )
);

create index idx_emprestimos_status
  on public.emprestimos(status);

create index idx_emprestimos_tipo
  on public.emprestimos(tipo);

create index idx_emprestimos_data_emprestimo
  on public.emprestimos(data_emprestimo desc);

create index idx_emprestimos_pessoa_nome
  on public.emprestimos(pessoa_nome);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists trg_emprestimos_updated_at on public.emprestimos;

create trigger trg_emprestimos_updated_at
before update on public.emprestimos
for each row
execute function public.set_updated_at();

alter table public.emprestimos enable row level security;

create policy "Usuarios autenticados podem ver emprestimos"
on public.emprestimos
for select
to authenticated
using (true);

create policy "Usuarios autenticados podem criar emprestimos"
on public.emprestimos
for insert
to authenticated
with check (true);

create policy "Usuarios autenticados podem atualizar emprestimos"
on public.emprestimos
for update
to authenticated
using (true)
with check (true);

create policy "Usuarios autenticados podem remover emprestimos"
on public.emprestimos
for delete
to authenticated
using (true);