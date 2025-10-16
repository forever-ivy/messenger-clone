import type { Conversation, Message, User } from "@/app/generated/prisma";

export type FullMessageType = Message & {
  sender: User;
  conversation: Conversation;
};

export type FullConversationType = Conversation & {
  users: User[];
  messages: FullMessageType[];
};
