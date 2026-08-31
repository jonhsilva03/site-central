begin;

-- Somente usuários incluídos nesta tabela podem administrar a loja.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from public, anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Remove políticas antigas para não deixar permissões anônimas ativas.
do $$
declare
  politica record;
begin
  for politica in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('produtos', 'categorias', 'movimentacoes_estoque')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      politica.policyname,
      politica.schemaname,
      politica.tablename
    );
  end loop;
end
$$;

alter table public.produtos enable row level security;
alter table public.categorias enable row level security;
alter table public.movimentacoes_estoque enable row level security;

revoke all on table public.produtos from anon;
revoke all on table public.categorias from anon;
revoke all on table public.movimentacoes_estoque from anon;

grant select, insert, update, delete on table public.produtos to authenticated;
grant select, insert, update, delete on table public.categorias to authenticated;
grant select, insert, update, delete on table public.movimentacoes_estoque to authenticated;

create policy "Administradores gerenciam produtos"
on public.produtos
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Administradores gerenciam categorias"
on public.categorias
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Administradores gerenciam movimentacoes"
on public.movimentacoes_estoque
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create or replace function public.movimentar_estoque(
  p_produto_id uuid,
  p_tipo text,
  p_quantidade integer,
  p_motivo text default null,
  p_observacao text default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_estoque_anterior public.produtos.estoque%type;
  v_estoque_posterior public.produtos.estoque%type;
  v_movimentacao_id public.movimentacoes_estoque.id%type;
begin
  if not public.is_admin() then
    raise exception 'Acesso negado.' using errcode = '42501';
  end if;

  if p_produto_id is null then
    raise exception 'Produto não informado.';
  end if;

  if p_tipo is null or p_tipo not in ('entrada', 'saida', 'ajuste', 'devolucao') then
    raise exception 'Tipo de movimentação inválido.';
  end if;

  if p_quantidade is null
    or (p_tipo = 'ajuste' and p_quantidade < 0)
    or (p_tipo <> 'ajuste' and p_quantidade <= 0)
  then
    raise exception 'Quantidade inválida.';
  end if;

  select coalesce(estoque, 0)
    into v_estoque_anterior
  from public.produtos
  where id = p_produto_id
  for update;

  if not found then
    raise exception 'Produto não encontrado.';
  end if;

  case p_tipo
    when 'entrada' then
      v_estoque_posterior := v_estoque_anterior + p_quantidade;
    when 'devolucao' then
      v_estoque_posterior := v_estoque_anterior + p_quantidade;
    when 'saida' then
      v_estoque_posterior := v_estoque_anterior - p_quantidade;
    when 'ajuste' then
      v_estoque_posterior := p_quantidade;
  end case;

  if v_estoque_posterior < 0 then
    raise exception 'Estoque insuficiente para esta saída.';
  end if;

  update public.produtos
  set estoque = v_estoque_posterior
  where id = p_produto_id;

  insert into public.movimentacoes_estoque (
    produto_id,
    tipo,
    quantidade,
    estoque_anterior,
    estoque_posterior,
    motivo,
    observacao
  )
  values (
    p_produto_id,
    p_tipo,
    p_quantidade,
    v_estoque_anterior,
    v_estoque_posterior,
    nullif(trim(p_motivo), ''),
    nullif(trim(p_observacao), '')
  )
  returning id into v_movimentacao_id;

  return json_build_object(
    'movimentacao_id', v_movimentacao_id,
    'produto_id', p_produto_id,
    'estoque_anterior', v_estoque_anterior,
    'estoque_posterior', v_estoque_posterior
  );
end;
$$;

revoke all on function public.movimentar_estoque(uuid, text, integer, text, text)
from public, anon;

grant execute on function public.movimentar_estoque(uuid, text, integer, text, text)
to authenticated;

commit;

-- Depois de criar o usuário em Authentication > Users, execute separadamente:
-- insert into public.admin_users (user_id)
-- select id from auth.users where lower(email) = lower('SEU_EMAIL_AQUI');
