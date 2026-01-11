"use client";

import { User } from "@prisma/client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

interface AvatarProps {
  user?: User;
}

const Avatar = ({ user }: AvatarProps) => {
  const session = useSession();
  const isOnline = useMemo(() => {
    if (!user?.updatedAt) {
      return false;
    }

    const lastActive = new Date(user.updatedAt as unknown as string).getTime();
    if (Number.isNaN(lastActive)) {
      return false;
    }

    return Date.now() - lastActive <= 2 * 60 * 1000;
  }, [user?.updatedAt]);

  const isOtherUser = useMemo(() => {
    const currentEmail = session?.data?.user?.email;
    if (!currentEmail || !user?.email) {
      return true;
    }

    return user.email !== currentEmail;
  }, [session?.data?.user?.email, user?.email]);

  return (
    <div className="relative">
      <div
        className="
        relative
        inline-block
        rounded-full
        overflow-hidden
        h-9
        w-9
        md:h-11
        md:w-11
        "
      >
        <Image
          fill
          sizes="(min-width: 768px) 44px, 36px"
          alt="User avatar"
          src={user?.image || "/images/placeholder.png"}
          className="object-cover"
        />
      </div>
      {isOtherUser && isOnline && (
        <span className=" absolute block rounded-full bg-green-500 ring-2 ring-white top-0 right-0 h-2 w-2 md:h-3 md:w-3" />
      )}
    </div>
  );
};
export default Avatar;
