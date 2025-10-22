"use client";

import useRoutes from "@/app/hooks/useRoutes";
import DesktopItem from "./DesktopItem";
import { User } from "@/app/generated/prisma";
import Avatar from "@/components/Avatar";
import { useState } from "react";
import SettingModal from "./SettingModal";

interface DesktopSidebarProps {
  currentUser?: User | null;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentUser }) => {
  const routes = useRoutes();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <SettingModal
        currentUser={currentUser}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      ></SettingModal>
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
          <div
            onClick={() => setIsOpen(true)}
            className="
                cursor-pointer
                hover:opacity-75
                transition 
            "
          >
            <Avatar user={currentUser ?? undefined} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DesktopSidebar;
