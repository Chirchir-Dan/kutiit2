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
  // Build a set of all valid Nandi forms from retrieved words
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
        for (const part of form.split(/\s+/)) {
          validForms.add(part.toLowerCase().trim())
          validForms.add(stripTones(part))
        }
      }
    }
  }

  // Extract ONLY the Nandi translation line
  const lines = aiOutput.split('\n')
  let nandiLine = ''
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const lowerLine = line.toLowerCase()
    
    if (lowerLine.startsWith('nandi translation:')) {
      // Get everything after "Nandi translation:" on this line
      nandiLine = line.replace(/^[^:]*:\s*/i, '').trim()
      
      // Also include the next line if it doesn't start an English section
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim()
        if (nextLine && 
            !nextLine.toLowerCase().startsWith('english') && 
            !nextLine.toLowerCase().startsWith('grammatical') &&
            !nextLine.toLowerCase().startsWith('⚠️')) {
          nandiLine += ' ' + nextLine
        }
      }
      break
    }
  }

  // If no "Nandi translation:" line, look for bold/italic Nandi text
  if (!nandiLine) {
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('*') && !trimmed.toLowerCase().includes('english') && !trimmed.toLowerCase().includes('nandi')) {
        nandiLine += ' ' + trimmed.replace(/\*/g, ' ').trim()
      }
    }
  }

  // If still empty, use first non-empty line
  if (!nandiLine.trim()) {
    nandiLine = lines.find(l => l.trim().length > 0) || ''
  }

  // Extract words
  const aiNandiWords = nandiLine
    .toLowerCase()
    .replace(/[^a-zàáâãäåèéêëìíîïòóôõöùúûü\s:-]/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/[.,!?;:()]/g, '').trim())
    .filter(w => w.length > 1)

  const englishStopWords = new Set([
    'translation', 'meaning', 'explanation', 'grammatical', 'nandi',
    'english', 'present', 'imperfective', 'irregular', 'definite',
    'noun', 'indefinite', 'root', 'precedes', 'subject', 'verb',
    'word', 'words', 'person', 'singular', 'plural', 'form', 'forms'
  ])

  const unknownWords: string[] = []
  
  for (const word of aiNandiWords) {
    if (word && 
        !validForms.has(word) && 
        !validForms.has(stripTones(word)) &&
        !englishStopWords.has(word)) {
      unknownWords.push(word)
    }
  }

  return {
    isValid: unknownWords.length === 0,
    unknownWords: [...new Set(unknownWords)]
  }
}