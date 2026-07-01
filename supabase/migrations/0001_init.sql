create extension if not exists "pgcrypto";

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  vehicle_plate text not null,
  vehicle_description text,
  spot_number text not null,
  monthly_fee numeric(10,2) not null check (monthly_fee >= 0),
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_clients_active on public.clients (is_active);

create table public.guards (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  shift_label text,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type public.payment_status as enum ('paid', 'pending', 'late');
create type public.payment_method as enum ('cash', 'transfer', 'card', 'other');

create table public.client_payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  period date not null,
  amount numeric(10,2) not null check (amount >= 0),
  payment_date date,
  method public.payment_method,
  status public.payment_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_payments_period_is_month_start check (period = date_trunc('month', period)::date),
  constraint client_payments_client_period_unique unique (client_id, period)
);
create index idx_client_payments_period on public.client_payments (period);
create index idx_client_payments_status on public.client_payments (status);
create index idx_client_payments_client on public.client_payments (client_id);

create table public.guard_payments (
  id uuid primary key default gen_random_uuid(),
  guard_id uuid not null references public.guards (id) on delete cascade,
  period_label text not null,
  period_start date not null,
  period_end date not null,
  amount numeric(10,2) not null check (amount >= 0),
  payment_date date not null default current_date,
  method public.payment_method,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guard_payments_period_valid check (period_end >= period_start)
);
create index idx_guard_payments_period on public.guard_payments (period_start, period_end);
create index idx_guard_payments_guard on public.guard_payments (guard_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_clients_updated_at before update on public.clients for each row execute function public.set_updated_at();
create trigger trg_guards_updated_at before update on public.guards for each row execute function public.set_updated_at();
create trigger trg_client_payments_updated_at before update on public.client_payments for each row execute function public.set_updated_at();
create trigger trg_guard_payments_updated_at before update on public.guard_payments for each row execute function public.set_updated_at();

create or replace view public.v_monthly_summary as
select
  period,
  sum(amount) filter (where status = 'paid') as total_income_paid,
  sum(amount) filter (where status in ('pending','late')) as total_income_pending,
  count(*) filter (where status = 'paid') as paid_count,
  count(*) filter (where status = 'pending') as pending_count,
  count(*) filter (where status = 'late') as late_count
from public.client_payments
group by period;

alter table public.clients enable row level security;
alter table public.guards enable row level security;
alter table public.client_payments enable row level security;
alter table public.guard_payments enable row level security;

create policy "authenticated_full_access_clients" on public.clients for all to authenticated using (true) with check (true);
create policy "authenticated_full_access_guards" on public.guards for all to authenticated using (true) with check (true);
create policy "authenticated_full_access_client_payments" on public.client_payments for all to authenticated using (true) with check (true);
create policy "authenticated_full_access_guard_payments" on public.guard_payments for all to authenticated using (true) with check (true);

grant select on public.v_monthly_summary to authenticated;
