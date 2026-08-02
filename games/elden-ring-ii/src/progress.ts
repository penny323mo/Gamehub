import type { SupabaseClient } from "@supabase/supabase-js";

export type CompletedRun = {
  characterClass: "warrior" | "wizard" | "ranger";
  result: "victory" | "dead";
  durationMs: number;
  minionsDefeated: number;
  bossHpRemaining: number;
};

const STORAGE_KEY = "veil-of-the-hollow-crown:runs";
let supabaseClient: SupabaseClient | null | undefined;

async function getSupabaseClient() {
  if (supabaseClient !== undefined) return supabaseClient;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    supabaseClient = null;
    return supabaseClient;
  }
  const { createClient } = await import("@supabase/supabase-js");
  supabaseClient = createClient(url, publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return supabaseClient;
}

function saveLocally(run: CompletedRun) {
  if (typeof window === "undefined") return;
  try {
    const previous = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown[];
    const history = Array.isArray(previous) ? previous : [];
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ ...run, completedAt: new Date().toISOString() }, ...history].slice(0, 20)),
    );
  } catch {
    // Gameplay must remain available when storage is disabled or full.
  }
}

export async function recordCompletedRun(run: CompletedRun) {
  saveLocally(run);
  const client = await getSupabaseClient();
  if (!client) return "local" as const;

  const { data: { session } } = await client.auth.getSession();
  if (!session?.user) return "local" as const;

  const { error } = await client.from("game_runs").insert({
    user_id: session.user.id,
    character_class: run.characterClass,
    result: run.result,
    duration_ms: run.durationMs,
    minions_defeated: run.minionsDefeated,
    boss_hp_remaining: run.bossHpRemaining,
  });
  return error ? "local" as const : "cloud" as const;
}

export const hasSupabaseFoundation = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
