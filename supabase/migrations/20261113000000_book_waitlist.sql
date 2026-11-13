create table if not exists public.book_waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint book_waitlist_email_unique unique (email)
);

alter table public.book_waitlist enable row level security;

revoke all on public.book_waitlist from anon, authenticated;
grant insert, select on public.book_waitlist to service_role;
