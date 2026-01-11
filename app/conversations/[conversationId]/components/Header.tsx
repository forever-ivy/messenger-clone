"use client";

import type { Conversation, User } from "@prisma/client";
import useOtherUser from "@/app/hooks/useOtherUser";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import { useMemo, useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import DetailsDrawer from "./DetailsDrawer";
import GroupAvatar from "@/components/GroupAvatar";

interface HeaderProps {
  conversation: Conversation & {
    users: User[];
  };
}

const Header: React.FC<HeaderProps> = ({ conversation }) => {
  const otherUser = useOtherUser(conversation);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const statusText = useMemo(() => {
    if (conversation.isGroup) {
      return `${conversation.users.length} members`;
    }

    if (!otherUser?.updatedAt) {
      return "Offline";
    }

    const lastActive = new Date(
      otherUser.updatedAt as unknown as string
    ).getTime();

    if (Number.isNaN(lastActive)) {
      return "Offline";
    }

    return Date.now() - lastActive <= 2 * 60 * 1000 ? "Online" : "Offline";
  }, [conversation.isGroup, conversation.users.length, otherUser?.updatedAt]);

  if (!conversation.isGroup && !otherUser) {
    return null;
  }

  return (
    <>
      <DetailsDrawer
        conversation={conversation}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
      <div
        className="
  bg-white
  w-full
  flex
  border-b-[1px]
  sm:px-4
  py-3
  px-4
  lg:px-6
  justify-between
  items-center
  shadow-sm
  "
      >
        <div className="flex gap-3 items-center ">
          <Link
            className="
        lg:hidden
        block
        text-sky-500
        hover:text-sky-600
        transition
        cursor-pointer
        "
            href="/conversations"
          >
            <HiChevronLeft size={32} />
          </Link>
          {conversation.isGroup ? (
            <GroupAvatar users={conversation.users.slice(0, 3)} />
          ) : (
            <Avatar user={otherUser} />
          )}
          <div className="flex flex-col">
            <div className="text-md font-medium text-gray-900">
              {conversation.isGroup
                ? conversation.name || "Group chat"
                : otherUser?.name || otherUser?.email || "Conversation"}
            </div>
            <div
              className="
          text-sm
          font-light 
          text-neutral-500
          
          "
            >
              {statusText}
            </div>
          </div>
        </div>
        <HiEllipsisHorizontal
          size={32}
          onClick={() => setIsDetailsOpen(true)}
          className="
      text-sky-500
      cursor-pointer
      hover
      "
        />
      </div>
    </>
  );
};

export default Header;
