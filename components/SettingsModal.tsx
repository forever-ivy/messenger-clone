"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@prisma/client";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import SettingsForm from "@/app/settings/components/SettingsForm";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [mounted, setMounted] = useState(false);
  const previousOverflow = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow.current ?? "";
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const modal = (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        role="button"
        aria-label="Close settings"
      />
      <div className="absolute left-1/2 top-1/2 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-500">
              Update your profile name and avatar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600"
            aria-label="Close settings"
          >
            <HiXMark size={20} />
          </button>
        </div>
        <div className="px-6 py-6">
          <SettingsForm currentUser={currentUser} onSuccess={onClose} />
        </div>
      </div>
    </div>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(modal, document.body);
};

export default SettingsModal;
