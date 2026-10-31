-- OFS Pad realtime community feeds
alter table public.doubts replica identity full;
alter table public.announcements replica identity full;
alter table public.notifications replica identity full;
alter table public.submissions replica identity full;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'doubts') then alter publication supabase_realtime add table public.doubts; end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'announcements') then alter publication supabase_realtime add table public.announcements; end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications') then alter publication supabase_realtime add table public.notifications; end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'submissions') then alter publication supabase_realtime add table public.submissions; end if;
end $$;
