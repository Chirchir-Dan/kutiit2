// lib/wordTypeLabels.ts

// Maps internal English word_type codes to Nandi display labels.

export const WORD_TYPE_LABELS: Record<string, string> = {
  // Traditional literature
  proverb: "Kalewenet",
  riddle: "Tangoch",
  saying: "Mwaeet",

  // Number
  number: "Kaitet"

  // All other types display in English (noun, verb, name, adjective, etc.)
};

export function getWordTypeLabel(wordType: string | null | undefined): string {
  if (!wordType) return "";
  return WORD_TYPE_LABELS[wordType] || wordType;
}