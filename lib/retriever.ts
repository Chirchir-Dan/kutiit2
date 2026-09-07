import { getServerSupabase } from './supabase'

interface Word {
  id: string
  word_type: string
  translation_en: string
  singular_indefinite: string | null
  singular_definite: string | null
  plural_indefinite: string | null
  plural_definite: string | null
  entry_name: string | null
  examples: string | null
  imperative: string | null
  imperative_plural: string | null
  notes: string | null
  is_irregular: boolean | null
  present_1sg: string | null
  present_2sg: string | null
  present_3sg: string | null
  present_1pl: string | null
  present_2pl: string | null
  present_3pl: string | null
}

const stopWords = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'do', 'does', 'did',
  'how', 'what', 'when', 'where', 'who', 'why', 'to', 'in', 'on',
  'at', 'for', 'with', 'about', 'my', 'your', 'his', 'her', 'their',
  'our', 'me', 'you', 'him', 'them', 'us', 'i', 'it', 'this', 'that',
  'these', 'those', 'can', 'could', 'would', 'should', 'will', 'shall',
  'and', 'or', 'but', 'if', 'then', 'so', 'of', 'from', 'by',
  'say', 'saying', 'said'
])

function stemWord(word: string): string {
  let stemmed = word.toLowerCase()
  
  const suffixes = ['ing', 'ed', 'es', 's', 'ly']
  for (const suffix of suffixes) {
    if (stemmed.endsWith(suffix) && stemmed.length - suffix.length >= 3) {
      stemmed = stemmed.slice(0, -suffix.length)
      break
    }
  }
  
  return stemmed
}

export async function retrieveRelevantWords(userQuery: string, limit = 25): Promise<Word[]> {
  const keywords = userQuery
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .map(word => stemWord(word))

  if (keywords.length === 0) return []

  const allResults: Word[] = []
  const seenIds = new Set<string>()
  const supabaseServer = getServerSupabase()

  for (const keyword of keywords) {
    let { data, error } = await supabaseServer
      .from('words')
      .select('*')
      .ilike('translation_en', `%${keyword}%`)
      .limit(15)

    if (error) {
      console.error('Retriever error:', error)
      continue
    }

    if (data) {
      for (const entry of data as Word[]) {
        if (!seenIds.has(entry.id)) {
          seenIds.add(entry.id)
          allResults.push(entry)
        }
      }
    }

    if (allResults.length < limit) {
      let broadData: Word[] = []
      
      const exampleResult = await supabaseServer
        .from('words')
        .select('*')
        .ilike('examples', `%${keyword}%`)
        .limit(10)
      
      if (exampleResult.data) broadData = broadData.concat(exampleResult.data as Word[])
      
      const notesResult = await supabaseServer
        .from('words')
        .select('*')
        .ilike('notes', `%${keyword}%`)
        .limit(10)
      
      if (notesResult.data) broadData = broadData.concat(notesResult.data as Word[])

      for (const entry of broadData) {
        if (!seenIds.has(entry.id)) {
          seenIds.add(entry.id)
          allResults.push(entry)
        }
      }
    }
  }

  return allResults.slice(0, limit)
}