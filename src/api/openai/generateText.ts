"use server";

import openai from "@/lib/openaiClient";
import { constructPrompt } from "./prompt";

type OpenAIResponseData = {
  language: string;
  level: string;
  motherLanguage: string;
  translations: { word: string; translation: string }[];
  text: string;
  title: string;
};

export const generateText = async ({
  language,
  level,
  motherLanguage,
  topic,
  wordsToReinforce,
  interests,
}: {
  language: string;
  level: string;
  motherLanguage: string;
  topic?: string;
  wordsToReinforce?: string[];
  interests?: string[];
}) => {
  const prompt = constructPrompt({
    language,
    level,
    motherLanguage,
    topic,
    wordsToReinforce,
    interests,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: topic
            ? `Generate a text about: ${topic}`
            : "Generate an interesting text for me to read",
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    console.log("Generated text response:", content);

    if (!content) {
      throw new Error("No content in response");
    }

    // Clean the response (remove markdown code blocks if present)
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.slice(7);
    }
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith("```")) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();

    return JSON.parse(cleanContent) as OpenAIResponseData;
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};
