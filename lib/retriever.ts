import { getServerSupabase } from "./supabase";
import { generateEmbedding } from "./embeddings";

interface Word {
  id: string;
  word_type: string;
  translation_en: string;
  singular_indefinite: string | null;
  singular_definite: string | null;
  plural_indefinite: string | null;
  plural_definite: string | null;
  entry_name: string | null;
  examples: string | null;
  imperative: string | null;
  notes: string | null;
  is_irregular: boolean | null;
  present_1sg: string | null;
  present_2sg: string | null;
  present_3sg: string | null;
  present_1pl: string | null;
  present_2pl: string | null;
  present_3pl: string | null;
  similarity?: number;
}

// Fallback: keyword search if embeddings fail or no matches
async function keywordSearch(
  userQuery: string,
  limit: number
): Promise<Word[]> {
  const stopWords = new Set([
    "a", "an", "the", "is", "are", "was", "were", "do", "does", "did",
    "how", "what", "when", "where", "who", "why", "to", "in", "on",
    "at", "for", "with", "about", "my", "your", "his", "her", "their",
    "our", "me", "you", "him", "them", "us", "i", "it", "this", "that",
    "these", "those", "can", "could", "would", "should", "will", "shall",
    "and", "or", "but", "if", "then", "so", "of", "from", "by",
    "say", "saying", "said"
  ]);

  const keywords = userQuery
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (keywords.length === 0) return [];

  const allResults: Word[] = [];
  const seenIds = new Set<string>();
  const supabase = getServerSupabase();

  for (const keyword of keywords) {
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .ilike("translation_en", `%${keyword}%`)
      .limit(10);

    if (error) {
      console.error("Keyword search error:", error);
      continue;
    }

    if (data) {
      for (const entry of data as Word[]) {
        if (!seenIds.has(entry.id)) {
          seenIds.add(entry.id);
          allResults.push(entry);
        }
      }
    }
  }

  return allResults.slice(0, limit);
}

export async function retrieveRelevantWords(
  userQuery: string,
  limit = 15
): Promise<Word[]> {
  if (!userQuery.trim()) return [];

  try {
    // Generate embedding for the user's query
    const embedding = await generateEmbedding(userQuery);

    if (!embedding) {
      console.warn("Embedding failed, falling back to keyword search");
      return keywordSearch(userQuery, limit);
    }

    // Vector search via Supabase RPC
    const supabase = getServerSupabase();
    const { data, error } = await supabase.rpc("match_words", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: limit
    });

    if (error) {
      console.error("Vector search error:", error);
      return keywordSearch(userQuery, limit);
    }

    if (!data || data.length === 0) {
      console.warn("No vector matches, falling back to keyword search");
      return keywordSearch(userQuery, limit);
    }

    return data as Word[];
  } catch (error) {
    console.error("Retriever error:", error);
    return keywordSearch(userQuery, limit);
  }
}