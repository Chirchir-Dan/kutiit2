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

  // Extract only the Nandi sentence(s) from the reply
  // Look for lines that are likely Nandi: they come after "Nandi translation:" or are standalone lines
  const lines = aiOutput.split('\n').map(line => line.trim())
  const nandiLines: string[] = []
  
  let inNandiSection = false
  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    
    if (lowerLine.includes('nandi translation') || lowerLine.includes('nandi component')) {
      inNandiSection = true
      continue
    }
    
    // Stop when we hit English sections
    if (lowerLine.includes('english meaning') || lowerLine.includes('grammatical explanation') || lowerLine.includes('⚠️ warning')) {
      inNandiSection = false
      continue
    }
    
    // Collect lines while in Nandi section, skipping lines that are clearly English
    if (inNandiSection && line.length > 0 && !line.startsWith('*') && !line.startsWith('-') && !line.startsWith('b)')) {
      nandiLines.push(line)
    }
  }

  // If no clear Nandi section found, fall back to checking bold/italic lines only
  if (nandiLines.length === 0) {
    for (const line of lines) {
      const trimmed = line.trim()
      if ((trimmed.startsWith('*') || trimmed.startsWith('**')) && trimmed.length > 2) {
        nandiLines.push(trimmed.replace(/\*/g, '').trim())
      }
    }
  }

  // Extract potential Nandi words
  const nandiText = nandiLines.join(' ')
  const aiNandiWords = nandiText
    .toLowerCase()
    .replace(/[^a-zàáâãäåèéêëìíîïòóôõöùúûü\s:-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1)

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