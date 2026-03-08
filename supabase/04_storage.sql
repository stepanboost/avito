-- ШАГ 4: Storage bucket для фото (запустите после создания bucket в Dashboard)
-- Сначала создайте bucket вручную: Storage → New bucket → "listing-photos" (public: on)
-- Потом запустите этот SQL:

create policy "Public read listing photos"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (bucket_id = 'listing-photos' and auth.role() = 'authenticated');

create policy "Users can delete own photos"
  on storage.objects for delete
  using (bucket_id = 'listing-photos' and auth.uid()::text = (storage.foldername(name))[1]);
