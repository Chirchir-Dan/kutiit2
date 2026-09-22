// hooks/useAdminWords.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useAdminWords() {
  const [words, setWords] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [view, setView] = useState<"words" | "suggestions">("words");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch only the count — no rows returned
  const fetchCount = useCallback(async () => {
    const { count, error } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Count fetch error:", error);
      return;
    }

    if (count !== null) setTotalCount(count);
  }, []);

  // Fetch words for the list (limited, paginated later if needed)
  const fetchWords = useCallback(async () => {
    const { data } = await supabase
      .from("words")
      .select("*")
      .order("entry_name", { ascending: true })
      .limit(500);
    if (data) setWords(data);
  }, []);

  const fetchSuggestions = useCallback(async () => {
    const { data } = await supabase
      .from("suggestions")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setSuggestions(data);
  }, []);

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        fetchWords();
        return;
      }

      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          limit: "200"
        });
        const response = await fetch(`/api/search?${params.toString()}`);
        const data = await response.json();
        if (data.results) setWords(data.results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [fetchWords]
  );

  useEffect(() => {
    fetchWords();
    fetchSuggestions();
    fetchCount();
  }, [fetchWords, fetchSuggestions, fetchCount]);

  useEffect(() => {
    if (view === "words") {
      performSearch(searchQuery);
    } else {
      if (!searchQuery.trim()) {
        fetchSuggestions();
      } else {
        const queryLower = searchQuery.toLowerCase();
        const filtered = suggestions.filter(
          (item) =>
            item.entry_name?.toLowerCase().includes(queryLower) ||
            item.translation_en?.toLowerCase().includes(queryLower) ||
            item.translations?.some((t: string) =>
              t.toLowerCase().includes(queryLower)
            )
        );
        setSuggestions(filtered);
      }
    }
  }, [searchQuery, view, performSearch, fetchSuggestions, suggestions]);

  return {
    words,
    suggestions,
    totalCount,
    view,
    setView,
    searchQuery,
    setSearchQuery,
    isSearching,
    fetchWords,
    fetchSuggestions,
    fetchCount
  };
}