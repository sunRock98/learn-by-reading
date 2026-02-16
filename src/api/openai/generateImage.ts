"use server";

import openai from "@/lib/openaiClient";

interface GenerateImageParams {
  title: string;
  textContent: string;
  language: string;
}

/**
 * Generates an illustration in The New Yorker magazine style for a text.
 * Uses DALL-E 3 to create sophisticated, editorial-style artwork.
 * Returns the image as a Buffer so it can be stored permanently in the database,
 * avoiding the issue of OpenAI's temporary URLs expiring after ~1-2 hours.
 */
export const generateImage = async ({
  title,
  textContent,
  language,
}: GenerateImageParams): Promise<Buffer | null> => {
  try {
    // Create a concise summary of the text for the image prompt
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an art director for The New Yorker magazine. Given a text, describe a single visual scene that captures its essence for an illustration. Be concise (max 50 words). Focus on mood, key objects, and atmosphere. Do not include text or letters in the description.`,
        },
        {
          role: "user",
          content: `Title: ${title}\n\nText (in ${language}):\n${textContent.substring(0, 1000)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const sceneDescription = summaryResponse.choices[0].message.content?.trim();

    if (!sceneDescription) {
      throw new Error("Failed to generate scene description");
    }

    // Generate the image with New Yorker style, using b64_json to get actual image data
    // (OpenAI's URL responses are temporary and expire after ~1-2 hours)
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create an elegant editorial illustration in the distinctive style of The New Yorker magazine covers and illustrations. The style should feature: sophisticated linework, subtle watercolor washes, muted yet refined color palette with occasional bold accents, whimsical but intelligent artistic sensibility, clean composition with negative space, slightly surreal or dreamlike quality. 

Scene to illustrate: ${sceneDescription}

Important: No text, letters, words, or typography in the image. Pure illustration only. The mood should be contemplative and literary.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
      response_format: "b64_json",
    });

    const b64Data = imageResponse.data[0]?.b64_json;

    if (!b64Data) {
      throw new Error("No image data in response");
    }

    // Convert base64 to Buffer for database storage
    return Buffer.from(b64Data, "base64");
  } catch (error) {
    console.error("Error generating image:", error);
    // Return null instead of throwing - image generation is optional
    return null;
  }
};
