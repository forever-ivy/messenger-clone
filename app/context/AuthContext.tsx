"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

interface AuthContextProps {
  children: React.ReactNode;
}

const PresenceUpdater = () => {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let isActive = true;

    const ping = async () => {
      if (!isActive) {
        return;
      }

      try {
        await fetch("/api/presence", { method: "POST" });
      } catch (error) {
        console.error("更新在线状态失败", error);
      }
    };

    ping();
    const interval = setInterval(ping, 60_000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [status]);

  return null;
};

export default function AuthContext({ children }: AuthContextProps) {
  return (
    <SessionProvider>
      <PresenceUpdater />
      {children}
    </SessionProvider>
  );
}
