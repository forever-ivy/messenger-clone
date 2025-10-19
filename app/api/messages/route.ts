/* eslint-disable @typescript-eslint/no-explicit-any */
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: 发送一条新消息
 *     description: 在指定的对话中创建并发送一条新消息（文本或图片）。
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: 文本消息内容。
 *               image:
 *                 type: string
 *                 description: 图片消息的URL。
 *               conversationId:
 *                 type: string
 *                 description: 消息所属的对话ID。
 *             required:
 *               - conversationId
 *     responses:
 *       '200':
 *         description: 消息发送成功，返回新创建的消息对象。
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       '401':
 *         description: 未经授权，用户未登录。
 *       '403':
 *         description: 禁止访问，用户不属于该对话。
 *       '500':
 *         description: 服务器内部错误。
 */
export async function POST(request: Request) {
  try {
    // 1. 获取当前登录的用户信息
    const currentUser = await getCurrentUser();
    // 2. 解析请求体，获取消息内容、图片和对话ID
    const body = await request.json();
    const { message, image, conversationId } = body;

    // 3. 验证用户是否登录
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 4. 验证用户是否有权向此对话发送消息
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        // 确保当前用户是此对话的成员之一
        userIds: {
          has: currentUser.id,
        },
      },
    });

    // 如果对话不存在或用户不是成员，则返回403禁止访问
    if (!conversation) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 5. 在数据库中创建新消息
    const newMessage = await prisma.message.create({
      data: {
        body: message, // 消息正文
        image: image, // 图片URL
        // 关联到对应的对话
        conversation: {
          connect: { id: conversationId },
        },
        // 关联发送者为当前用户
        sender: {
          connect: { id: currentUser.id },
        },
        // 将当前用户（发送者）直接加入到已读列表
        seen: {
          connect: { id: currentUser.id },
        },
      },
      // 在返回结果中包含已读列表和发送者信息
      include: {
        seen: true,
        sender: true,
      },
    });

    // 6. 更新对话的最后消息时间戳和消息列表
    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        // 更新最后一条消息的时间，用于对话排序
        lastMessageAt: new Date(),
        // 将新创建的消息关联到对话的消息列表中
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
          },
        },
      },
    });

    // 7. 成功后，将新创建的消息作为JSON返回给前端
    return NextResponse.json(newMessage);
  } catch (error: any) {
    // 8. 如果发生任何错误，记录错误并返回500服务器错误
    console.log(error, "ERROR_MESSAGES");
    return new NextResponse("InternalError", { status: 500 });
  }
}
