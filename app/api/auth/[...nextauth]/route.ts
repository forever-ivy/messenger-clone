// ==================================================================
// 这个文件是你的“认证后端”，前端通过 next-auth/react 与之交互。
// ==================================================================
import bcrypt from "bcrypt";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/app/libs/prismadb";

export const authOptions: AuthOptions = {
  // [后端配置]
  // 作用：将认证信息（如用户、账户关联）自动存入数据库。
  // 前端须知：你不需要关心这个，它只是保证了用户数据的持久化。
  adapter: PrismaAdapter(prisma),

  // [前端核心]
  // 作用：定义所有可用的登录选项。
  // 前端须知：你想在登录页展示多少种登录方式，就在这里配置多少个。
  providers: [
    // --- GitHub 登录 ---
    // 前端调用: signIn('github')
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),

    // --- Google 登录 ---
    // 前端调用: signIn('google')
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),

    // --- 邮箱/密码登录 ---
    // 前端调用: signIn('credentials', { email: '...', password: '...' })
    CredentialsProvider({
      name: "credentials",
      // 'credentials' 是你在前端调用 signIn 时使用的标识符。
      credentials: {
        // 这部分主要是给后端看的，定义了需要接收哪些字段。
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      // [后端逻辑]
      // 作用：当你前端调用 signIn('credentials', ...) 时，这里的 authorize 函数会被执行。
      // 前端须知：这是验证邮箱密码是否正确的后端逻辑。如果验证失败（比如抛出 Error），
      // 你在前端调用 signIn 时得到的返回结果中就会包含错误信息 (result.error)。
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user?.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],

  // [调试模式]
  // 前端须知：开发时开启，可以在浏览器控制台看到 NextAuth 的详细日志，方便调试。
  debug: process.env.NODE_ENV === "development",

  // [会话管理策略]
  // 作用：定义如何管理用户的登录状态。'jwt' 表示使用 JSON Web Tokens。
  // 前端须知：因为这里配置了会话管理，所以你才可以在前端使用 useSession() 这个 Hook 来获取用户信息。
  session: {
    strategy: "jwt",
  },

  // [安全密钥]
  // 作用：用于加密 JWT 和其他敏感信息。
  // 前端须知：这是纯后端安全配置，你不需要知道它的值，也不需要用它。
  secret: process.env.NEXTAUTH_SECRET,
};

// ==================================================================
// == 导出处理器 ==
// 前端须知：这行代码创建了所有 /api/auth/* 的API端点（如/api/auth/signin, /api/auth/signout等）。
// 你在前端调用的 signIn() 和 signOut() 函数最终就是和这些端点通信。
// ==================================================================
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
