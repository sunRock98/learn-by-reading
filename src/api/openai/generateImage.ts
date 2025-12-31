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
 */
export const generateImage = async ({
  title,
  textContent,
  language,
}: GenerateImageParams): Promise<string | null> => {
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

    // Generate the image with New Yorker style
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create an elegant editorial illustration in the distinctive style of The New Yorker magazine covers and illustrations. The style should feature: sophisticated linework, subtle watercolor washes, muted yet refined color palette with occasional bold accents, whimsical but intelligent artistic sensibility, clean composition with negative space, slightly surreal or dreamlike quality. 

Scene to illustrate: ${sceneDescription}

Important: No text, letters, words, or typography in the image. Pure illustration only. The mood should be contemplative and literary.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
    });

    const imageUrl = imageResponse.data[0]?.url;

    if (!imageUrl) {
      throw new Error("No image URL in response");
    }

    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    // Return null instead of throwing - image generation is optional
    return null;
  }
};
