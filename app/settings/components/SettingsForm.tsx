"use client";

import { useState, type ChangeEvent } from "react";
import type { User } from "@prisma/client";
import Image from "next/image";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import Input from "@/components/inputs/Input";
import Button from "@/components/Button";

interface SettingsFormProps {
  currentUser: User;
  onSuccess?: () => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({
  currentUser,
  onSuccess,
}) => {
  const router = useRouter();
  const [image, setImage] = useState(currentUser.image || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: currentUser.name || "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsSaving(true);

    try {
      await axios.patch("/api/settings", {
        name: data.name,
        image,
      });
      toast.success("Settings updated.");
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error("更新设置失败", error);
      toast.error("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const payload = await response.json();
      if (payload?.url) {
        setImage(payload.url);
      }
    } catch (error) {
      console.error("上传头像失败", error);
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="flex justify-center">
        <label
          htmlFor="avatar-upload"
          className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-full border border-gray-200 bg-gray-100 shadow-sm"
        >
          <Image
            fill
            sizes="80px"
            src={image || "/images/placeholder.png"}
            alt="Profile avatar"
            className="object-cover"
          />
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="name"
          label="Display name"
          register={register}
          errors={errors}
          required
          disabled={isSaving}
        />
        <div className="flex justify-center">
          <Button type="submit" disabled={isSaving}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsForm;
