import { useSession } from "next-auth/react";
import { useMemo } from "react";
import type { User } from "@/app/generated/prisma";
import { FullConversationType } from "../types";

type HasUsers = { users: User[] };

const useOtherUser = (conversation: FullConversationType | HasUsers) => {
  const session = useSession();

  const otherUser = useMemo(() => {
    if (!conversation?.users) {
      return undefined;
    }

    const currentUserEmail = session?.data?.user?.email;

    if (!currentUserEmail) {
      return conversation.users.find((user) => user.email) ?? conversation.users[0];
    }

    const filtered = conversation.users.filter(
      (user) => user.email !== currentUserEmail
    );

    if (filtered.length === 0) {
      return undefined;
    }

    return filtered[0];
  }, [session?.data?.user?.email, conversation.users]);

  return otherUser;
};

export default useOtherUser;
