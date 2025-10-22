"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { User } from "@prisma/client";

interface AvatarGroupProps {
  users?: User[];
}

const AvatarGroup = ({ users = [] }: AvatarGroupProps) => {
  const displayedUsers = useMemo(() => users.slice(0, 3), [users]);

  return (
    <div className="flex -space-x-4">
      {displayedUsers.map((user) => (
        <div
          key={user.id}
          className="relative inline-block h-11 w-11 overflow-hidden rounded-full border-2 border-white"
        >
          <Image
            fill
            sizes="44px"
            src={user.image || "/images/placeholder.png"}
            alt={`Avatar for ${user.name ?? "group member"}`}
            className="object-cover"
          />
        </div>
      ))}
      {users.length > displayedUsers.length && (
        <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-neutral-200 text-sm font-medium text-neutral-600">
          +{users.length - displayedUsers.length}
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;
