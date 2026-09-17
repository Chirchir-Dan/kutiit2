// lib/nandiDate.ts

import { getServerSupabase } from "./supabase";

const ENGLISH_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ENGLISH_DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export interface NandiDate {
  dayOfWeek: string | null;
  dayOfMonth: number;
  monthName: string | null;
  year: number;
  formatted: string;
}

export async function getNandiDate(date: Date = new Date()): Promise<NandiDate> {
  const supabase = getServerSupabase();

  const searchTerms = [...ENGLISH_MONTHS, ...ENGLISH_DAYS];

  const orFilter = searchTerms
    .map((term) => `translation_en.ilike.%${term}%`)
    .join(",");

  const { data: words, error } = await supabase
    .from("words")
    .select("entry_name, translation_en")
    .or(orFilter);

  if (error || !words) {
    console.error("Failed to fetch month/day names:", error);
    return fallbackDate(date);
  }

  const lookup = new Map<string, string>();
  for (const w of words) {
    if (!w.translation_en || !w.entry_name) continue;
    const en = w.translation_en.toLowerCase();
    for (const term of searchTerms) {
      if (en.includes(term.toLowerCase())) {
        lookup.set(term.toLowerCase(), w.entry_name);
      }
    }
  }

  const dayOfWeekEn = date.toLocaleDateString("en-US", { weekday: "long" });
  const monthEn = date.toLocaleDateString("en-US", { month: "long" });

  const dayOfWeek = lookup.get(dayOfWeekEn.toLowerCase()) || null;
  const monthName = lookup.get(monthEn.toLowerCase()) || null;
  const dayOfMonth = date.getDate();
  const year = date.getFullYear();

  // Format: "[Day of Week], [Day], [Month], [Year]"
  // Nandi day/month names come from the dictionary; if missing, they're skipped.
  const parts: string[] = [];
  if (dayOfWeek) parts.push(dayOfWeek);
  parts.push(String(dayOfMonth));
  if (monthName) parts.push(monthName);
  parts.push(String(year));

  return {
    dayOfWeek,
    dayOfMonth,
    monthName,
    year,
    formatted: parts.join(", ")
  };
}

function fallbackDate(date: Date): NandiDate {
  return {
    dayOfWeek: null,
    dayOfMonth: date.getDate(),
    monthName: null,
    year: date.getFullYear(),
    formatted: `${date.toLocaleDateString("en-US", {
      weekday: "long"
    })}, ${date.getDate()}, ${date.toLocaleDateString("en-US", {
      month: "long"
    })}, ${date.getFullYear()}`
  };
}