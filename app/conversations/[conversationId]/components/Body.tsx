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
      .post<FullMessageType | null>(`/api/conversations/${conversationId}/seen`)
      .then((response) => {
        const updatedMessage = response.data;

        if (updatedMessage) {
          setMessages((current) =>
            current.map((message) =>
              message.id === updatedMessage.id ? updatedMessage : message
            )
          );
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
