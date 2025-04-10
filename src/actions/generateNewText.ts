"use server";

import { generateText } from "@/api/openai/generateText";
import { Course } from "@/app/[locale]/(protected)/languages/types";
import { db } from "@/lib/db";
import { getLocale } from "next-intl/server";

export const generateNewText = async (course: Course) => {
  const locale = await getLocale();
  const data = await generateText({
    language: course.language.name,
    level: course.level.name,
    motherLanguage: locale,
  });
  const { text, translations } = data;
  console.log(text, translations);

  //add the text to the database
  await db.text.create({
    data: {
      content: text ?? "",
      course: { connect: { id: course.id } },
    },
  });
};
