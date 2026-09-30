-- Favorites table for the "Save favorites" feature.
-- Run this once in the Supabase SQL editor (Mkay-cloud's Munchly project).

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, recipe_slug)
);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can add their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);
