import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { generateEmbedding } from '@/lib/embeddings'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, entry_name, text } = body

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    if (!id && !entry_name) {
      return NextResponse.json(
        { error: 'Either id or entry_name is required' },
        { status: 400 }
      )
    }

    const embedding = await generateEmbedding(text)

    if (!embedding) {
      return NextResponse.json(
        { error: 'Embedding generation failed' },
        { status: 500 }
      )
    }

    const supabase = getServerSupabase()

    let query = supabase.from('words').update({ embedding })

    if (id) {
      query = query.eq('id', id)
    } else {
      query = query.eq('entry_name', entry_name)
    }

    const { error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Embed word error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}