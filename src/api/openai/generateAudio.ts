"use server";

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type VoiceType =
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer";

export interface GenerateAudioResult {
  audioBase64: string;
  contentType: string;
}

export async function generateAudio({
  text,
  voice = "nova",
  speed = 1.0,
}: {
  text: string;
  voice?: VoiceType;
  speed?: number;
}): Promise<GenerateAudioResult> {
  try {
    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: voice,
      input: text,
      speed: speed,
      language: "pt",
      instructions: "deep tone which storyteller would use",
    } as OpenAI.Audio.Speech.SpeechCreateParams);

    // Convert the response to base64
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const audioBase64 = buffer.toString("base64");

    return {
      audioBase64,
      contentType: "audio/mpeg",
    };
  } catch (error) {
    console.error("Error generating audio:", error);
    throw new Error("Failed to generate audio");
  }
}

// Generate audio for a text and return the URL (for streaming)
export async function generateAudioStream({
  text,
  voice = "nova",
  speed = 1.0,
}: {
  text: string;
  voice?: VoiceType;
  speed?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: voice,
    input: text,
    speed: speed,
  });

  // Return the stream directly
  return response.body as ReadableStream<Uint8Array>;
}
