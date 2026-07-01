create table public.hourly_rentals (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.parking_spots (id) on delete cascade,
  renter_name text not null,
  vehicle_plate text,
  rental_date date not null default current_date,
  hours numeric(5,2) not null check (hours > 0),
  amount numeric(10,2) not null check (amount >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_hourly_rentals_date on public.hourly_rentals (rental_date);
create index idx_hourly_rentals_spot on public.hourly_rentals (spot_id);

create trigger trg_hourly_rentals_updated_at before update on public.hourly_rentals for each row execute function public.set_updated_at();

alter table public.hourly_rentals enable row level security;

create policy "authenticated_full_access_hourly_rentals" on public.hourly_rentals for all to authenticated using (true) with check (true);
