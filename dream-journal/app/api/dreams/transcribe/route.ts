import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Fallback voice capture for browsers with no SpeechRecognition support
// (Firefox entirely, and Safari inconsistently). The client records audio
// with MediaRecorder and posts the resulting blob here; this forwards it to
// OpenAI's Whisper transcription endpoint using the same OPENAI_API_KEY
// already used for semantic search embeddings (see lib/ai/embeddings.ts).
// Requires auth, mainly to keep this from being used as an open proxy to a
// paid API, not because the audio itself is stored anywhere.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Voice transcription is not configured on this server." },
      { status: 503 }
    );
  }

  const incoming = await request.formData();
  const audio = incoming.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "No audio received." }, { status: 400 });
  }

  // A dream recording read aloud rarely runs long, but this keeps a bad
  // upload from turning into an expensive request.
  const MAX_BYTES = 25 * 1024 * 1024;
  if (audio.size > MAX_BYTES) {
    return NextResponse.json({ error: "Recording is too long." }, { status: 413 });
  }

  const whisperForm = new FormData();
  whisperForm.append("file", audio, "dream.webm");
  whisperForm.append("model", "whisper-1");

  try {
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: whisperForm,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Transcription failed. You can keep typing instead." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text = typeof data.text === "string" ? data.text.trim() : "";
    if (!text) {
      return NextResponse.json({ error: "No speech was detected." }, { status: 422 });
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the transcription service." },
      { status: 502 }
    );
  }
}
