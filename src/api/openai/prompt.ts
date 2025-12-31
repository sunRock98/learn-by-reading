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
    ? `The story should be about: "${topic}". Make it engaging and relevant to this topic.`
    : "Choose an interesting and engaging topic for the story. It could be about daily life, adventure, travel, food, relationships, or any topic that would be interesting for language learners.";

  return `You are an expert language teacher creating engaging content for language learners.

Your task is to generate an approximately 300-400 word text in ${language} for language learning purposes.

Requirements:
- Target language: ${language}
- Proficiency level: ${level}
- Learner's native language: ${motherLanguage}

${topicInstruction}

Guidelines for the text:
- Write in ${language} at the ${level} proficiency level
- Use vocabulary and grammar appropriate for ${level} learners
- Include realistic dialogues and day-to-day situations
- Make the story interesting and entertaining
- Use a variety of common vocabulary that learners at this level should know

The response must be a valid JSON object with this exact structure:
{
  "language": "${language}",
  "level": "${level}",
  "mother_language": "${motherLanguage}",
  "title": "An engaging title for the text in ${language}",
  "text": "The full text content in ${language} (300-400 words)",
  "translations": [
    {"word": "word_in_${language}", "translation": "translation_in_${motherLanguage}"},
    ...
  ]
}

Include 10-15 important or challenging vocabulary words with their translations.
Return ONLY the JSON object, no additional text or formatting.`;
};
