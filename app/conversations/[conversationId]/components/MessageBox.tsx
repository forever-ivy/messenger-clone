"use client";

import type { FullMessageType } from "@/app/types";
import Avatar from "@/components/Avatar";
import clsx from "clsx";
import { format } from "date-fns";
import Image from "next/image";
import ImageModal from "./ImageModal";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface MessageBoxProps {
  data: FullMessageType;
  isLast?: boolean;
}

const MessageBox: React.FC<MessageBoxProps> = ({ data, isLast }) => {
  const session = useSession();
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const isOwn = session?.data?.user?.email === data?.sender?.email;
  const seenList = (data?.seen || [])
    .filter((user) => user.email !== data?.sender?.email)
    .map((user) => user.name)
    .join(", ");

  return (
    <div className={clsx("flex gap-3 p-4", isOwn ? "justify-end" : "")}>
      <div className={clsx("flex gap-3", isOwn ? "flex-row-reverse" : "")}>
        <Avatar user={data.sender} />
        <div className={clsx("flex flex-col gap-2", isOwn ? "items-end" : "")}>
          <div className="flex items-center gap-2">
            <div
              className={clsx(
                "text-sm text-gray-500",
                isOwn ? "text-right" : "text-left"
              )}
            >
              {data.sender.name}
            </div>
            <div className="text-xs text-gray-400">
              {format(new Date(data.createdAt), "p")}
            </div>
          </div>
          <div
            className={clsx(
              "text-sm w-fit overflow-hidden",
              isOwn ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-900",
              data.image ? "rounded-md p-0" : "py-2 px-3 rounded-lg"
            )}
          >
            <ImageModal
              src={data.image}
              isOpen={imageModalOpen}
              onClose={() => {
                setImageModalOpen(false);
              }}
            />
            {data.image ? (
              <div className="relative h-64 w-64">
                <Image
                  fill
                  src={data.image}
                  alt="Image"
                  sizes="256px"
                  className="object-cover rounded-md"
                  onClick={() => {
                    setImageModalOpen(true);
                  }}
                />
              </div>
            ) : (
              <p>{data.body}</p>
            )}
          </div>
          {isLast && isOwn && seenList && (
            <div className="text-xs font-light text-gray-500">
              Seen by {seenList}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
