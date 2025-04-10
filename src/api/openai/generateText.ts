"use server";

import openai from "@/lib/openaiClient";
import { constructPrompt } from "./prompt";

type OpenAIResponseData = {
  language: string;
  level: string;
  motherLanguage: string;
  translations: { word: string; translation: string }[];
  text: string;
};

export const generateText = async ({
  language,
  level,
  motherLanguage,
}: {
  language: string;
  level: string;
  motherLanguage: string;
}) => {
  const prompt = constructPrompt({ language, level, motherLanguage });
  console.log(prompt);
  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: `Language: ${language}, Level: ${level}, mother_language: ${motherLanguage}`,
      },
    ],
    // response_format: zodResponseFormat(languageLearningSchema, "text"),
  });

  console.log("response", response.choices[0].message.content);

  return JSON.parse(
    response.choices[0].message.content ?? ""
  ) as OpenAIResponseData;
};
