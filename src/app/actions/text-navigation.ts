"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getCurrentUser } from "@/lib/auth";
import { generateNewText } from "@/actions/generateNewText";

export async function getNextTextId(
  courseId: string,
  currentTextId: string
): Promise<string | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const userId = session.user.id;
    const courseIdNum = parseInt(courseId, 10);
    const currentTextIdNum = parseInt(currentTextId, 10);

    // First, get the current text to find its position
    const currentText = await db.text.findUnique({
      where: { id: currentTextIdNum },
      select: { id: true },
    });

    if (!currentText) return null;

    // Get all texts for this course with their progress for the current user
    const textsWithProgress = await db.text.findMany({
      where: { courseId: courseIdNum },
      select: {
        id: true,
        progress: {
          where: { userId },
        },
      },
      orderBy: { id: "asc" }, // Order by text ID as a fallback
    });

    // Sort texts: unseen first, then seen, maintaining original order within each group
    const sortedTexts = textsWithProgress.sort((a, b) => {
      const aHasProgress = a.progress.length > 0;
      const bHasProgress = b.progress.length > 0;

      const aIsSeen = aHasProgress && a.progress[0].seen;
      const bIsSeen = bHasProgress && b.progress[0].seen;

      // Sort by seen status (unseen first, then seen)
      if (aIsSeen && !bIsSeen) return 1;
      if (!aIsSeen && bIsSeen) return -1;

      // If same seen status, maintain original order
      return a.id - b.id;
    });

    // Find the index of the current text
    const currentIndex = sortedTexts.findIndex(
      (text) => text.id === currentTextIdNum
    );

    // If found and not the last one, return the next text id
    if (currentIndex !== -1 && currentIndex < sortedTexts.length - 1) {
      return sortedTexts[currentIndex + 1].id.toString();
    }

    // If we're at the last text, try to generate a new one
    if (currentIndex !== -1 && currentIndex === sortedTexts.length - 1) {
      // Get the course information needed for text generation
      const course = await db.course.findUnique({
        where: { id: courseIdNum },
        include: {
          language: true,
          level: true,
        },
      });

      if (course) {
        try {
          // Generate a new text
          await generateNewText(course);

          // Get the newly created text (should be the last one created for this course)
          const newText = await db.text.findFirst({
            where: { courseId: courseIdNum },
            orderBy: { id: "desc" },
            select: { id: true },
          });

          if (newText) {
            return newText.id.toString();
          }
        } catch (error) {
          console.error("Error generating new text:", error);
        }
      }
    }

    // No next text found
    return null;
  } catch (error) {
    console.error("Error fetching next text:", error);
    return null;
  }
}

export async function getPreviousTextId(
  courseId: string,
  currentTextId: string
): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return null;

    const userId = user.id;
    const courseIdNum = parseInt(courseId, 10);
    const currentTextIdNum = parseInt(currentTextId, 10);

    // First, get the current text to find its position
    const currentText = await db.text.findUnique({
      where: { id: currentTextIdNum },
      select: { id: true },
    });

    if (!currentText) return null;

    // Get all texts for this course with their progress for the current user
    const textsWithProgress = await db.text.findMany({
      where: { courseId: courseIdNum },
      select: {
        id: true,
        progress: {
          where: { userId },
        },
      },
      orderBy: { id: "asc" }, // Order by text ID as a fallback
    });

    // Sort texts: unseen first, then seen, maintaining original order within each group
    const sortedTexts = textsWithProgress.sort((a, b) => {
      const aHasProgress = a.progress.length > 0;
      const bHasProgress = b.progress.length > 0;

      const aIsSeen = aHasProgress && a.progress[0].seen;
      const bIsSeen = bHasProgress && b.progress[0].seen;

      // Sort by seen status (unseen first, then seen)
      if (aIsSeen && !bIsSeen) return 1;
      if (!aIsSeen && bIsSeen) return -1;

      // If same seen status, maintain original order
      return a.id - b.id;
    });

    // Find the index of the current text
    const currentIndex = sortedTexts.findIndex(
      (text) => text.id === currentTextIdNum
    );

    // If found and not the first one, return the previous text id
    if (currentIndex > 0) {
      return sortedTexts[currentIndex - 1].id.toString();
    }

    // No previous text found
    return null;
  } catch (error) {
    console.error("Error fetching previous text:", error);
    return null;
  }
}
