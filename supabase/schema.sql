-- ============================================
-- Avito Clone — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  phone text,
  city text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  banned boolean default false,
  created_at timestamptz default now()
);

-- 2. Categories
create table if not exists categories (
  id serial primary key,
  name text not null,
  slug text unique not null
);

-- 3. Listings
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric(12,2),
  category_id int references categories(id),
  city text,
  photos text[],
  status text default 'active' check (status in ('active', 'sold', 'deleted')),
  created_at timestamptz default now()
);

-- 4. Conversations
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade not null,
  buyer_id uuid references profiles(id) on delete cascade not null,
  seller_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(listing_id, buyer_id)
);

-- 5. Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- ============================================
-- Seed categories
-- ============================================
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

-- ============================================
-- Auto-create profile on signup trigger
-- ============================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- Enable Row Level Security
-- ============================================
alter table profiles enable row level security;
alter table listings enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table categories enable row level security;

-- ============================================
-- RLS Policies: profiles
-- ============================================
create policy "Anyone can read profiles"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ============================================
-- RLS Policies: categories
-- ============================================
create policy "Anyone can read categories"
  on categories for select using (true);

-- ============================================
-- RLS Policies: listings
-- ============================================
create policy "Anyone can read active listings"
  on listings for select using (status = 'active' or user_id = auth.uid());

create policy "Authenticated users can insert listings"
  on listings for insert with check (auth.uid() = user_id);

create policy "Users can update own listings"
  on listings for update using (auth.uid() = user_id);

create policy "Users can delete own listings"
  on listings for delete using (auth.uid() = user_id);

-- ============================================
-- RLS Policies: conversations
-- ============================================
create policy "Participants can read conversations"
  on conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Buyer can create conversation"
  on conversations for insert
  with check (auth.uid() = buyer_id);

-- ============================================
-- RLS Policies: messages
-- ============================================
create policy "Participants can read messages"
  on messages for select
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "Participants can send messages"
  on messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- ============================================
-- Storage bucket: listing-photos
-- Run separately in Supabase dashboard Storage section
-- or uncomment if using supabase CLI:
-- ============================================
-- insert into storage.buckets (id, name, public)
-- values ('listing-photos', 'listing-photos', true)
-- on conflict (id) do nothing;

-- create policy "Public read listing photos"
--   on storage.objects for select
--   using (bucket_id = 'listing-photos');

-- create policy "Authenticated users can upload"
--   on storage.objects for insert
--   with check (bucket_id = 'listing-photos' and auth.role() = 'authenticated');

-- create policy "Users can delete own photos"
--   on storage.objects for delete
--   using (bucket_id = 'listing-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- Admin helper: update user role
-- Usage: select set_user_role('user-uuid', 'admin');
-- ============================================
create or replace function set_user_role(target_user_id uuid, new_role text)
returns void as $$
begin
  update profiles set role = new_role where id = target_user_id;
end;
$$ language plpgsql security definer;
