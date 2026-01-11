"use client";

import type { Conversation, User } from "@prisma/client";
import { HiXMark } from "react-icons/hi2";
import useOtherUser from "@/app/hooks/useOtherUser";
import Avatar from "@/components/Avatar";

interface DetailsDrawerProps {
  conversation: Conversation & {
    users: User[];
  };
  isOpen: boolean;
  onClose: () => void;
}

const DetailsDrawer: React.FC<DetailsDrawerProps> = ({
  conversation,
  isOpen,
  onClose,
}) => {
  const otherUser = useOtherUser(conversation);

  if (!isOpen) {
    return null;
  }

  const isGroup = !!conversation.isGroup;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        role="button"
        aria-label="Close conversation details"
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Details</p>
            <h2 className="text-lg font-semibold text-gray-900">
              {conversation.name ||
                (isGroup ? "Group chat" : otherUser?.name || "Conversation")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600"
            aria-label="Close conversation details"
          >
            <HiXMark size={20} />
          </button>
        </div>

        <div className="px-6 py-4">
          {isGroup ? (
            <div>
              <p className="text-sm font-medium text-gray-900">
                Members ({conversation.users.length})
              </p>
              <div className="mt-4 space-y-3">
                {conversation.users.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar user={user} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || user.email}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Avatar user={otherUser} />
              <div>
                <div className="text-base font-semibold text-gray-900">
                  {otherUser?.name || otherUser?.email}
                </div>
                <div className="text-sm text-gray-500">{otherUser?.email}</div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default DetailsDrawer;
