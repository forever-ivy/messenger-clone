"use client";

import type { User } from "@prisma/client";

interface UserBoxProps {
  data: User;
}

const UserBox: React.FC<UserBoxProps> = ({ data }) => {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm transition hover:bg-gray-50">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{data.name}</span>
        {/* <span className="text-xs text-gray-500">{data.email}</span> */}
      </div>
    </div>
  );
};

export default UserBox;
