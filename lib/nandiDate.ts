// lib/nandiDate.ts

import { getServerSupabase } from "./supabase";

const ENGLISH_MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];

const ENGLISH_DAYS = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
];

export interface NandiCalendar {
  dayNames: Record<string, string>;
  monthNames: Record<string, string>;
}

export async function getNandiCalendar(): Promise<NandiCalendar> {
  const supabase = getServerSupabase();

  const { data: words, error } = await supabase
    .from("words")
    .select("entry_name, translation_en")
    .not("entry_name", "is", null)
    .not("translation_en", "is", null);

  if (error || !words) {
    console.error("Failed to fetch calendar words:", error);
    return { dayNames: {}, monthNames: {} };
  }

  const dayNames: Record<string, string> = {};
  const monthNames: Record<string, string> = {};

  for (const w of words) {
    const en = (w.translation_en || "").toLowerCase().trim();
    const nn = (w.entry_name || "").trim();
    if (!en || !nn) continue;

    for (const month of ENGLISH_MONTHS) {
      if (
        en === month ||
        en.startsWith(month + " ") ||
        en.includes(` ${month}`)
      ) {
        if (!monthNames[month]) monthNames[month] = nn;
      }
    }

    for (const day of ENGLISH_DAYS) {
      if (
        en === day ||
        en.startsWith(day + " ") ||
        en.includes(` ${day}`)
      ) {
        if (!dayNames[day]) dayNames[day] = nn;
      }
    }
  }

  return { dayNames, monthNames };
}