import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { searchCache } from '@/lib/searchCache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim();
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // 🔥 NEW: Check cache first
    const cacheKey = `${query}|${type}|${limit}`;
    const cachedResult = searchCache.get(cacheKey);

    if (cachedResult) {
      // Return cached results (no database hit!)
      return NextResponse.json({
        results: cachedResult.results,
        count: cachedResult.count,
        query,
        cached: true
      });
    }

    // If not in cache, query the database
    console.log('🔄 Database query for:', query);

    // Build the query
    let supabaseQuery = supabase
      .from('words')
      .select('*')
      .limit(limit);

    // Filter by type if specified
    if (type !== 'all') {
      supabaseQuery = supabaseQuery.eq('word_type', type);
    }

    // Search in entry_name and translation_en using ILIKE
    const { data, error } = await supabaseQuery
      .or(
        `entry_name.ilike.%${query}%,` +
        `translation_en.ilike.%${query}%`
      )
      .order('entry_name', { ascending: true });

    if (error) {
      console.error('Supabase search error:', error);
      return NextResponse.json(
        { error: 'Failed to search words' },
        { status: 500 }
      );
    }

    // Filter results by translations array (for partial matches)
    const filteredData = data?.filter(word => {
      const entryMatch = word.entry_name?.toLowerCase().includes(query);
      const translationEnMatch = word.translation_en?.toLowerCase().includes(query);
      
      let translationsMatch = false;
      if (word.translations && Array.isArray(word.translations)) {
        translationsMatch = word.translations.some(
          (t: string) => t.toLowerCase().includes(query)
        );
      }
      
      return entryMatch || translationEnMatch || translationsMatch;
    });

    // 🔥 NEW: Store results in cache for 5 minutes
    searchCache.set(cacheKey, filteredData || [], filteredData?.length || 0);

    return NextResponse.json({
      results: filteredData || [],
      count: filteredData?.length || 0,
      query,
      cached: false
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}