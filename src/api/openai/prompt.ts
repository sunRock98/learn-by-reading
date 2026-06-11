export const constructPrompt = ({
  language,
  motherLanguage,
  level,
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
  let topicInstruction: string;
  if (topic) {
    topicInstruction = `The story MUST be centered on the following topic: "${topic}".`;
  } else if (interests?.length) {
    topicInstruction = `The learner is interested in: ${interests.join(", ")}. Pick ONE of these interests and write a story centered on that theme. Choose a concrete, everyday angle within that interest.`;
  } else {
    topicInstruction = `Choose a single concrete topic from everyday life (work, travel, family, food, relationships, routines, small problems, unexpected situations).`;
  }

  const vocabularyReinforcementInstruction = wordsToReinforce?.length
    ? `
VOCABULARY REINFORCEMENT (IMPORTANT)
The learner is practicing these words from their personal dictionary. You MUST naturally incorporate as many of these words as possible into the story:
${wordsToReinforce.join(", ")}

- Use each word at least once in a natural, contextually appropriate way
- Do NOT force words if they don't fit the story naturally
- These words should blend seamlessly into the narrative
- Include these words in the "translations" array as well
`
    : "";

  const levelCode = level.toUpperCase();
  const expressionInstruction = (() => {
    if (levelCode === "A1") {
      return `
IDIOMS, PROVERBS & FIXED EXPRESSIONS
- Do NOT use idioms or proverbs at A1.
- You may include 1 very common fixed everyday phrase only if it is transparent and useful.
`;
    }

    if (levelCode === "A2") {
      return `
IDIOMS, PROVERBS & FIXED EXPRESSIONS
- Include 1 simple fixed everyday expression, collocation, or routine phrase.
- Avoid proverbs and non-literal idioms unless they are extremely common and easy.
- Include the expression in the "translations" array.
`;
    }

    if (levelCode === "B1") {
      return `
IDIOMS, PROVERBS & FIXED EXPRESSIONS
- Include 1 common fixed expression or light idiom that a native speaker would actually use.
- It must be understandable from context.
- Include the expression in the "translations" array as a multi-word phrase.
`;
    }

    if (levelCode === "B2") {
      return `
IDIOMS, PROVERBS & FIXED EXPRESSIONS
- Include 1-2 natural fixed expressions, idioms, or a common proverb.
- Use them where they belong naturally, not as decoration.
- Include them in the "translations" array as multi-word phrases with natural translations.
`;
    }

    return `
IDIOMS, PROVERBS & FIXED EXPRESSIONS
- Include 2-3 natural fixed expressions, idioms, sayings, or proverbs.
- Prefer expressions that reveal culture, pragmatics, or native-like phrasing.
- Make their meaning clear from context.
- Include them in the "translations" array as multi-word phrases with natural translations.
`;
  })();

  const pickOne = (items: string[]) =>
    items[Math.floor(Math.random() * items.length)];

  const generationBrief = {
    format: pickOne([
      "compact short story",
      "diary entry or personal note",
      "scene observed in public",
      "letter or message thread",
      "small mystery",
      "practical magazine-style article with a human example",
      "character portrait",
      "travel or neighborhood vignette",
      "workplace or family scene",
      "memory with a present-day consequence",
    ]),
    voice: pickOne([
      "warm and observant",
      "dryly humorous",
      "curious and practical",
      "quiet and reflective",
      "lively but simple",
      "slightly suspenseful",
    ]),
    structure: pickOne([
      "begin in the middle of an action",
      "begin with a concrete object",
      "begin with a surprising sentence",
      "begin with a small conflict",
      "begin with a specific place",
      "begin with a decision the character regrets",
    ]),
    ending: pickOne([
      "end with an action",
      "end with a clear practical decision",
      "end with a quiet image",
      "end with a small joke",
      "end with a new question",
      "end with a changed opinion",
    ]),
  };

  return `
You are a professional language teacher AND an experienced magazine writer.

Your task is to write a compelling reading text for a language learning platform.
The text should be so engaging that the learner wants to read the next one.

STYLE & ENGAGEMENT (VERY IMPORTANT)
- Write in the spirit of high-quality magazine storytelling (e.g. The New Yorker)
- Do NOT reuse a generic "person has a small problem, dialogue, twist, reflection" template
- Avoid predictable moral endings and repetitive story arcs
- Make the text feel specific: concrete place, concrete objects, concrete social situation
- Choose ONE fresh organizing principle for this text:
  - a compact short story
  - a diary entry or personal note
  - a scene observed in public
  - a letter or message thread
  - a small mystery
  - a practical magazine-style article with a human example
  - a character portrait
  - a travel or neighborhood vignette
  - a workplace or family scene
  - a memory with a present-day consequence
- Vary the opening. It does NOT always need to start with a question.
- Vary the ending. It can end with an action, image, realization, joke, unanswered question, or practical decision.
- Engagement is mandatory, but NEVER sacrifice language simplicity

TEXT SPECIFICATION
- Target language: ${language}
- Learner's native language: ${motherLanguage}
- Proficiency level: ${level}
- Length: 300–400 words

${topicInstruction}

GENERATION BRIEF FOR THIS REQUEST
- Format: ${generationBrief.format}
- Voice: ${generationBrief.voice}
- Opening constraint: ${generationBrief.structure}
- Ending constraint: ${generationBrief.ending}
- Follow this brief for this request so generated texts do not feel structurally identical.

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
- Use short paragraphs, but vary paragraph length naturally
- Dialogue is optional. Include it only if it makes the text better.
- If you use dialogue, use 1-4 short, realistic lines.
- Do not use the same narrative structure as a typical beginner textbook story.
${vocabularyReinforcementInstruction}
${expressionInstruction}
VOCABULARY SELECTION
- Select 10–15 important or slightly challenging words, collocations, fixed expressions, idioms, sayings, or short phrases from the text
- Words should be useful in real life and relevant to the story
- Avoid names and obvious cognates unless essential
- For ${level}, prioritize useful expressions the learner can reuse in speech or writing
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
