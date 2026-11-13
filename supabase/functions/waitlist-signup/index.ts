// Supabase Edge Function: waitlist-signup
// Deploy:   supabase functions deploy waitlist-signup --no-verify-jwt
// Required secret: ALLOWED_ORIGIN (comma-separated list, e.g. https://dcondrey.github.io)
// Supabase provides: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Payload = { name?: unknown; email?: unknown; website?: unknown };
export type Validated =
  | { kind: "ok"; name: string; email: string }
  | { kind: "honeypot" }
  | { kind: "error"; error: string };

export function validate(payload: Payload): Validated {
  if (typeof payload.website === "string" && payload.website.trim() !== "") {
    return { kind: "honeypot" };
  }
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!name || name.length > 100) return { kind: "error", error: "Please enter your name." };
  if (!email || email.length < 3 || email.length > 254 || !EMAIL_RE.test(email)) {
    return { kind: "error", error: "Please enter a valid email address." };
  }
  return { kind: "ok", name, email };
}

export function corsHeaders(origin: string | null, allowedEnv: string | undefined): HeadersInit {
  const allowed = (allowedEnv || "").split(",").map((s) => s.trim()).filter(Boolean);
  const allowAny = allowed.length === 0 || allowed.includes("*");
  const allowOrigin = allowAny ? "*" : (origin && allowed.includes(origin) ? origin : "null");
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin, Deno.env.get("ALLOWED_ORIGIN")) },
  });
}

// Entrypoint — skipped during unit tests.
if (import.meta.main) {
  Deno.serve(async (req) => {
    const origin = req.headers.get("origin");
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, Deno.env.get("ALLOWED_ORIGIN")) });
    }
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);

    let payload: Payload;
    try { payload = await req.json(); } catch { return json({ error: "Invalid JSON." }, 400, origin); }

    const v = validate(payload);
    if (v.kind === "honeypot") return json({ message: "Thank you. You’re on the list." }, 200, origin);
    if (v.kind === "error") return json({ error: v.error }, 400, origin);

    const url = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceRole) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return json({ error: "Server not configured." }, 500, origin);
    }

    const supabase = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await supabase.from("book_waitlist").insert({ name: v.name, email: v.email });

    if (error) {
      if (error.code === "23505") return json({ message: "You’re already on the list. Thank you." }, 200, origin);
      console.error("insert error:", error);
      return json({ error: "We could not save your signup right now." }, 500, origin);
    }
    return json({ message: "Thank you. You’re on the list." }, 200, origin);
  });
}
