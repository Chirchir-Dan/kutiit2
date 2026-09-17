// lib/promptBuilder.ts

import rules from "@/data/rules.json";

interface Word {
  translation_en: string;
  entry_name: string | null;
  answer: string | null;
  word_type: string;
  singular_indefinite: string | null;
  singular_definite: string | null;
  plural_indefinite: string | null;
  plural_definite: string | null;
  examples: string | null;
  imperative: string | null;
  imperative_plural: string | null;
  notes: string | null;
  is_irregular: boolean | null;
  present_1sg: string | null;
  present_2sg: string | null;
  present_3sg: string | null;
  present_1pl: string | null;
  present_2pl: string | null;
  present_3pl: string | null;
}

function formatWordEntry(word: Word): string {
  const forms: string[] = [];

  // Riddles: the answer IS the meaning
  if (word.word_type === "riddle" && word.answer) {
    forms.push(`  answer (Nandi): ${word.answer}`);
    if (word.translation_en) forms.push(`  answer (English): ${word.translation_en}`);
  }

  if (word.singular_indefinite) forms.push(`  singular indefinite: ${word.singular_indefinite}`);
  if (word.singular_definite) forms.push(`  singular definite: ${word.singular_definite}`);
  if (word.plural_indefinite) forms.push(`  plural indefinite: ${word.plural_indefinite}`);
  if (word.plural_definite) forms.push(`  plural definite: ${word.plural_definite}`);
  if (word.imperative) forms.push(`  imperative singular: ${word.imperative}`);
  if (word.imperative_plural) forms.push(`  imperative plural: ${word.imperative_plural}`);

  if (word.is_irregular) {
    forms.push(`  IRREGULAR VERB - use these explicit forms:`);
    if (word.present_1sg) forms.push(`    present 1sg: ${word.present_1sg}`);
    if (word.present_2sg) forms.push(`    present 2sg: ${word.present_2sg}`);
    if (word.present_3sg) forms.push(`    present 3sg: ${word.present_3sg}`);
    if (word.present_1pl) forms.push(`    present 1pl: ${word.present_1pl}`);
    if (word.present_2pl) forms.push(`    present 2pl: ${word.present_2pl}`);
    if (word.present_3pl) forms.push(`    present 3pl: ${word.present_3pl}`);
  }

  if (word.examples) forms.push(`  examples: ${word.examples}`);
  if (word.notes) forms.push(`  notes: ${word.notes}`);

  // Header line: entry_name is the primary identifier
  const header = word.entry_name || word.translation_en || "(no entry)";
  const meaning = word.translation_en || word.answer || "";

  return `WORD: ${header}${meaning ? ` — ${meaning}` : ""} (${word.word_type})
${forms.join("\n")}`;
}

export function buildPrompt(userQuery: string, retrievedWords: Word[]): string {
  const systemPrompt = `You are a Nandi language expert. Nandi is a Nilotic language spoken in Kenya.

You have access to a database of Nandi words and a set of verified grammar rules.

RULES:
1. You may ONLY use Nandi words that appear in the RELEVANT WORD LIST below.
2. If a needed word is not in the list, say "I don't have the word for X yet in my database."
3. Never invent Nandi words or forms.
4. Always provide:
   a) The Nandi translation (put it after "Nandi translation:" on its own line)
   b) The English meaning (put it after "English meaning:")
   c) A brief grammatical explanation (put it after "Grammatical explanation:")
5. If the user asks about grammar, explain using examples from the word list.
6. Be honest about uncertainty. If you're not sure, say so.
7. IMPORTANT: When translating, put the Nandi sentence FIRST, then the English, then the explanation.

GRAMMAR RULES (from verified sources):
${JSON.stringify(rules)}

RELEVANT WORD LIST:
${retrievedWords.map((w) => formatWordEntry(w)).join("\n")}
`;

  const userPrompt = `USER QUERY: ${userQuery}

Respond using ONLY the words and forms in the RELEVANT WORD LIST above, and the GRAMMAR RULES provided. Apply the tense and object suffix rules when translating.`;

  return systemPrompt + userPrompt;
}