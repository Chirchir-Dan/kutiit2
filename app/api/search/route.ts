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

    // 🔥 NEW: Build cache key with type included
    const cacheKey = `${query}|${type}|${limit}`;
    
    // Check cache first
    const cachedResult = searchCache.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json({
        results: cachedResult.results,
        count: cachedResult.count,
        query,
        type,
        cached: true
      });
    }

    console.log(`🔄 Database query for: "${query}" with type: "${type}"`);

    // 🔥 STEP 1: Fetch words from database with type filter
    let supabaseQuery = supabase
      .from('words')
      .select('*');

    // 🔥 IMPORTANT: Filter by type FIRST (before search)
    if (type !== 'all') {
      supabaseQuery = supabaseQuery.eq('word_type', type);
      console.log(`📋 Filtering by type: "${type}"`);
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
        type,
        cached: false
      });
    }

    console.log(`📊 Found ${data.length} words matching type filter`);

    // 🔥 STEP 2: If no search query, return filtered results directly
    if (!query) {
      // Store in cache
      searchCache.set(cacheKey, data, data.length);
      return NextResponse.json({
        results: data,
        count: data.length,
        query,
        type,
        cached: false
      });
    }

    // 🔥 STEP 3: Use Fuse.js for fuzzy search on the filtered data
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
      threshold: 0.37,
      distance: 100,
      includeScore: true,
      shouldSort: true,
    });

    // Perform fuzzy search
    const fuseResults = fuse.search(query);
    console.log(`🔍 Found ${fuseResults.length} matches for "${query}"`);
    
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
      type,
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