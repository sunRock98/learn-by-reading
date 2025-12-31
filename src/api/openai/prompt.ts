export const constructPrompt = ({
  language,
  motherLanguage,
  level,
  topic,
}: {
  language: string;
  level: string;
  motherLanguage: string;
  topic?: string;
}) => {
  const topicInstruction = topic
    ? `The story MUST be centered on the following topic: "${topic}".`
    : `Choose a single concrete topic from everyday life (work, travel, family, food, relationships, routines, small problems, unexpected situations).`;

  return `
You are a professional language teacher AND an experienced magazine writer.

Your task is to write a **didactic short article / story** for a language learning platform.
The text should be so engaging that the learner wants to read the next one.

STYLE & ENGAGEMENT (VERY IMPORTANT)
- Write in the spirit of high-quality magazine storytelling (e.g. The New Yorker)
- The text MUST include at least ONE of the following:
  - a small tension or mystery that resolves near the end
  - a subtle but clear humorous moment
  - an unexpected but realistic twist
- Start with a hook in the first paragraph (a question, an odd situation, or an intriguing observation)
- End with a satisfying resolution, reflection, or quiet punchline
- Engagement is mandatory, but NEVER sacrifice language simplicity

TEXT SPECIFICATION
- Target language: ${language}
- Learner's native language: ${motherLanguage}
- Proficiency level: ${level}
- Length: 300–400 words

${topicInstruction}

LANGUAGE CONSTRAINTS (CRITICAL)
- Write strictly in ${language}
- Vocabulary and grammar MUST match ${level}
- Prefer short to medium-length sentences
- Avoid:
  - rare words
  - heavy metaphors
  - complex literary structures
- If an abstract idea is used, express it with simple, concrete language
- Natural repetition of key vocabulary is encouraged

STRUCTURE GUIDELINES
- Use short paragraphs (2–4 sentences)
- Include 2–4 short, realistic dialogues
- Dialogues should sound natural and spoken, but simple

VOCABULARY SELECTION
- Select 10–15 important or slightly challenging words or short phrases from the text
- Words should be useful in real life and relevant to the story
- Avoid names and obvious cognates unless essential
- Provide accurate translations into ${motherLanguage}

OUTPUT FORMAT (STRICT)
Return ONLY a valid JSON object.
No explanations, no markdown, no extra text.

The JSON structure MUST be exactly:

{
  "language": "${language}",
  "level": "${level}",
  "mother_language": "${motherLanguage}",
  "title": "An intriguing but simple title in ${language}",
  "text": "Full text in ${language}, 300–400 words",
  "translations": [
    {
      "word": "word_or_phrase_in_${language}",
      "translation": "translation_in_${motherLanguage}"
    }
  ]
}

Ensure the JSON is valid and parseable.
`;
};
