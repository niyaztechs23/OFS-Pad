create table if not exists public.notebooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  subject text not null check (subject in ('maths','science','english','history','computer')),
  is_rough boolean not null default false,
  content jsonb not null default '{"pages":[]}'::jsonb check (jsonb_typeof(content) = 'object'),
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notebooks_user_updated_idx
  on public.notebooks (user_id, updated_at desc);

alter table public.notebooks enable row level security;

drop policy if exists "students read own notebooks" on public.notebooks;
drop policy if exists "students create own notebooks" on public.notebooks;
drop policy if exists "students update own notebooks" on public.notebooks;
drop policy if exists "students delete own notebooks" on public.notebooks;

create policy "students read own notebooks" on public.notebooks
  for select using (user_id = auth.uid());

create policy "students create own notebooks" on public.notebooks
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'student')
  );

create policy "students update own notebooks" on public.notebooks
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "students delete own notebooks" on public.notebooks
  for delete using (user_id = auth.uid());

grant select, insert, update, delete on public.notebooks to authenticated;
revoke all on public.notebooks from anon;
