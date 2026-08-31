interface Word {
  translation_en: string
  word_type: string
  singular_indefinite: string | null
  singular_definite: string | null
  plural_indefinite: string | null
  plural_definite: string | null
  entry_name: string | null
  examples: string | null
  imperative: string | null
}

function formatWordEntry(word: Word): string {
  const forms: string[] = []
  if (word.singular_indefinite) forms.push(`  singular indefinite: ${word.singular_indefinite}`)
  if (word.singular_definite) forms.push(`  singular definite: ${word.singular_definite}`)
  if (word.plural_indefinite) forms.push(`  plural indefinite: ${word.plural_indefinite}`)
  if (word.plural_definite) forms.push(`  plural definite: ${word.plural_definite}`)
  if (word.imperative) forms.push(`  imperative singular: ${word.imperative}`)
  if (word.examples) forms.push(`  examples: ${word.examples}`)

  return `WORD: ${word.translation_en} (${word.word_type})
${forms.join('\n')}`
}

export function buildPrompt(userQuery: string, retrievedWords: Word[]): string {
  const systemPrompt = `You are a Nandi language expert. Nandi is a Nilotic language in the Kalenjin group, spoken in Kenya.

You have access to a database of Nandi words. Below is the RELEVANT WORD LIST retrieved for this query.

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

NANDI VERB CONJUGATION RULES:

CLASS I VERBS (infinitive starts with ke-):
- Drop the ke- prefix to get the root.
- Imperative singular: root
- Imperative plural: o-root
- Present imperfective:
  1sg: a-root-e
  2sg: i-root-e
  3sg: root-e
  1pl: ki-root-e
  2pl: o-root-e
  3pl: root-e
- Example: kesus (to bite) → root sus → 3sg: suse; imperative: sus, osus

CLASS II VERBS (infinitive starts with ki-):
- Drop the ki- prefix to get the root.
- Imperative singular: i-root
- Imperative plural: o-root
- Present imperfective:
  1sg: a-root-ii
  2sg: i-root-ii
  3sg: i-root-i
  1pl: ki-root-ii
  2pl: o-root-ii
  3pl: i-root-i
- Example: kilul (to fell) → root lul → 3sg: iluli; imperative: ilul, olul

IRREGULAR VERBS:
- kepwa (to come): infinitive sg nyoo, pl opwaa; imperative nyoo, opwaa.
  Present: 1sg anyone, 2sg inyone, 3sg nyone, 1pl kipwane, 2pl opwane, 3pl pwane.
- kelapat (to run): imperative lapat, orwai.
  Present: 1sg alapatii, 2sg ilapatii, 3sg lapati, 1pl kirwae, 2pl orwae, 3pl rwae.

IMPORTANT CONJUGATION NOTES:
- If the verb in the word list is marked "irregular" or matches one of the irregular examples above, use the explicit forms given.
- If you are unsure whether a verb is Class I or Class II, look at its infinitive prefix (ke- vs ki-) in the word list.
- Always use the correct stem. Some verbs change stems between singular and plural (e.g., kelapat: lapat- singular, rwa- plural).

RELEVANT WORD LIST:
${retrievedWords.map(w => formatWordEntry(w)).join('\n')}
`

  const userPrompt = `USER QUERY: ${userQuery}

Respond using ONLY the words and forms in the RELEVANT WORD LIST above.`

  return systemPrompt + userPrompt
}