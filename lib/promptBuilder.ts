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
  if (word.imperative) forms.push(`  imperative: ${word.imperative}`)
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
   a) The Nandi translation
   b) The English meaning
   c) A brief grammatical explanation
5. If the user asks about grammar, explain using examples from the word list.
6. Be honest about uncertainty. If you're not sure, say so.

RELEVANT WORD LIST:
${retrievedWords.map(w => formatWordEntry(w)).join('\n')}
`

  const userPrompt = `USER QUERY: ${userQuery}

Respond using ONLY the words and forms in the RELEVANT WORD LIST above.`

  return systemPrompt + userPrompt
}