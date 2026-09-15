import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { generateEmbedding, buildEmbeddingText } from '@/lib/embeddings'

export async function POST() {
  try {
    const supabase = getServerSupabase()
    
    // Fetch all words without embeddings
    const { data: words, error } = await supabase
      .from('words')
      .select('id, entry_name, translation_en, translations, word_type, notes')
      .is('embedding', null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!words || words.length === 0) {
      return NextResponse.json({ 
        message: 'All words already have embeddings',
        total: 0,
        processed: 0,
        failed: 0
      })
    }

    let processed = 0
    let failed = 0
    const failures: string[] = []

    for (const word of words) {
      const text = buildEmbeddingText(word)
      
      if (!text.trim()) {
        failed++
        failures.push(`${word.id}: empty text`)
        continue
      }

      const embedding = await generateEmbedding(text)
      
      if (!embedding) {
        failed++
        failures.push(`${word.entry_name || word.id}: embedding failed`)
        continue
      }

      const { error: updateError } = await supabase
        .from('words')
        .update({ embedding })
        .eq('id', word.id)

      if (updateError) {
        failed++
        failures.push(`${word.entry_name || word.id}: ${updateError.message}`)
        continue
      }

      processed++

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return NextResponse.json({
      message: 'Bulk embedding complete',
      total: words.length,
      processed,
      failed,
      failures: failures.slice(0, 20) // only return first 20 failures
    })

  } catch (error) {
    console.error('Bulk embed error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}