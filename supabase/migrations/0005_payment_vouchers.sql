alter table public.client_payments add column voucher_path text;
alter table public.client_payments add column voucher_verified boolean not null default false;

insert into storage.buckets (id, name, public) values ('vouchers', 'vouchers', false);

create policy "authenticated_read_vouchers" on storage.objects for select to authenticated using (bucket_id = 'vouchers');
create policy "authenticated_upload_vouchers" on storage.objects for insert to authenticated with check (bucket_id = 'vouchers');
create policy "authenticated_delete_vouchers" on storage.objects for delete to authenticated using (bucket_id = 'vouchers');
