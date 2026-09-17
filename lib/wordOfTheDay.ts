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

export async function getWordOfTheDay(): Promise<WordOfTheDay | null> {
  const supabase = getServerSupabase();

  const { data, error } = await supabase.rpc("get_or_pick_word_of_the_day");

  if (error) {
    console.error("Word of the day error:", error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return data[0] as WordOfTheDay;
}