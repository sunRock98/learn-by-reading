import { NextResponse } from "next/server";
import openai from "@/lib/openaiClient";
import { constructPrompt } from "@/api/openai/prompt";

const MAX_GUEST_TEXTS = 2;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { language, level, topic, interests, textCount } = body;

    if (!language || !level) {
      return NextResponse.json(
        { error: "Language and level are required" },
        { status: 400 }
      );
    }

    if (textCount !== undefined && textCount >= MAX_GUEST_TEXTS) {
      return NextResponse.json(
        {
          error:
            "Guest users can generate up to 2 texts. Please sign up to continue!",
          requiresAuth: true,
        },
        { status: 403 }
      );
    }

    const interestTopic =
      topic ||
      (interests?.length > 0
        ? interests[Math.floor(Math.random() * interests.length)]
        : undefined);

    const prompt = constructPrompt({
      language,
      level,
      motherLanguage: "English",
      topic: interestTopic,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: interestTopic
            ? `Generate a text about: ${interestTopic}`
            : "Generate an interesting text for me to read",
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;

    if (!content) {
      return NextResponse.json(
        { error: "Failed to generate text" },
        { status: 500 }
      );
    }

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

    const data = JSON.parse(cleanContent);

    return NextResponse.json({
      title: data.title,
      text: data.text,
      translations: data.translations || [],
    });
  } catch (error) {
    console.error("Error generating guest text:", error);
    return NextResponse.json(
      { error: "Failed to generate text. Please try again." },
      { status: 500 }
    );
  }
}
