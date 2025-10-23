/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: 创建一个新的对话或群聊
 *     description: |
 *       此端点用于创建两种类型的对话：
 *       1. **一对一对话**: 如果提供 `userId`，系统将查找或创建一个仅包含当前用户和指定用户的对话。
 *       2. **群聊**: 如果 `isGroup` 为 `true`，则必须提供 `members` (一个包含用户ID的对象数组) 和群聊的 `name`。
 *     tags: [Conversations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用于一对一对话的对方用户ID。
 *               isGroup:
 *                 type: boolean
 *                 description: 设置为 `true` 以创建群聊。
 *               members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: string
 *                       description: 成员的用户ID。
 *                 description: 参与群聊的用户成员列表 (创建群聊时必需)。
 *               name:
 *                 type: string
 *                 description: 群聊的名称 (创建群聊时必需)。
 *             example:
 *               // 一对一对话
 *               { "userId": "some-user-id" }
 *               // 群聊
 *               { "isGroup": true, "name": "My Group", "members": [{ "value": "user1-id" }, { "value": "user2-id" }] }
 *     responses:
 *       '200':
 *         description: 成功创建或返回现有对话。
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       '400':
 *         description: 无效数据，例如创建群聊时缺少 `members` 或 `name`。
 *       '401':
 *         description: 未经授权，用户未登录。
 *       '500':
 *         description: 服务器内部错误。
 */
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { userId, isGroup, members, name } = body;

    if (!currentUser?.email || !currentUser.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (isGroup && (!members || members.length < 2 || !name)) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    if (isGroup) {
      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
              {
                id: currentUser.id,
              },
            ],
          },
        },
        include: {
          users: true,
        },
      });

      newConversation.users.forEach((user) => {
        if (user.email) {
          pusherServer.trigger(user.email, "conversation:new", newConversation);
        }
      });

      return NextResponse.json(newConversation);
    }

    const existingConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId],
            },
          },
          {
            userIds: {
              equals: [userId, currentUser.id],
            },
          },
        ],
      },
    });

    const singleConversation = existingConversations[0];

    if (singleConversation) {
      return NextResponse.json(singleConversation);
    }

    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [
            {
              id: currentUser.id,
            },
            {
              id: userId,
            },
          ],
        },
      },
      include: {
        users: true,
      },
    });

    newConversation.users.map((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, "conversation:new", newConversation);
      }
    });

    return NextResponse.json(newConversation);
  } catch (error: any) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
