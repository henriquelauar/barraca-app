create table public.tarefas_avulsas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  data_limite date not null,
  status text not null default 'pendente',
  criado_por uuid references public.moradores(id) on delete set null,
  responsavel_morador_id uuid references public.moradores(id) on delete set null,
  concluida_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint tarefas_avulsas_titulo_nao_vazio
    check (char_length(trim(titulo)) > 0),

  constraint tarefas_avulsas_status_valido
    check (status in ('pendente', 'em_andamento', 'concluida'))
);

create index idx_tarefas_avulsas_status
  on public.tarefas_avulsas(status);

create index idx_tarefas_avulsas_data_limite
  on public.tarefas_avulsas(data_limite);

create index idx_tarefas_avulsas_responsavel
  on public.tarefas_avulsas(responsavel_morador_id);

create index idx_tarefas_avulsas_criado_por
  on public.tarefas_avulsas(criado_por);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists trg_tarefas_avulsas_updated_at on public.tarefas_avulsas;

create trigger trg_tarefas_avulsas_updated_at
before update on public.tarefas_avulsas
for each row
execute function public.set_updated_at();

alter table public.tarefas_avulsas enable row level security;

create policy "Usuarios autenticados podem ver tarefas avulsas"
on public.tarefas_avulsas
for select
to authenticated
using (true);

create policy "Usuarios autenticados podem criar tarefas avulsas"
on public.tarefas_avulsas
for insert
to authenticated
with check (true);

create policy "Usuarios autenticados podem atualizar tarefas avulsas"
on public.tarefas_avulsas
for update
to authenticated
using (true)
with check (true);

create policy "Usuarios autenticados podem remover tarefas avulsas"
on public.tarefas_avulsas
for delete
to authenticated
using (true);