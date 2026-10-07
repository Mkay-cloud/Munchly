-- Cache table for machine-translated Sanity recipe/blog content.
-- Run this once in the Supabase SQL editor (Mkay-cloud's Munchly project).
--
-- Recipe and blog content lives in Sanity in English only. Rather than
-- translating it on every request, the server translates it once per
-- (content item, locale) via DeepL and stores the result here; later
-- requests for the same item/locale read the cached row instead of calling
-- DeepL again. source_hash is a hash of the original English fields - if
-- the recipe/post is edited in Sanity, the hash changes, the cached row is
-- treated as stale, and it's retranslated.
--
-- This table is only ever written from the server using the service role
-- key (see SUPABASE_SERVICE_ROLE_KEY in .env.example), which bypasses RLS
-- entirely - so there are deliberately no insert/update/delete policies
-- below. The anon key (used by regular pages) can only read it.

create table if not exists public.content_translations (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('recipe', 'blogPostSummary', 'blogPostFull')),
  content_id text not null,
  locale text not null,
  source_hash text not null,
  fields jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_type, content_id, locale)
);

create index if not exists content_translations_lookup
  on public.content_translations (content_type, content_id, locale);

alter table public.content_translations enable row level security;

create policy "Anyone can read cached translations"
  on public.content_translations for select
  using (true);
