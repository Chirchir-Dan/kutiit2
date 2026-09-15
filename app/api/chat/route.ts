// app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { retrieveRelevantWords } from '@/lib/retriever'
import { buildPrompt } from '@/lib/promptBuilder'
import { loadCompanionPrompt } from '@/lib/companionPrompt'
import { validateNandiOutput } from '@/lib/validator'

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
  imperative_plural: string | null
  is_irregular: boolean | null
  present_1sg: string | null
  present_2sg: string | null
  present_3sg: string | null
  present_1pl: string | null
  present_2pl: string | null
  present_3pl: string | null
}

function formatWordEntry(word: Word): string {
  const forms: string[] = []
  if (word.singular_indefinite) forms.push(`  singular indefinite: ${word.singular_indefinite}`)
  if (word.singular_definite) forms.push(`  singular definite: ${word.singular_definite}`)
  if (word.plural_indefinite) forms.push(`  plural indefinite: ${word.plural_indefinite}`)
  if (word.plural_definite) forms.push(`  plural definite: ${word.plural_definite}`)
  if (word.imperative) forms.push(`  imperative singular: ${word.imperative}`)
  if (word.imperative_plural) forms.push(`  imperative plural: ${word.imperative_plural}`)
  
  if (word.is_irregular) {
    forms.push(`  IRREGULAR VERB - use these explicit forms:`)
    if (word.present_1sg) forms.push(`    present 1sg: ${word.present_1sg}`)
    if (word.present_2sg) forms.push(`    present 2sg: ${word.present_2sg}`)
    if (word.present_3sg) forms.push(`    present 3sg: ${word.present_3sg}`)
    if (word.present_1pl) forms.push(`    present 1pl: ${word.present_1pl}`)
    if (word.present_2pl) forms.push(`    present 2pl: ${word.present_2pl}`)
    if (word.present_3pl) forms.push(`    present 3pl: ${word.present_3pl}`)
  }
  
  if (word.examples) forms.push(`  examples: ${word.examples}`)

  return `WORD: ${word.translation_en} (${word.word_type})
${forms.join('\n')}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = body.message as string
    const mode = body.mode === 'chat' ? 'chat' : 'translate'
    
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Step 1: Retrieve relevant words (vector search with keyword fallback)
    const retrieval = await retrieveRelevantWords(message)
    const retrievedWords = retrieval.words
    
    console.log('Retrieval method:', retrieval.method, '| Top similarity:', retrieval.topSimilarity)

    if (retrievedWords.length === 0) {
      return NextResponse.json({
        reply: "I couldn't find any relevant words in my Nandi database for your query. Please try different keywords or add these words to the dictionary first.",
        retrieved: [],
        retrievalMethod: retrieval.method,
        topSimilarity: retrieval.topSimilarity,
        validation: { isValid: true, unknownWords: [] }
      })
    }

    // Step 2: Build the prompt based on mode
    let prompt: string
    
    if (mode === 'chat') {
      const companionPrompt = loadCompanionPrompt()
      prompt = `${companionPrompt}

AVAILABLE WORDS:
${retrievedWords.map(w => formatWordEntry(w)).join('\n')}

USER SAYS: ${message}

Respond naturally in Nandi using only available words. Follow the response structure in your instructions.`
    } else {
      prompt = buildPrompt(message, retrievedWords)
    }

    // Step 3: Call Gemini API
    const geminiKey = process.env.GEMINI_API_KEY
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`
    
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    }

    let response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    // Retry on 503
    let attempts = 0
    while (response.status === 503 && attempts < 3) {
      attempts++
      await new Promise(resolve => setTimeout(resolve, 3000 * attempts))
      response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
    }

    const data = await response.json()
    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.'

    // Step 4: Validate
    const validation = validateNandiOutput(aiReply, retrievedWords)

    // Step 5: Build final response
    let finalReply = aiReply
    
    if (!validation.isValid && mode === 'translate') {
      finalReply += `\n\n⚠️ WARNING: The following words may not be in the verified dictionary: ${validation.unknownWords.join(', ')}. Please verify with a native speaker.`
    }

    return NextResponse.json({
      reply: finalReply,
      mode,
      retrieved: retrievedWords.map(w => ({
        id: w.id,
        word: w.translation_en,
        type: w.word_type,
        similarity: w.similarity
      })),
      retrievalMethod: retrieval.method,
      topSimilarity: retrieval.topSimilarity,
      validation
    })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}