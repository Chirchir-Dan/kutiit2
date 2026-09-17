// lib/wordOfTheDay.ts

import { getServerSupabase } from "./supabase";

export interface WordOfTheDay {
  id: string;
  entry_name: string | null;
  translation_en: string;
  word_type: string;
  singular_indefinite: string | null;
  singular_definite: string | null;
  plural_indefinite: string | null;
  plural_definite: string | null;
  imperative: string | null;
  imperative_plural: string | null;
  examples: string | null;
  notes: string | null;
  answer: string | null;
  translations: string[] | null;
}

// Deterministic index based on date — same all day, changes at midnight
function dateToIndex(date: Date, totalWords: number): number {
  const dayNumber = Math.floor(date.getTime() / 86400000); // days since epoch
  return Math.abs(dayNumber) % totalWords;
}

export async function getWordOfTheDay(): Promise<WordOfTheDay | null> {
  const supabase = getServerSupabase();

  // Only pick from words with verified meanings and enough content
  const { data: words, error } = await supabase
    .from("words")
    .select(
      "id, entry_name, translation_en, word_type, singular_indefinite, singular_definite, plural_indefinite, plural_definite, imperative, imperative_plural, examples, notes, answer, translations"
    )
    .eq("is_verified", true)
    .not("entry_name", "is", null)
    .not("translation_en", "is", null)
    .order("id", { ascending: true });

  if (error || !words || words.length === 0) {
    console.error("Word of the day fetch error:", error);
    return null;
  }

  // Filter to entries with real content
  const validWords = words.filter(
    (w) =>
      w.entry_name &&
      w.entry_name.trim().length > 0 &&
      (w.translation_en?.trim().length > 0 || w.answer?.trim().length > 0)
  );

  if (validWords.length === 0) return null;

  const index = dateToIndex(new Date(), validWords.length);
  return validWords[index] as WordOfTheDay;
}