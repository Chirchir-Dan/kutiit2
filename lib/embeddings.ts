// lib/embeddings.ts

const GEMINI_EMBEDDING_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

export async function generateEmbedding(
  text: string
): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY not set");
    return null;
  }

  if (!text || text.trim().length === 0) {
    return null;
  }

  try {
    const response = await fetch(`${GEMINI_EMBEDDING_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: {
          parts: [{ text: text.trim() }]
        },
        outputDimensionality: 768
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Embedding API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    const embedding = data.embedding?.values;

    if (!embedding || !Array.isArray(embedding)) {
      console.error("No embedding in response:", data);
      return null;
    }

    return embedding;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    return null;
  }
}

// Build the text that represents a word for embedding purposes.
// Handles nouns, verbs, proverbs, and riddles uniformly.
export function buildEmbeddingText(word: {
  entry_name?: string | null;
  translation_en?: string | null;
  translations?: string[] | null;
  answer?: string | null;
  word_type?: string | null;
  notes?: string | null;
}): string {
  const clean = (s: string | null | undefined): string =>
    (s || "").replace(/\bNandi\b/gi, "").trim();

  const parts: string[] = [];

  if (word.entry_name) parts.push(clean(word.entry_name));
  if (word.translation_en) parts.push(clean(word.translation_en));

  if (word.translations && word.translations.length > 0) {
    parts.push(word.translations.map(clean).filter(Boolean).join(", "));
  }

  if (word.answer) parts.push(clean(word.answer));
  if (word.word_type) parts.push(`(${word.word_type})`);
  if (word.notes) parts.push(clean(word.notes));

  return parts.filter(Boolean).join(" ");
}