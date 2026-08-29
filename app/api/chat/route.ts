import { NextRequest, NextResponse } from 'next/server'
import { retrieveRelevantWords } from '@/lib/retriever'
import { buildPrompt } from '@/lib/promptBuilder'
import { validateNandiOutput } from '@/lib/validator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = body.message as string
    
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Step 1: Retrieve relevant words
    const retrievedWords = await retrieveRelevantWords(message)
    
    if (retrievedWords.length === 0) {
      return NextResponse.json({
        reply: "I couldn't find any relevant words in my Nandi database for your query. Please try different keywords or add these words to the dictionary first.",
        retrieved: [],
        validation: { isValid: true, unknownWords: [] }
      })
    }

    // Step 2: Build the prompt
    const prompt = buildPrompt(message, retrievedWords)

    // Step 3: Call Gemini API
    const geminiKey = process.env.GEMINI_API_KEY
    console.log('GEMINI_API_KEY exists:', !!geminiKey)
    console.log('GEMINI_API_KEY prefix:', geminiKey ? geminiKey.substring(0, 5) : 'none')
    
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    })

    const data = await response.json()
    console.log('Gemini response status:', response.status)
    console.log('Gemini response body:', JSON.stringify(data).substring(0, 2000))

    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.'

    // Step 4: Validate the output
    const validation = validateNandiOutput(aiReply, retrievedWords)

    // Step 5: Build final response
    let finalReply = aiReply
    
    if (!validation.isValid) {
      finalReply += `\n\n⚠️ WARNING: The following words may not be in the verified dictionary: ${validation.unknownWords.join(', ')}. Please verify with a native speaker.`
    }

    return NextResponse.json({
      reply: finalReply,
      retrieved: retrievedWords.map(w => ({
        id: w.id,
        word: w.translation_en,
        type: w.word_type
      })),
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