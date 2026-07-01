alter table public.clients drop column spot_number;

create table public.parking_spots (
  id uuid primary key default gen_random_uuid(),
  gate text not null,
  row_label text not null,
  row_order int not null,
  position int not null,
  spot_label text not null,
  client_id uuid references public.clients (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parking_spots_gate_label_unique unique (gate, spot_label)
);
-- Nota: un cliente puede tener más de una cochera (ej. auto + moto), por eso
-- client_id NO tiene índice único acá.
create index idx_parking_spots_client on public.parking_spots (client_id);
create index idx_parking_spots_gate on public.parking_spots (gate);

create trigger trg_parking_spots_updated_at before update on public.parking_spots for each row execute function public.set_updated_at();

alter table public.parking_spots enable row level security;

create policy "authenticated_full_access_parking_spots" on public.parking_spots for all to authenticated using (true) with check (true);
