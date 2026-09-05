import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import {
  getLanguageCodeFromName,
  NATIVE_LANGUAGES,
} from "@/lib/native-languages";

const MAX_TEXT_LENGTH = 120;

const VOICES: Record<string, { locale: string; name: string }> = {
  en: { locale: "en-US", name: "en-US-JennyNeural" },
  es: { locale: "es-ES", name: "es-ES-ElviraNeural" },
  fr: { locale: "fr-FR", name: "fr-FR-DeniseNeural" },
  pt: { locale: "pt-BR", name: "pt-BR-FranciscaNeural" },
  de: { locale: "de-DE", name: "de-DE-KatjaNeural" },
  it: { locale: "it-IT", name: "it-IT-ElsaNeural" },
  ru: { locale: "ru-RU", name: "ru-RU-SvetlanaNeural" },
  ja: { locale: "ja-JP", name: "ja-JP-NanamiNeural" },
  ko: { locale: "ko-KR", name: "ko-KR-SunHiNeural" },
  zh: { locale: "zh-CN", name: "zh-CN-XiaoxiaoNeural" },
};

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => {
    return {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&apos;",
    }[character]!;
  });
}

function getSpeechRegion() {
  if (process.env.AZURE_SPEECH_REGION) {
    return process.env.AZURE_SPEECH_REGION;
  }

  // Supports the general endpoint copied from Azure Portal, for example
  // https://eastus.api.cognitive.microsoft.com/.
  const endpoint = process.env.AZURE_SPEECH_ENDPOINT;
  if (!endpoint) return null;

  try {
    return new URL(endpoint).hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.AZURE_SPEECH_KEY;
  const region = getSpeechRegion();
  if (!key || !region) {
    console.error("Azure Speech is not configured");
    return NextResponse.json(
      { error: "Speech service is not configured" },
      { status: 503 }
    );
  }

  let body: { text?: unknown; language?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (
    typeof body.text !== "string" ||
    typeof body.language !== "string" ||
    !body.text.trim() ||
    body.text.length > MAX_TEXT_LENGTH ||
    !NATIVE_LANGUAGES.some(
      (language) => language.name.toLowerCase() === body.language.toLowerCase()
    )
  ) {
    return NextResponse.json(
      { error: "Invalid speech request" },
      { status: 400 }
    );
  }

  // Validated as a string and against NATIVE_LANGUAGES above.
  const language = body.language as string;
  const languageCode = getLanguageCodeFromName(language);
  const voice = VOICES[languageCode] ?? VOICES.en;
  const ssml = `<speak version="1.0" xml:lang="${voice.locale}"><voice name="${voice.name}">${escapeXml(body.text.trim())}</voice></speak>`;

  try {
    const response = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-160kbitrate-mono-mp3",
          "User-Agent": "learn-by-reading",
        },
        body: ssml,
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (!response.ok) {
      console.error("Azure Speech synthesis failed", response.status);
      return NextResponse.json(
        { error: "Speech synthesis failed" },
        { status: 502 }
      );
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        // The client keeps a short-lived audio cache; never cache a response
        // shared between users at the HTTP layer.
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Azure Speech request failed", error);
    return NextResponse.json(
      { error: "Speech synthesis failed" },
      { status: 502 }
    );
  }
}
