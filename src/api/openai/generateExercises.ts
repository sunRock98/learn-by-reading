"use server";

import openai from "@/lib/openaiClient";

export interface GeneratedExercise {
  type:
    | "MULTIPLE_CHOICE"
    | "FILL_BLANK"
    | "TRUE_FALSE"
    | "TRANSLATION"
    | "SENTENCE_ORDER";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface GenerateExercisesParams {
  textContent: string;
  textTitle: string;
  language: string;
  level: string;
  motherLanguage: string;
}

const constructExercisePrompt = ({
  textContent,
  textTitle,
  language,
  level,
  motherLanguage,
}: GenerateExercisesParams) => {
  return `You are an expert language teacher creating exercises for a language learning platform.

Based on the following text, generate a set of exercises to test the learner's comprehension and vocabulary.

TEXT TITLE: "${textTitle}"
TEXT CONTENT:
"""
${textContent}
"""

TARGET LANGUAGE: ${language}
LEARNER LEVEL: ${level}
LEARNER'S NATIVE LANGUAGE: ${motherLanguage}

EXERCISE REQUIREMENTS:
Generate exactly 8 exercises with the following distribution:
- 2 MULTIPLE_CHOICE: Questions about text comprehension with 4 options (A, B, C, D). Questions should be in ${language}.
- 2 FILL_BLANK: Sentences from the text with a key word removed (marked as ___). The sentence MUST come from or be closely based on the text. Provide the missing word as correctAnswer.
- 1 TRUE_FALSE: A statement about the text that is either true or false. Statement should be in ${language}. correctAnswer must be exactly "true" or "false".
- 2 TRANSLATION: A word or short phrase from the text to translate from ${language} to ${motherLanguage}. The correctAnswer should be the translation in ${motherLanguage}.
- 1 SENTENCE_ORDER: A sentence from the text split into INDIVIDUAL words that need to be reordered. The "options" array must contain SINGLE WORDS (one word per array element), shuffled randomly. The "correctAnswer" is the correctly ordered full sentence.

IMPORTANT RULES:
- All questions and options for MULTIPLE_CHOICE, FILL_BLANK, TRUE_FALSE, and SENTENCE_ORDER should be in ${language}
- TRANSLATION exercises: question is the word/phrase in ${language}, correctAnswer is in ${motherLanguage}
- Difficulty must match ${level} level
- Questions should test actual comprehension of the text, not just surface-level details
- Explanations should be concise and in ${motherLanguage} to help the learner understand
- For FILL_BLANK: the sentence with ___ should have enough context to identify the missing word
- For SENTENCE_ORDER: each element in "options" MUST be exactly ONE word. Do NOT put multiple words in one option. Do NOT generate full sentence permutations. Example: ["muitos", "fizeram", "eles", "risadas"] NOT ["eles risadas fizeram muitos", "fizeram muitos eles risadas"]. Use 4-7 words from a short sentence.
- For MULTIPLE_CHOICE: all 4 options must be plausible, only 1 correct

OUTPUT FORMAT (STRICT):
Return ONLY a valid JSON object. No explanations, no markdown, no extra text.

{
  "exercises": [
    {
      "type": "MULTIPLE_CHOICE",
      "question": "Question text in ${language}?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Explanation in ${motherLanguage}"
    },
    {
      "type": "FILL_BLANK",
      "question": "The cat sat on the ___.",
      "correctAnswer": "mat",
      "explanation": "Explanation in ${motherLanguage}"
    },
    {
      "type": "TRUE_FALSE",
      "question": "Statement about the text in ${language}.",
      "correctAnswer": "true",
      "explanation": "Explanation in ${motherLanguage}"
    },
    {
      "type": "TRANSLATION",
      "question": "word_in_${language}",
      "correctAnswer": "translation_in_${motherLanguage}",
      "explanation": "Explanation in ${motherLanguage}"
    },
    {
      "type": "SENTENCE_ORDER",
      "question": "Put the words in the correct order:",
      "options": ["word3", "word1", "word4", "word2"],
      "correctAnswer": "word1 word2 word3 word4",
      "explanation": "Explanation in ${motherLanguage}"
    }
  ]
}

Ensure the JSON is valid and parseable.`;
};

export const generateExercises = async (
  params: GenerateExercisesParams
): Promise<GeneratedExercise[]> => {
  const prompt = constructExercisePrompt(params);

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
          content:
            "Generate exercises based on the text provided. Return only valid JSON.",
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error("No content in exercise generation response");
    }

    // Clean the response
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

    const parsed = JSON.parse(cleanContent) as {
      exercises: GeneratedExercise[];
    };

    return parsed.exercises;
  } catch (error) {
    console.error("Error generating exercises:", error);
    throw error;
  }
};
