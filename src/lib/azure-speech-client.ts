"use client";

const CACHE_TTL_MS = 60 * 60 * 1000;
const audioCache = new Map<string, { blob: Blob; createdAt: number }>();

function getCacheKey(text: string, language: string) {
  return `${language.toLowerCase()}:${text.trim().toLowerCase()}`;
}

async function getSpeechAudio(text: string, language: string): Promise<Blob> {
  const cacheKey = getCacheKey(text, language);
  const cached = audioCache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return cached.blob;
  }

  const response = await fetch("/api/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });
  if (!response.ok)
    throw new Error(`Speech request failed: ${response.status}`);

  const blob = await response.blob();
  audioCache.set(cacheKey, { blob, createdAt: Date.now() });
  return blob;
}

export async function playAzureSpeech(text: string, language: string) {
  const audio = new Audio(
    URL.createObjectURL(await getSpeechAudio(text, language))
  );
  const releaseUrl = () => URL.revokeObjectURL(audio.src);
  audio.addEventListener("ended", releaseUrl, { once: true });
  audio.addEventListener("error", releaseUrl, { once: true });
  await audio.play();
}
