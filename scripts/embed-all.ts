// scripts/embed-all.ts

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const geminiKey = process.env.GEMINI_API_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

const GEMINI_EMBEDDING_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

function buildEmbeddingText(word: any): string {
  const clean = (s: string | null | undefined): string =>
    (s || "").replace(/\bNandi\b/gi, "").trim();

  const parts: string[] = [];

  if (word.entry_name) parts.push(clean(word.entry_name));
  if (word.translation_en) parts.push(clean(word.translation_en));

  if (word.translations && word.translations.length > 0) {
    parts.push(word.translations.map(clean).filter(Boolean).join(", "));
  }

  if (word.answer) parts.push(clean(word.answer));
  if (word.word_type) parts.push(`(${word.word_type})`);
  if (word.notes) parts.push(clean(word.notes));

  return parts.filter(Boolean).join(" ");
}

async function embed(
  text: string,
  attempt: number = 1
): Promise<number[] | null> {
  const res = await fetch(`${GEMINI_EMBEDDING_URL}?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text }] },
      outputDimensionality: 768
    })
  });

  if (res.status === 429) {
    // Could be per-minute OR daily. We can't distinguish reliably.
    // So always retry, with increasing backoff. If it's truly daily,
    // the user can Ctrl+C manually.
    const waitMs = Math.min(30000 * attempt, 120000); // 30s, 60s, 90s, 120s cap
    console.log(
      `   ⏸  Rate limit hit (attempt ${attempt}), waiting ${waitMs / 1000}s...`
    );
    await new Promise((r) => setTimeout(r, waitMs));
    return embed(text, attempt + 1);
  }

  if (res.status === 503) {
    console.log("   ⏸  Service unavailable, waiting 5s...");
    await new Promise((r) => setTimeout(r, 5000));
    return embed(text, attempt);
  }

  if (!res.ok) {
    console.error("   ✗ API error:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  return data.embedding?.values || null;
}

async function main() {
  const { data: words, error } = await supabase
    .from("words")
    .select(
      "id, entry_name, translation_en, translations, answer, word_type, notes"
    )
    .is("embedding", null);

  if (error) {
    console.error("Failed to fetch words:", error);
    process.exit(1);
  }

  console.log(`Found ${words.length} words without embeddings.\n`);

  let processed = 0;
  let failed = 0;

  for (const word of words) {
    const text = buildEmbeddingText(word);
    if (!text.trim()) {
      failed++;
      continue;
    }

    const embedding = await embed(text);
    if (!embedding) {
      failed++;
      continue;
    }

    const { error: updateErr } = await supabase
      .from("words")
      .update({ embedding })
      .eq("id", word.id);

    if (updateErr) {
      console.error(
        `   ✗ Update failed for ${word.entry_name}:`,
        updateErr.message
      );
      failed++;
      continue;
    }

    processed++;
    if (processed % 25 === 0) {
      console.log(`✓ ${processed}/${words.length} done (${failed} failed)`);
    }

    // 700ms = ~85 requests/minute, safely under Gemini's 100 RPM limit
    await new Promise((r) => setTimeout(r, 700));
  }

  console.log(`\n✅ Done. ${processed} embedded, ${failed} failed.`);
}

main();