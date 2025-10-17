/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/app/libs/prismadb";
import type { FullMessageType } from "@/app/types";
import getCurrentUser from "./getCurrentUser";

const getMessages = async (
  conversationId: string
): Promise<FullMessageType[]> => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return [];
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userIds: {
          has: currentUser.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!conversation) {
      return [];
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      include: {
        seen: true,
        sender: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return messages;
  } catch (error: any) {
    return [] as FullMessageType[];
  }
};

export default getMessages;
