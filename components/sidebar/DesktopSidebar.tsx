"use client";

import useRoutes from "@/app/hooks/useRoutes";
import DesktopItem from "./DesktopItem";
import type { User } from "@prisma/client";
import Avatar from "@/components/Avatar";
import { useState } from "react";
import SettingsModal from "@/components/SettingsModal";

interface DesktopSidebarProps {
  currentUser?: User | null;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentUser }) => {
  const routes = useRoutes();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div
      className="
    hidden
    lg:fixed
    lg:inset-y-0
    lg:left-0
    lg:z-40
    lg:w-20
    xl:px-6
    lg:overflow-y-auto
    lg:bg-white
    lg:border-r-[1px]
    lg:pb-4
    lg:flex
    lg:flex-col
    justify-between
    "
    >
      {currentUser && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentUser={currentUser}
        />
      )}
      <nav className="mt-4 flex flex-col flex-1">
        <ul
          role="list"
          className="
        flex
        flex-col
        items-center
        space-y-1
        "
        >
          {routes.map((item) => (
            <DesktopItem
              key={item.label}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={item.active}
              onClick={item.onClick}
            />
          ))}
        </ul>
      </nav>

      <div className="mt-auto flex items-center justify-center pt-4">
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="
                cursor-pointer
                hover:opacity-75
                transition 
            "
          aria-label="Open settings"
          disabled={!currentUser}
        >
          <Avatar user={currentUser ?? undefined} />
        </button>
      </div>
    </div>
  );
};

export default DesktopSidebar;
