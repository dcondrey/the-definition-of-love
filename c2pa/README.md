# C2PA signing — the cover image

The cover files shipped with this site carry an embedded C2PA 2.x manifest so
browsers, social-media cards, and AI scrapers that parse Content Credentials
see the provenance. Signing is done locally with `writersproof-cli`, which
holds the private key that maps to an assertion method in
`https://writerslogic.com/.well-known/did.json`.

## Signed assets

- `assets/cover.webp` — primary, 88 KB, lossy WebP q78, Ed25519 signed.
- `assets/cover-900.png` — PNG fallback, 242 KB, same manifest.

Both verify at <https://contentcredentials.org/verify>.

## Re-signing after a re-encode

Any re-encode wipes the embedded manifest; re-sign in place:

```bash
/Volumes/A/writersproof/target/debug/writersproof-cli sign-asset assets/cover.webp \
  --title "The Definition of Love — book cover" \
  --author "David L. Condrey" \
  --description "Cover art for the forthcoming literary novel The Definition of Love by David L. Condrey." \
  --copyright "© 2026–2027 David L. Condrey" \
  --date-created "2026-11-13" \
  --keywords "The Definition of Love, David L. Condrey, literary fiction, book cover"

mv assets/cover-signed.webp assets/cover.webp
```

Repeat for `assets/cover-900.png` if the PNG is regenerated.

## What the manifest asserts

- `c2pa.actions.v2`: created and published by the signer.
- `c2pa.training-mining`: AI generative training, inference, training, and
  data-mining are declared **notAllowed**.
- `stds.schema-org.CreativeWork`: book metadata including author DID and
  publication year.
- `cawg.identity`: binds the signer to
  `did:web:writerslogic.com:executives:dcondrey`.

Key custody is Level 1 (software Ed25519). An upgrade to Level 2 (hardware)
would require re-provisioning the key through writersproof.

## `cover.manifest.json`

Kept for reference only. `writersproof-cli sign-asset` builds its own manifest
from the CLI flags; this file is NOT read at signing time and can be deleted
if you don't need it as documentation.
