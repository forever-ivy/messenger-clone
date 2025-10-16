"use client";

import Avatar from "@/components/Avatar";
import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

interface UserBoxProps {
  data: User;
}

const UserBox: React.FC<UserBoxProps> = ({ data }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(() => {
    setIsLoading(true);

    axios
      .post("/api/conversations", {
        userId: data.id,
      })
      .then(() => {
        router.push(`/conversations/${data.data.id}`);
      })
      .finally(() => setIsLoading(false));
  }, [data, router]);

  return (
    <div
      onClick={handleClick}
      className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm transition hover:bg-gray-50"
    >
      <Avatar user={data} />
      <div className="min-w-0 flex-1 ">
        <div className="focus:outline-none">
          <div className="flex justify-between items-center mb-1 ml-6">
            <p className="text-base font-medium text-gray-900">{data.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBox;
