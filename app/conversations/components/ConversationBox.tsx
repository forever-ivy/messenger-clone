"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
// import type { Conversation, Message, User } from "@prisma/client";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import { FullConversationType } from "@/app/types";
import useOtherUser from "@/app/hooks/useOtherUser";
import Avatar from "@/components/Avatar";
import AvatarGroup from "@/components/AvatarGroup";

interface ConversationBoxProps {
  data: FullConversationType;
  selected?: boolean;
}

const ConversationBox: React.FC<ConversationBoxProps> = ({
  data,
  selected,
}) => {
  const otherUser = useOtherUser(data);
  const session = useSession();
  const router = useRouter();

  const handleClick = useCallback(() => {
    router.push(`/conversations/${data.id}`);
  }, [data.id, router]);

  const lastMessage = useMemo(() => {
    const messages = data.messages || [];

    return messages[messages.length - 1];
  }, [data.messages]);

  const userEmail = useMemo(() => {
    return session?.data?.user?.email;
  }, [session?.data?.user?.email, data.users]);

  const hasSeen = useMemo(() => {
    if (!lastMessage) {
      return false;
    }

    const seenArray = lastMessage.seen || [];

    if (!userEmail) {
      return false;
    }

    return seenArray.filter((user) => user.email === userEmail).length !== 0;
  }, [userEmail, lastMessage]);

  const lastMessageText = useMemo(() => {
    if (lastMessage?.image) {
      return "Sent an image";
    }

    if (lastMessage?.body) {
      return lastMessage.body;
    }
    return "Started a conversation";
  }, [lastMessage]);

  return (
    <div
      onClick={handleClick}
      className={clsx(
        "group w-full relative flex items-center gap-3 rounded-2xl border p-4 transition-all duration-200 cursor-pointer",
        selected
          ? "bg-indigo-50 border-indigo-100 shadow-sm ring-1 ring-indigo-100/60"
          : "bg-white border-transparent hover:bg-neutral-50 hover:border-neutral-200 hover:shadow-sm"
      )}
    >
      <div className="flex items-center justify-center">
        {data.isGroup ? (
          <AvatarGroup users={data.users} />
        ) : (
          <Avatar user={otherUser} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <div className="flex items-start justify-between gap-2">
            <p className="text-base font-semibold text-gray-900 capitalize">
              {data.name || otherUser.name}
            </p>
            {lastMessage?.createdAt && (
              <p className="shrink-0 text-xs font-medium text-gray-400">
                {format(new Date(lastMessage.createdAt), "p")}
              </p>
            )}
          </div>
          <p
            className={clsx(
              "mt-1 truncate text-sm leading-6",
              hasSeen ? "text-gray-500" : "text-gray-800 font-medium"
            )}
          >
            {lastMessageText}
          </p>
        </div>
        {/* 未读标识 */}
      </div>
      {!hasSeen && !selected && (
        <span className="absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-emerald-500 transition-transform duration-200 group-hover:scale-125" />
      )}
    </div>
  );
};

export default ConversationBox;
