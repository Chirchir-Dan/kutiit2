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
        // Split multi-word forms
        for (const part of form.split(/\s+/)) {
          validForms.add(part.toLowerCase().trim())
          validForms.add(stripTones(part))
        }
      }
    }
  }

  // The AI is instructed to put Nandi translation after "Nandi translation:" 
  // and before "English meaning:"
  // Let's find all Nandi words by looking for lines with Nandi text
  const lines = aiOutput.split('\n')
  let nandiText = ''
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const lowerLine = line.toLowerCase()
    
    // Skip English explanation sections
    if (lowerLine.startsWith('english meaning') || 
        lowerLine.startsWith('grammatical explanation') || 
        lowerLine.startsWith('⚠️')) {
      break
    }
    
    // Skip lines that are clearly English
    if (lowerLine.startsWith('nandi translation') || 
        lowerLine.startsWith('nandi component') ||
        lowerLine.startsWith('nandi word') ||
        lowerLine.startsWith('database availability')) {
      continue
    }
    
    // Collect lines that could contain Nandi (has asterisks or is after "Nandi translation:")
    if (line.includes('*') || line.includes(':')) {
      // Extract words between asterisks or after colons
      const nandiPart = line.replace(/^[^:]*:\s*/, '').replace(/\*/g, ' ').trim()
      if (nandiPart) {
        nandiText += ' ' + nandiPart
      }
    }
  }

  // If we couldn't find Nandi text, check the whole first paragraph
  if (!nandiText.trim()) {
    nandiText = aiOutput.split('\n\n')[0] || ''
  }

  // Clean and extract words
  const aiNandiWords = nandiText
    .toLowerCase()
    .replace(/[^a-zàáâãäåèéêëìíîïòóôõöùúûü\s:-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && ![
      'the', 'and', 'for', 'with', 'from', 'this', 'that', 'these', 'those',
      'don', 'have', 'has', 'had', 'not', 'are', 'was', 'were', 'will', 'would',
      'could', 'should', 'can', 'may', 'might', 'must', 'shall', 'there', 'here',
      'where', 'when', 'why', 'what', 'which', 'who', 'whom', 'whose', 'how',
      'nandi', 'translation', 'english', 'meaning', 'grammatical', 'explanation',
      'database', 'word', 'words', 'component', 'components', 'availability',
      'exact', 'third-person', 'third', 'person', 'singular', 'verb', 'form',
      'is', 'coming', 'come', 'to', 'in', 'on', 'at', 'by', 'of', 'my', 'yet',
      'he', 'she', 'it', 'they', 'you', 'your', 'my', 'our', 'their'
    ].includes(w))

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