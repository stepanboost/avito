-- ШАГ 1: Создать таблицы
-- Запустите этот файл в SQL Editor

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  phone text,
  city text,
  avatar_url text,
  role text default 'user',
  banned boolean default false,
  created_at timestamptz default now()
);

create table if not exists categories (
  id serial primary key,
  name text not null,
  slug text unique not null
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric(12,2),
  category_id int references categories(id),
  city text,
  photos text[],
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade not null,
  buyer_id uuid references profiles(id) on delete cascade not null,
  seller_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(listing_id, buyer_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);
