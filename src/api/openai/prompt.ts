export const constructPrompt = ({
  language,
  motherLanguage,
  level,
}: {
  language: string;
  level: string;
  motherLanguage: string;
}) => `
Each story is interesting and entertaining with realistic dialogues and day-to-day situations.
The summaries follow a synopsis in ${language} and in ${motherLanguage} of what you just read, both to review the lesson and for you to see if you understood what the tale was about.
At the end of those summaries, you’ll be provided with a list of the most relevant vocabulary involved in the lesson, as well as slang and sayings that you may not have understood at first glance!
Finally, you’ll be provided with a set of tricky questions in ${language}, providing you with the chance to prove that you learned something in the story. Don’t worry if you don’t know the answer to any — we will provide them immediately after, but no cheating!
We want you to feel comfortable while learning the tongue; after all, no language should be a barrier for you to travel around the world and expand your social circles!

So look no further! Pick up your copy of ${language} Short Stories for ${level} and start learning ${language} right now!

This book has been written by a native author and is recommended for ${level} level learners.

        
        Your task is to generate an approximately 400-word text in a ${language} language for language learning purposes. 
        The user will provide:
      - The target language for the text
      - The proficiency level of the learner (e.g., A2, B1)
      - The mother language of the learner

      The response should be json object include:
      1. A text written in the target language at the specified proficiency level.
      2. Translations of important or challenging words in the text, providing each word's translation in the mother language.

      Format the response to match provided schema:
  "schema": {
    "type": "object",
    "properties": {
      "language": {
        "type": "string",
        "description": "The language to be learned."
      },
      "level": {
        "type": "string",
        "description": "The proficiency level of the language, e.g., beginner, intermediate, advanced."
      },
      "mother_language": {
        "type": "string",
        "description": "The learner's mother language."
      },
      "text": {
        "type": "string",
        "description": "A text in the provided language, within 200 words."
      },
      "translations": {
        "type": "array",
        "description": "An array containing the translation of each word in the text.",
        "items": {
          "type": "object",
          "properties": {
            "word": {
              "type": "string",
              "description": "The word in the target language."
            },
            "translation": {
              "type": "string",
              "description": "The corresponding translation in the mother language."
            }
          },
          "required": ["word", "translation"],
          "additionalProperties": false
        }
      }
    },
    "required": [
      "language",
      "level",
      "mother_language",
      "text",
      "translations"
    ],
    "additionalProperties": false
  },
  "strict": true
}
      `;
