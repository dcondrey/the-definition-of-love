// Run:  deno test supabase/functions/waitlist-signup/index.test.ts
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { validate, corsHeaders } from "./index.ts";

Deno.test("validate: honeypot short-circuits", () => {
  assertEquals(validate({ website: "spam.com", name: "x", email: "a@b.co" }).kind, "honeypot");
});

Deno.test("validate: name optional, over-length rejected", () => {
  assertEquals(validate({ name: "", email: "a@b.co" }), { kind: "ok", name: "", email: "a@b.co" });
  assertEquals(validate({ email: "a@b.co" }), { kind: "ok", name: "", email: "a@b.co" });
  assertEquals(validate({ name: "x".repeat(101), email: "a@b.co" }).kind, "error");
});

Deno.test("validate: invalid email rejected", () => {
  for (const email of ["", "no-at", "a@b", "ab", "a @b.co", "x".repeat(255) + "@b.co"]) {
    assertEquals(validate({ name: "Ada", email }).kind, "error", `expected error for ${email}`);
  }
});

Deno.test("validate: ok normalizes email and trims name", () => {
  const v = validate({ name: "  Ada  ", email: "  Ada@Example.CO  " });
  assertEquals(v, { kind: "ok", name: "Ada", email: "ada@example.co" });
});

Deno.test("corsHeaders: empty allowlist => *", () => {
  const h = corsHeaders("https://x.test", "") as Record<string, string>;
  assertEquals(h["Access-Control-Allow-Origin"], "*");
});

Deno.test("corsHeaders: allowlist match echoes origin; mismatch => null", () => {
  const allowed = "https://dcondrey.github.io,https://example.com";
  const ok = corsHeaders("https://dcondrey.github.io", allowed) as Record<string, string>;
  const bad = corsHeaders("https://evil.test", allowed) as Record<string, string>;
  assertEquals(ok["Access-Control-Allow-Origin"], "https://dcondrey.github.io");
  assertEquals(bad["Access-Control-Allow-Origin"], "null");
});
