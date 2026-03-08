-- ШАГ 2: Заполнить категории и включить RLS

insert into categories (name, slug) values
  ('Транспорт', 'transport'),
  ('Электроника', 'electronics'),
  ('Одежда и обувь', 'clothing'),
  ('Недвижимость', 'realty'),
  ('Работа', 'jobs'),
  ('Услуги', 'services'),
  ('Для дома', 'home'),
  ('Другое', 'other')
on conflict (slug) do nothing;

-- Включить RLS
alter table profiles enable row level security;
alter table listings enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table categories enable row level security;

-- Политики profiles
create policy "Anyone can read profiles" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
-- Нужно для триггера handle_new_user (security definer не обходит RLS в Supabase)
create policy "Enable insert for trigger" on profiles for insert with check (true);

-- Политики categories
create policy "Anyone can read categories" on categories for select using (true);

-- Политики listings
create policy "Anyone can read active listings" on listings for select using (status = 'active' or user_id = auth.uid());
create policy "Authenticated users can insert listings" on listings for insert with check (auth.uid() = user_id);
create policy "Users can update own listings" on listings for update using (auth.uid() = user_id);
create policy "Users can delete own listings" on listings for delete using (auth.uid() = user_id);

-- Политики conversations
create policy "Participants can read conversations" on conversations for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Buyer can create conversation" on conversations for insert with check (auth.uid() = buyer_id);

-- Политики messages
create policy "Participants can read messages" on messages for select using (
  exists (select 1 from conversations c where c.id = messages.conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
);
create policy "Participants can send messages" on messages for insert with check (
  auth.uid() = sender_id and
  exists (select 1 from conversations c where c.id = messages.conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
);
