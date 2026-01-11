"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { HiXMark } from "react-icons/hi2";
import { createPortal } from "react-dom";
import Input from "@/components/inputs/Input";
import Button from "@/components/Button";
import Avatar from "@/components/Avatar";

interface GroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
}

const GroupChatModal: React.FC<GroupChatModalProps> = ({
  isOpen,
  onClose,
  users,
}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const previousOverflow = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
    },
  });

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

  const toggleUser = useCallback((id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((userId) => userId !== id)
        : [...current, id]
    );
  }, []);

  const selectedLabel = useMemo(() => {
    if (selectedIds.length === 0) {
      return "Select at least 2 members.";
    }

    return `${selectedIds.length} member${selectedIds.length === 1 ? "" : "s"} selected`;
  }, [selectedIds.length]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setFormError("");

    if (!data.name?.trim()) {
      setFormError("Group name is required.");
      return;
    }

    if (selectedIds.length < 2) {
      setFormError("Please select at least 2 members.");
      return;
    }

    try {
      const response = await axios.post("/api/conversations", {
        name: data.name,
        isGroup: true,
        members: selectedIds.map((id) => ({ value: id })),
      });

      reset();
      setSelectedIds([]);
      onClose();
      router.refresh();

      if (response.data?.id) {
        router.push(`/conversations/${response.data.id}`);
      }
    } catch (error) {
      console.error("创建小组失败", error);
      setFormError("Failed to create group. Please try again.");
    }
  };

  if (!isOpen) {
    return null;
  }

  const modal = (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        role="button"
        aria-label="Close group modal"
      />
      <div className="absolute left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create a group
            </h2>
            <p className="text-sm text-gray-500">
              Give your group a name and invite members.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600"
            aria-label="Close group modal"
          >
            <HiXMark size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <Input
            label="Group name"
            id="name"
            required
            register={register}
            errors={errors}
            disabled={isSubmitting}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Members</p>
              <span className="text-xs text-gray-500">{selectedLabel}</span>
            </div>
            <div className="max-h-56 overflow-y-auto rounded-md border border-gray-200">
              {users.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">
                  No users available.
                </div>
              ) : (
                users.map((user) => {
                  const checked = selectedIds.includes(user.id);

                  return (
                    <label
                      key={user.id}
                      className="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar user={user} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || user.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleUser(user.id)}
                        className="h-4 w-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                      />
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {formError && (
            <p className="text-sm text-rose-500">{formError}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              secondary
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(modal, document.body);
};

export default GroupChatModal;
