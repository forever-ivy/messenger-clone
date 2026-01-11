"use client";

import type { User } from "@prisma/client";
import Image from "next/image";

interface GroupAvatarProps {
  users: User[];
}

const positions = ["top-0 left-0", "bottom-0 right-0", "bottom-0 left-0"];

const GroupAvatar: React.FC<GroupAvatarProps> = ({ users }) => {
  const displayUsers = users.slice(0, 3);

  return (
    <div className="relative h-11 w-11">
      {displayUsers.map((user, index) => (
        <div
          key={user.id}
          className={`absolute h-7 w-7 rounded-full border-2 border-white bg-white ${positions[index]}`}
        >
          <div className="relative h-full w-full overflow-hidden rounded-full">
            <Image
              fill
              sizes="28px"
              alt="User avatar"
              src={user.image || "/images/placeholder.png"}
              className="object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupAvatar;
