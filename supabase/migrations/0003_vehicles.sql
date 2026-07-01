alter table public.clients drop column vehicle_plate;
alter table public.clients drop column vehicle_description;

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  plate text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicles_plate_unique unique (plate)
);
create index idx_vehicles_client on public.vehicles (client_id);

create trigger trg_vehicles_updated_at before update on public.vehicles for each row execute function public.set_updated_at();

alter table public.vehicles enable row level security;

create policy "authenticated_full_access_vehicles" on public.vehicles for all to authenticated using (true) with check (true);
