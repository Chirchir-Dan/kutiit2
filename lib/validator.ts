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
  // Build a set of known Nandi word roots from retrieved words
  const knownRoots = new Set<string>()
  
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
          knownRoots.add(part.toLowerCase().trim())
          knownRoots.add(stripTones(part))
        }
      }
    }
  }

  // Extract the Nandi translation line
  const lines = aiOutput.split('\n')
  let nandiLine = ''
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const lowerLine = line.toLowerCase()
    
    if (lowerLine.startsWith('nandi translation:')) {
      nandiLine = line.replace(/^[^:]*:\s*/i, '').trim()
      
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

  if (!nandiLine) {
    nandiLine = lines.find(l => l.trim().length > 0 && !l.toLowerCase().includes('nandi translation')) || ''
  }

  const aiNandiWords = nandiLine
    .toLowerCase()
    .replace(/[^a-zàáâãäåèéêëìíîïòóôõöùúûü\s:-]/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/[.,!?;:()]/g, '').trim())
    .filter(w => w.length > 2)

  // English words that are not Nandi
  const englishWords = new Set([
    'translation', 'meaning', 'explanation', 'grammatical', 'nandi',
    'english', 'present', 'imperfective', 'irregular', 'definite',
    'noun', 'indefinite', 'root', 'precedes', 'subject', 'verb',
    'word', 'words', 'person', 'singular', 'plural', 'form', 'forms',
    'the', 'and', 'for', 'with', 'from', 'this', 'that', 'these',
    'those', 'have', 'has', 'had', 'not', 'are', 'was', 'were',
    'will', 'would', 'could', 'should', 'can', 'may', 'might',
    'must', 'shall', 'there', 'here', 'where', 'when', 'why',
    'what', 'which', 'who', 'whom', 'whose', 'how', 'is', 'to',
    'in', 'on', 'at', 'by', 'of', 'my', 'yet', 'he', 'she', 'it',
    'they', 'you', 'your', 'our', 'their', 'rd', 'nd', 'st', 'th'
  ])

  const unknownWords: string[] = []
  
  for (const word of aiNandiWords) {
    const cleanWord = word.replace(/[.,!?;:()]/g, '')
    
    // Skip English words
    if (englishWords.has(cleanWord)) continue
    
    // Check if this word or a variant is known
    const isKnown = 
      knownRoots.has(cleanWord) ||
      knownRoots.has(stripTones(cleanWord)) ||
      // Check if the word contains a known root (for conjugated forms like kasusa containing sus)
      Array.from(knownRoots).some(root => 
        root.length >= 3 && (cleanWord.includes(root) || root.includes(cleanWord))
      )
    
    if (!isKnown) {
      unknownWords.push(cleanWord)
    }
  }

  return {
    isValid: unknownWords.length === 0,
    unknownWords: [...new Set(unknownWords)]
  }
}