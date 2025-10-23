/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

/**
 * @swagger
 * /api/conversations/{conversationId}/seen:
 *   post:
 *     summary: 将对话中的消息标记为已读
 *     description: |
 *       此端点用于将指定对话中的所有未读消息标记为当前登录用户已读。
 *       前端应在用户打开或查看对话时调用此API。
 *     tags: [Conversations]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: 需要标记消息为已读的对话ID。
 *     responses:
 *       '200':
 *         description: 成功，返回被更新的消息数组。如果没有未读消息，则返回空数组。
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       '401':
 *         description: 未经授权，用户未登录。
 *       '404':
 *         description: 对话未找到，或当前用户不属于该对话。
 *       '500':
 *         description: 服务器内部错误。
 */
export async function POST(
  // 请求对象，这里我们不需要它的内容，所以用下划线开头
  _request: Request,
  // 从动态路由中解构出参数，例如 /api/conversations/abc-123/seen -> conversationId: 'abc-123'
  { params }: { params: { conversationId: string } }
) {
  try {
    // 1. 获取当前登录的用户信息
    const currentUser = await getCurrentUser();
    const { conversationId } = params;

    // 2. 验证用户是否登录
    if (!currentUser?.id || !currentUser?.email) {
      // 如果未登录，返回 401 未授权错误
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 3. 查找对应的对话
    // 条件：ID 必须匹配，并且当前用户必须是该对话的成员之一
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userIds: {
          has: currentUser.id,
        },
      },
      include: {
        // 同时加载对话中的所有消息
        messages: {
          include: {
            // 每条消息都包含已读用户列表 (seen) 和发送者信息 (sender)
            seen: true,
            sender: true,
          },
          orderBy: {
            createdAt: "desc", // 按创建时间降序排序
          },
        },
      },
    });

    // 4. 如果对话不存在或用户不属于该对话，返回 404
    if (!conversation) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1];

    // 5. 筛选出当前用户未读的消息
    const unseenMessages = conversation.messages.filter(
      (message) =>
        // 条件1: 当前用户不在消息的 'seen' 列表中
        !message.seen.some((user) => user.id === currentUser.id) &&
        // 条件2: 消息不是由当前用户自己发送的 (自己发的消息默认就是已读)
        message.sender.id !== currentUser.id
    );

    // 6. 如果没有未读消息，直接返回一个空数组，不做任何数据库操作
    if (unseenMessages.length === 0) {
      return NextResponse.json([]);
    }

    // 7. 如果有未读消息，更新这些消息
    const updatedMessages = await Promise.all(
      unseenMessages.map((message) =>
        // 遍历所有未读消息，并更新它们
        prisma.message.update({
          where: {
            id: message.id,
          },
          // 将当前用户连接 (connect) 到消息的 'seen' 关系中
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

    await pusherServer.trigger(currentUser.email, "conversation:update", {
      id: conversationId,
      messages: [updatedMessages],
    });

    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
      return NextResponse.json(conversation.messages);
    }

    await pusherServer.trigger(
      conversationId,
      "message:update",
      updatedMessages
    );

    // 8. 返回所有被更新的消息
    return NextResponse.json(updatedMessages);
  } catch (error: any) {
    console.log(error, "CONVERSATION_SEEN_ERROR");
    // 如果过程中出现任何错误，返回 500 服务器内部错误
    return new NextResponse("Internal Error", { status: 500 });
  }
}
