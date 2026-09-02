"use server";

// Suggests Scripture references for a user to consider, never a meaning.
// Returns an empty array rather than throwing if no API key is configured,
// so this feature degrades silently instead of breaking the interpretation
// flow it sits beside.

const SYSTEM_PROMPT = `You help a person examine their own dream by pointing
toward Scripture passages worth reading. You never state what the dream
means, never declare a source, and never speak with certainty about
spiritual matters. Given a dream narrative, return between two and five
Bible references (book, chapter, and verse only, no commentary) that the
person might find worth reading alongside their own reflection. Respond
with a JSON array of strings only, for example ["Genesis 37:5-11","Acts 2:17"].
No other text.`;

export async function suggestScriptureReferences(
  narrative: string
): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !narrative.trim()) return [];

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: narrative.slice(0, 4000) }],
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const text = data.content?.find(
      (block: { type: string }) => block.type === "text"
    )?.text;
    if (!text) return [];

    const parsed = JSON.parse(text.trim());
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string").slice(0, 5);
  } catch {
    // Any failure here should never block the user's own interpretation work.
    return [];
  }
}
