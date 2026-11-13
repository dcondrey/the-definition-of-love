# The Definition of Love

Reader-list site for the forthcoming novel by David L. Condrey.

- Static site, deployed to GitHub Pages via Actions.
- Signup form posts to a Supabase Edge Function that writes to `public.book_waitlist`.

## Structure

```
index.html            # single-page site (2-col: cover + content/form, privacy slides in as a <dialog>)
styles.css            # all styles
app.js                # form handler
robots.txt            # SEO
sitemap.xml           # SEO
llms.txt              # AI-crawler summary
assets/               # cover.webp + cover-600/900.png (OG), cover.png (full jacket spread)
.github/workflows/    # Pages deploy with Supabase config injection
supabase/
  migrations/         # book_waitlist table (your supplied schema)
  functions/
    waitlist-signup/  # Deno edge function + unit tests
```

## One-time setup

### 1. GitHub repo + Pages
Repo already created at `github.com/dcondrey/the-definition-of-love`.
In repo Settings → Pages → Build and deployment: **GitHub Actions** (the workflow in this repo handles it).

### 2. Repo secrets
Settings → Secrets and variables → Actions → New repository secret:
- `SUPABASE_URL` — e.g. `https://abcxyz.supabase.co`
- `SUPABASE_ANON_KEY` — the project's anon public key

### 3. Supabase database
Run `supabase/migrations/20261113000000_book_waitlist.sql` in the SQL editor (or `supabase db push`).

### 4. Edge function
```
supabase link --project-ref <your-ref>
supabase secrets set ALLOWED_ORIGIN=https://dcondrey.github.io
supabase functions deploy waitlist-signup --no-verify-jwt
```
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically by Supabase.

### 5. Trigger deploy
Push to `main` (or run the workflow manually).

## Local test of the edge function
```
cd supabase/functions/waitlist-signup
deno test --allow-env index.test.ts
```

## Hardening to add before you promote the site
- Cloudflare Turnstile verification in the edge function.
- IP-based rate limiting (e.g. Upstash Redis).
- Email double opt-in (sets `confirmed_at`) via a transactional email provider.
- Unsubscribe link handling (sets `unsubscribed_at`).
