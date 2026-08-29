interface Word {
  singular_indefinite: string | null
  singular_definite: string | null
  plural_indefinite: string | null
  plural_definite: string | null
  entry_name: string | null
  imperative: string | null
}

export interface ValidationResult {
  isValid: boolean
  unknownWords: string[]
}

function stripTones(word: string): string {
  const toneMap: Record<string, string> = {
    'à':'a', 'á':'a', 'â':'a', 'ã':'a', 'ä':'a', 'å':'a',
    'è':'e', 'é':'e', 'ê':'e', 'ë':'e',
    'ì':'i', 'í':'i', 'î':'i', 'ï':'i',
    'ò':'o', 'ó':'o', 'ô':'o', 'õ':'o', 'ö':'o',
    'ù':'u', 'ú':'u', 'û':'u', 'ü':'u'
  }
  
  return word
    .toLowerCase()
    .replace(/[àáâãäåèéêëìíîïòóôõöùúûü]/g, c => toneMap[c] || c)
    .trim()
}

export function validateNandiOutput(aiOutput: string, retrievedWords: Word[]): ValidationResult {
  // Build a set of all valid Nandi forms
  const validForms = new Set<string>()
  
  for (const word of retrievedWords) {
    const formFields = [
      word.singular_indefinite,
      word.singular_definite,
      word.plural_indefinite,
      word.plural_definite,
      word.imperative,
      word.entry_name
    ]
    
    for (const form of formFields) {
      if (form) {
        validForms.add(form.toLowerCase().trim())
        validForms.add(stripTones(form))
      }
    }
  }

  // Extract the Nandi section (everything before the first blank line)
  // The AI is instructed to put Nandi first, then English, then explanation
  const sections = aiOutput.split('\n\n')
  const nandiSection = sections[0] || ''

  // Extract potential Nandi words
  const aiNandiWords = nandiSection
    .toLowerCase()
    .replace(/[^a-zàáâãäåèéêëìíîïòóôõöùúûü\s:-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !['the', 'a', 'is', 'are', 'nandi', 'and', 'or', 'in', 'on', 'to'].includes(w))

  const unknownWords: string[] = []
  
  for (const word of aiNandiWords) {
    const cleanWord = word.replace(/[.,!?;:()]/g, '')
    if (cleanWord && !validForms.has(cleanWord) && !validForms.has(stripTones(cleanWord))) {
      unknownWords.push(cleanWord)
    }
  }

  return {
    isValid: unknownWords.length === 0,
    unknownWords: [...new Set(unknownWords)]
  }
}