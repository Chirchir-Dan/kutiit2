// app/api/search/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { searchCache } from "@/lib/searchCache";
import { checkRateLimit } from "@/lib/rateLimit";

// Only return these fields in list results
const LIST_FIELDS =
  "id, entry_name, translation_en, translations, answer, word_type, singular_indefinite, singular_definite, plural_indefinite, plural_definite, imperative, imperative_plural";

export async function GET(request: Request) {
  try {
    // ── 1. Rate limit by IP ──
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const { allowed, remaining, resetIn } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please slow down.",
          retryIn: Math.ceil(resetIn / 1000)
        },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(resetIn / 1000)) }
        }
      );
    }

    // ── 2. Parse & cap parameters ──
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q")?.trim() || "";
    const query = rawQuery.toLowerCase();
    const type = searchParams.get("type") || "all";
    const requestedLimit = parseInt(searchParams.get("limit") || "50");
    const limit = Math.min(Math.max(requestedLimit, 1), 50);

    const cacheKey = `${query}|${type}|${limit}`;
    const cachedResult = searchCache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json(
        {
          results: cachedResult.results,
          count: cachedResult.count,
          query,
          type,
          cached: true
        },
        { headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    console.log(`🔄 Search: "${query}" type="${type}" limit=${limit}`);

    // ── 3. No query — paginate directly ──
    if (!query) {
      let q = supabase
        .from("words")
        .select(LIST_FIELDS)
        .eq("is_verified", true);

      if (type !== "all") q = q.eq("word_type", type);

      const { data, error } = await q
        .order("entry_name", { ascending: true })
        .limit(limit);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "Failed to fetch words" },
          { status: 500 }
        );
      }

      const results = data || [];
      searchCache.set(cacheKey, results, results.length);

      return NextResponse.json(
        {
          results,
          count: results.length,
          query,
          type,
          cached: false
        },
        { headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    // ── 4. Fuzzy search via pg_trgm RPC ──
    const { data, error } = await supabase.rpc("search_words", {
      search_term: query,
      word_type_filter: type,
      result_limit: limit
    });

    if (error) {
      console.error("Search RPC error:", error);
      return NextResponse.json(
        { error: "Search failed" },
        { status: 500 }
      );
    }

    // Attach translations if not returned by the RPC (they're not)
    // The RPC returns enough for the sidebar list; detail view fetches full row on demand.
    const results = data || [];

    // Enrich with translations field from the full row — one extra query per result
    // is acceptable, but let's do it in one batch
    let enrichedResults: any[] = results;
    if (results.length > 0) {
      const ids = results.map((r: any) => r.id);
      const { data: fullRows } = await supabase
        .from("words")
        .select("id, translations, notes, examples")
        .in("id", ids);

      if (fullRows) {
        const map = new Map(fullRows.map((r: any) => [r.id, r]));
        enrichedResults = results.map((r: any) => ({
          ...r,
          ...(map.get(r.id) || {})
        }));
      }
    }

    searchCache.set(cacheKey, enrichedResults, enrichedResults.length);

    return NextResponse.json(
      {
        results: enrichedResults,
        count: enrichedResults.length,
        query,
        type,
        cached: false
      },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}