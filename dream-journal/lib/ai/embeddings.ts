"use server";

// Generates a text embedding for semantic search over a user's own dreams.
// Anthropic does not currently offer a public embeddings endpoint, so this
// uses OpenAI's text-embedding-3-small, a separate optional key from the
// ANTHROPIC_API_KEY used for Scripture suggestions elsewhere. Both AI
// features degrade silently if their key is missing, rather than blocking
// the underlying capture or search flow.

export async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !text.trim()) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.slice(0, 8000),
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const embedding = data.data?.[0]?.embedding;
    if (!Array.isArray(embedding)) return null;
    return embedding;
  } catch {
    // A failed embedding should never block saving the dream itself.
    return null;
  }
}
