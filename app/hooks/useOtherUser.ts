import { useSession } from "next-auth/react";
import { useMemo } from "react";
import type { User } from "@/app/generated/prisma";
import { FullConversationType } from "../types";

type HasUsers = { users: User[] };

const useOtherUser = (conversation: FullConversationType | HasUsers) => {
  const session = useSession();

  const otherUser = useMemo(() => {
    const currentUserEmail = session?.data?.user?.email;

    const otherUser = conversation.users.filter(
      (user) => user.email !== currentUserEmail
    );

    return otherUser;
  }, [session?.data?.user?.email, conversation.users]);
  return otherUser[0];
};

export default useOtherUser;
