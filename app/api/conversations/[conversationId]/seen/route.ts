/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function POST(
  _request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    const { conversationId } = params;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userIds: {
          has: currentUser.id,
        },
      },
      include: {
        messages: {
          include: {
            seen: true,
            sender: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!conversation) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const unseenMessages = conversation.messages.filter(
      (message) =>
        !message.seen.some((user) => user.id === currentUser.id) &&
        message.sender.id !== currentUser.id
    );

    if (unseenMessages.length === 0) {
      return NextResponse.json([]);
    }

    const updatedMessages = await Promise.all(
      unseenMessages.map((message) =>
        prisma.message.update({
          where: {
            id: message.id,
          },
          data: {
            seen: {
              connect: {
                id: currentUser.id,
              },
            },
          },
          include: {
            seen: true,
            sender: true,
          },
        })
      )
    );

    return NextResponse.json(updatedMessages);
  } catch (error: any) {
    console.log(error, "CONVERSATION_SEEN_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
