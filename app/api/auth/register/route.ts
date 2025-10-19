// ==================================================================
// == 前端开发者需要了解的【用户注册 API】 ==
//
// 作用:
//   处理新用户的注册请求。
//
// 前端如何调用:
//   - URL: /api/auth/register
//   - 方法: POST
//   - 请求体 (Body): JSON 对象，必须包含 { name: "...", email: "...", password: "..." }
//
// 可能的响应:
//   - 200 OK: 注册成功。响应体是新创建的用户对象 (不含密码)。
//   - 400 Bad Request: 请求体缺少 name, email 或 password。响应体是文本 "Missing info"。
//   - 409 Conflict: 邮箱已被占用。响应体是文本 "Email already in use"。
//   - 500 Internal Server Error: 服务器内部发生未知错误。
// ==================================================================

import bcrypt from "bcrypt";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// 这个函数处理所有发送到 /api/auth/register 的 POST 请求
export async function POST(request: Request) {
  try {
    // 1. 解析前端发送过来的 JSON 请求体
    const body = await request.json();
    const { email, name, password } = body;

    // 2. 验证输入
    // 如果前端没有提供完整的 name, email, password，会进入这里
    if (!email || !name || !password) {
      // 返回 400 错误，前端应该提示用户“请填写所有字段”
      return new NextResponse("Missing info", { status: 400 });
    }

    // 3. 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // 如果邮箱已被注册，会进入这里
    if (existingUser) {
      // 返回 409 错误，前端应该提示用户“该邮箱已被使用”
      return new NextResponse("Email already in use", { status: 409 });
    }

    // 4. [后端操作] 对密码进行哈希加密，前端无需关心
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. 在数据库中创建新用户
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    // 6. 注册成功！
    // 返回 200 状态码和新创建的用户信息 (JSON格式)
    // 前端可以在 .then(response => response.json()) 中接收到这个 user 对象
    return NextResponse.json(user);

  } catch (error: any) {
    // 如果服务器发生任何其他错误，会进入这里
    console.log(error, "REGISTRATION_ERROR");
    // 返回 500 错误，前端应该显示一个通用的错误消息，如“服务开小差了，请稍后再试”
    return new NextResponse("Internal Error", { status: 500 });
  }
}
