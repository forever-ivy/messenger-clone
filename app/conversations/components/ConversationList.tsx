"use client";

import { FullConversationType } from "@/app/types";
import { useRouter } from "next/navigation";
import useConversation from "@/app/hooks/useConversation";
import { MdOutlineGroupAdd } from "react-icons/md";
import ConversationBox from "./ConversationBox";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { User } from "@/app/generated/prisma";
import GroupChatModal from "./GroupChatModal";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/app/libs/pusher";
import { find } from "lodash";

interface ConversationListProps {
  initialItems: FullConversationType[];
  users: User[];
}

const ConversationList: React.FC<ConversationListProps> = ({
  initialItems,
  users,
}) => {
  const session = useSession();
  const router = useRouter();
  const [isModalOpen, setisModalOpen] = useState(false);
  const [items, setItems] = useState(initialItems);
  const { conversationId, isOpen } = useConversation();
  const pusherkey = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]);
  useEffect(() => {
    if (!pusherkey) {
      return;
    }

    pusherClient.subscribe(pusherkey as string);

    const newHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        if (find(current, { id: conversation.id })) {
          return current;
        }
        return [conversation, ...current];
      });
    };
    const updateHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        return current.map((currentConversation) => {
          if (currentConversation.id === conversation.id) {
            return conversation;
          }
          return currentConversation;
        });
      });
    };

    const removeHandler = (conversationId: string) => {
      setItems((current) => {
        return [...current.filter((item) => item.id !== conversationId)];
      });
      if (conversationId === conversationId) {
        router.push("/conversations");
      }
    };
    pusherClient.bind("conversation:new", newHandler);
    pusherClient.bind("conversation:update", updateHandler);
    pusherClient.bind("conversation:remove", removeHandler);

    return () => {
      pusherClient.unsubscribe(pusherkey as string);
      pusherClient.unbind("conversation:new", newHandler);
      pusherClient.unbind("conversation:update", updateHandler);
      pusherClient.unbind("conversation:remove", removeHandler);
    };
  }, [pusherkey, conversationId, router]);

  return (
    <>
      <GroupChatModal
        isOpen={isModalOpen}
        onClose={() => setisModalOpen(false)}
        users={users}
      />
      <aside
        className={clsx(
          `fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r  border-gray-200`,
          isOpen ? "hidden" : "block w-full left-0"
        )}
      >
        <div className="px-5">
          <div className="flex justify-between mb-4 pt-4">
            <div
              className="text-2xl font-bold text-neutral-800"
              onClick={() => {
                setisModalOpen(true);
              }}
            >
              Messages
            </div>
            <div
              className="rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition"
              onClick={() => setisModalOpen(true)}
            >
              <MdOutlineGroupAdd size={20} />
            </div>
          </div>
          {initialItems.map((item) => (
            <ConversationBox
              key={item.id}
              data={item}
              selected={conversationId === item.id}
            />
          ))}
        </div>
      </aside>
    </>
  );
};

export default ConversationList;
