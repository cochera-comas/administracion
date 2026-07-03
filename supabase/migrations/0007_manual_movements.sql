create type public.movement_type as enum ('income', 'expense');

create table public.manual_movements (
  id uuid primary key default gen_random_uuid(),
  type public.movement_type not null,
  category text not null,
  description text,
  amount numeric(10,2) not null check (amount >= 0),
  movement_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_manual_movements_date on public.manual_movements (movement_date);
create index idx_manual_movements_type on public.manual_movements (type);

create trigger trg_manual_movements_updated_at before update on public.manual_movements for each row execute function public.set_updated_at();

alter table public.manual_movements enable row level security;

create policy "authenticated_full_access_manual_movements" on public.manual_movements for all to authenticated using (true) with check (true);
