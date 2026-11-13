# The Definition of Love

Reader-list site for the forthcoming novel by David L. Condrey. Static page on GitHub Pages; signup posts to a Supabase Edge Function that writes `public.book_waitlist`.

## Layout

- `index.html`, `styles.css`, `app.js` — single page; privacy and inquiries open as `<dialog>`.
- `assets/` — cover (WebP + PNG, C2PA-signed) and brand marks.
- `supabase/migrations/` — `book_waitlist` schema.
- `supabase/functions/waitlist-signup/` — Deno edge function + tests.
- `.github/workflows/deploy.yml` — Pages deploy with Supabase config injection.
- `c2pa/README.md` — how the cover is signed.

## Edge function

```
supabase link --project-ref <ref>
supabase secrets set ALLOWED_ORIGIN=https://dcondrey.github.io
supabase functions deploy waitlist-signup --no-verify-jwt
```

Test locally: `deno test --allow-env supabase/functions/waitlist-signup/index.test.ts`.
