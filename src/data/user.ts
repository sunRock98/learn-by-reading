import { db } from "@/lib/db";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
    });
    return user;
  } catch (error) {
    return null;
  }
};

export const subscribeUserToCourse = async (
  userId: string,
  courseId: number
) => {
  try {
    const existingSubscription = await db.user.findFirst({
      where: {
        id: userId,
        subscriptions: {
          some: { id: courseId },
        },
      },
    });

    if (existingSubscription) {
      console.log(`User ${userId} is already subscribed to course ${courseId}`);

      return null;
    }

    const subscribedUser = await db.user.update({
      where: { id: userId },
      data: {
        subscriptions: {
          connect: { id: courseId },
        },
      },
    });

    if (!subscribedUser) {
      return null;
    }

    await db.userDictionary.create({
      data: {
        userId: userId,
        courseId: courseId,
      },
    });

    return subscribedUser;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export const unsubscribeUserFromCourse = async (
  userId: string,
  courseId: number
) => {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: {
        subscriptions: {
          disconnect: { id: courseId },
        },
      },
    });
    if (!user) {
      return null;
    }

    await db.userDictionary.deleteMany({
      where: {
        userId: userId,
        courseId: courseId,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
};

export const activateCourseToUser = async ({
  userId,
  courseId,
}: {
  userId: string;
  courseId: number;
}) => {
  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        activeCourseId: courseId,
      },
    });

    if (!updatedUser) {
      return { error: "errors.sthWentWrong" };
    }

    return { success: "New course activated", updatedUser };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};
