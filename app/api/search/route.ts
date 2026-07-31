import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { searchCache } from '@/lib/searchCache';
import Fuse from 'fuse.js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim();
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${query}|${type}|${limit}`;
    const cachedResult = searchCache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        results: cachedResult.results,
        count: cachedResult.count,
        query,
        cached: true
      });
    }

    console.log('🔄 Database query for:', query);

    // Fetch words from database
    let supabaseQuery = supabase
      .from('words')
      .select('*');

    // Filter by type if specified
    if (type !== 'all') {
      supabaseQuery = supabaseQuery.eq('word_type', type);
    }

    const { data, error } = await supabaseQuery.order('entry_name', { ascending: true });

    if (error) {
      console.error('Supabase search error:', error);
      return NextResponse.json(
        { error: 'Failed to search words' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        results: [],
        count: 0,
        query,
        cached: false
      });
    }

    // 🔥 Use Fuse.js for fuzzy search (same threshold as client: 0.37)
    const fuse = new Fuse(data, {
      keys: [
        "entry_name",
        "translation_en",
        "translations",
        "answer",
        "notes",
        "examples",
        "dialects",
        "singular_indefinite",
        "singular_definite",
        "plural_indefinite",
        "plural_definite"
      ],
      threshold: 0.37, // Same as client-side
      distance: 100,
      includeScore: true,
      shouldSort: true,
    });

    // Perform fuzzy search
    const fuseResults = fuse.search(query);
    
    // Extract items and limit results
    const filteredData = fuseResults
      .slice(0, limit)
      .map(result => result.item);

    // Store in cache
    searchCache.set(cacheKey, filteredData, filteredData.length);

    return NextResponse.json({
      results: filteredData,
      count: filteredData.length,
      totalMatches: fuseResults.length,
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