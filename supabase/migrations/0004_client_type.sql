create type public.client_type as enum ('owner', 'tenant');

alter table public.clients add column client_type public.client_type not null default 'owner';

-- Backfill best-effort: clientes cuyas notas ya mencionan "Inquilino" pasan a tenant.
update public.clients set client_type = 'tenant' where notes ilike '%inquilino%';
