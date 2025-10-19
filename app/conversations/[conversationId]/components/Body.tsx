"use client";

import { useEffect, useRef, useState } from "react";
import type { FullMessageType } from "@/app/types";
import MessageBox from "./MessageBox";
import useConversation from "@/app/hooks/useConversation";
import axios from "axios";
import { useRouter } from "next/navigation";

interface BodyProps {
  initialMessages: FullMessageType[];
}

const Body: React.FC<BodyProps> = ({ initialMessages }) => {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { conversationId } = useConversation();
  const router = useRouter();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    axios
      .post<FullMessageType[]>(`/api/conversations/${conversationId}/seen`)
      .then((response) => {
        const updatedMessages = response.data;

        if (updatedMessages.length > 0) {
          setMessages((current) => {
            const updatesById = new Map(
              updatedMessages.map((message) => [message.id, message])
            );

            return current.map((message) =>
              updatesById.has(message.id)
                ? updatesById.get(message.id)!
                : message
            );
          });
        }

        router.refresh();
      })
      .catch((error) => {
        console.error("更新已读状态失败", error);
      });
  }, [conversationId, router]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, index) => (
        <MessageBox
          key={message.id}
          data={message}
          isLast={index === messages.length - 1}
        />
      ))}
      <div ref={bottomRef} className="pt-24" />
    </div>
  );
};

export default Body;
