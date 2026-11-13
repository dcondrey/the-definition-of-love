-- Lower the signup barrier: email alone is enough.
alter table public.book_waitlist alter column name drop not null;
