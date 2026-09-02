"use client";

import { useEffect, useRef, useState } from "react";
import { createDream } from "@/lib/actions/dreams";
import { Button } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";

export function NewDreamForm() {
  const [showDetails, setShowDetails] = useState(false);
  const [narrative, setNarrative] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [usedVoice, setUsedVoice] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldBeRecordingRef = useRef(false);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setSpeechSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    return () => {
      shouldBeRecordingRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  function startRecording() {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) return;
    setSpeechError(null);

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalChunk += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (finalChunk.trim()) {
        setNarrative((prev) => (prev ? `${prev.trim()} ${finalChunk.trim()}` : finalChunk.trim()));
        setUsedVoice(true);
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      const errorCode = (event as unknown as { error?: string }).error;
      if (errorCode === "not-allowed" || errorCode === "service-not-allowed") {
        setSpeechError(
          "Microphone access was blocked. Check your browser's site settings and allow the microphone for this page."
        );
        shouldBeRecordingRef.current = false;
      } else if (errorCode === "network") {
        setSpeechError(
          "Could not reach the speech recognition service. This can happen with some privacy browsers or extensions that block it, even though microphone access itself was granted."
        );
        shouldBeRecordingRef.current = false;
      } else if (errorCode === "no-speech") {
        // Silence is not an error worth surfacing, continuous mode will
        // restart itself via onend below.
      } else if (errorCode === "audio-capture") {
        setSpeechError("No microphone could be found or accessed.");
        shouldBeRecordingRef.current = false;
      } else {
        setSpeechError("Voice capture stopped unexpectedly. You can try again.");
        shouldBeRecordingRef.current = false;
      }
    };

    recognition.onend = () => {
      setInterimText("");
      // Some browsers end the session after a pause even in continuous
      // mode. If the user has not explicitly stopped, pick back up rather
      // than silently going quiet, which is what looked like "not working."
      if (shouldBeRecordingRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          // Fall through to stopping the UI state below.
        }
      }
      setIsRecording(false);
    };

    shouldBeRecordingRef.current = true;
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  }

  function stopRecording() {
    shouldBeRecordingRef.current = false;
    recognitionRef.current?.stop();
    setIsRecording(false);
  }

  return (
    <form action={createDream} className="space-y-3">
      <div className="relative">
        <textarea
          name="narrative"
          required
          autoFocus
          rows={10}
          value={narrative}
          onChange={(event) => setNarrative(event.target.value)}
          placeholder="What happened in the dream? Write it as you remember it, in whatever order it comes back to you."
          className="w-full rounded-sm border border-line bg-paper px-4 py-3 text-lg leading-relaxed placeholder:text-text-muted focus:border-lamp"
        />
        {interimText && (
          <p className="absolute left-4 right-4 bottom-3 text-sm text-text-muted italic pointer-events-none">
            {interimText}
          </p>
        )}
      </div>

      {speechSupported && (
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`inline-flex items-center gap-2 text-sm border rounded-sm px-3 py-1.5 ${
                isRecording ? "border-danger text-danger" : "border-line text-text-muted hover:border-lamp"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isRecording ? "bg-danger animate-pulse" : "bg-text-muted"}`}
              />
              {isRecording ? "Stop recording" : "Speak your dream instead"}
            </button>
            {isRecording && (
              <span className="text-xs text-text-muted">Listening, keep talking</span>
            )}
          </div>
          {speechError && (
            <p className="text-xs text-danger">{speechError}</p>
          )}
        </div>
      )}

      <input type="hidden" name="capture_method" value={usedVoice ? "voice" : "text"} />

      {!showDetails ? (
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="text-sm text-text-muted underline"
        >
          Add a title, date, or how it felt
        </button>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-line">
          <label className="block sm:col-span-2 pt-4">
            <span className="block text-sm text-text-muted mb-1.5">
              Title
            </span>
            <input
              type="text"
              name="title"
              placeholder="Optional"
              className={inputClasses}
            />
          </label>
          <label className="block">
            <span className="block text-sm text-text-muted mb-1.5">
              Date
            </span>
            <input
              type="date"
              name="dream_date"
              defaultValue={today}
              className={inputClasses}
            />
          </label>
          <label className="block">
            <span className="block text-sm text-text-muted mb-1.5">
              How you felt on waking
            </span>
            <input
              type="text"
              name="emotional_state"
              placeholder="Optional"
              className={inputClasses}
            />
          </label>
          <label className="block">
            <span className="block text-sm text-text-muted mb-1.5">
              Clarity (1 to 5)
            </span>
            <input
              type="number"
              name="clarity_level"
              min={1}
              max={5}
              className={inputClasses}
            />
          </label>
          <label className="block">
            <span className="block text-sm text-text-muted mb-1.5">
              Confidence in memory (1 to 5)
            </span>
            <input
              type="number"
              name="confidence_in_memory"
              min={1}
              max={5}
              className={inputClasses}
            />
          </label>
        </div>
      )}

      {/* Hidden date field ensures a value is submitted even if details are never expanded. */}
      {!showDetails && <input type="hidden" name="dream_date" value={today} />}

      <Button type="submit" className="px-6 py-3">
        Save dream
      </Button>
    </form>
  );
}
