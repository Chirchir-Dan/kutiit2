// app/api/search/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { searchCache } from "@/lib/searchCache";
import { checkRateLimit } from "@/lib/rateLimit";
import Fuse from "fuse.js";

// Only return these fields in list results — no notes, no examples
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
          headers: {
            "Retry-After": String(Math.ceil(resetIn / 1000))
          }
        }
      );
    }

    // ── 2. Parse & cap parameters ──
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase().trim();
    const type = searchParams.get("type") || "all";
    const requestedLimit = parseInt(searchParams.get("limit") || "50");
    const limit = Math.min(Math.max(requestedLimit, 1), 50); // cap at 50

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
        {
          headers: {
            "X-RateLimit-Remaining": String(remaining)
          }
        }
      );
    }

    console.log(`🔄 Search: "${query}" type="${type}" limit=${limit}`);

    // ── 3. If NO query, paginate directly from Supabase ──
    if (!query) {
      let supabaseQuery = supabase
        .from("words")
        .select(LIST_FIELDS)
        .eq("is_verified", true);

      if (type !== "all") {
        supabaseQuery = supabaseQuery.eq("word_type", type);
      }

      const { data, error } = await supabaseQuery
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
        {
          headers: {
            "X-RateLimit-Remaining": String(remaining)
          }
        }
      );
    }

    // ── 4. If query exists, narrow via ILIKE on server first ──
    //    This avoids fetching the entire dictionary for every search.
    let supabaseQuery = supabase
      .from("words")
      .select(LIST_FIELDS)
      .eq("is_verified", true)
      .or(
        `entry_name.ilike.%${query}%,translation_en.ilike.%${query}%,answer.ilike.%${query}%`
      );

    if (type !== "all") {
      supabaseQuery = supabaseQuery.eq("word_type", type);
    }

    const { data, error } = await supabaseQuery
      .order("entry_name", { ascending: true })
      .limit(200); // hard cap on server-side pre-filter

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to search words" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          results: [],
          count: 0,
          query,
          type,
          cached: false
        },
        {
          headers: {
            "X-RateLimit-Remaining": String(remaining)
          }
        }
      );
    }

    // ── 5. Fuzzy search on the narrowed set ──
    const fuse = new Fuse(data, {
      keys: [
        "entry_name",
        "translation_en",
        "translations",
        "answer",
        "singular_indefinite",
        "singular_definite",
        "plural_indefinite",
        "plural_definite"
      ],
      threshold: 0.37,
      distance: 100,
      includeScore: true,
      shouldSort: true
    });

    const fuseResults = fuse.search(query);
    const filteredData = fuseResults.slice(0, limit).map((r) => r.item);

    searchCache.set(cacheKey, filteredData, filteredData.length);

    return NextResponse.json(
      {
        results: filteredData,
        count: filteredData.length,
        totalMatches: fuseResults.length,
        query,
        type,
        cached: false
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(remaining)
        }
      }
    );
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}