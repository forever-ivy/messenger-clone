"use client";

import { useState } from "react";
import type { User } from "@prisma/client";
import Image from "next/image";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { CldUploadButton } from "next-cloudinary";
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

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
          <Image
            fill
            sizes="64px"
            src={image || "/images/placeholder.png"}
            alt="Profile avatar"
            className="object-cover"
          />
        </div>
        <CldUploadButton
          options={{ maxFiles: 1 }}
          uploadPreset="kbdp9mhb"
          onSuccess={(result: any) => {
            const secureUrl = result?.info?.secure_url as string | undefined;
            if (secureUrl) {
              setImage(secureUrl);
            }
          }}
        >
          <Button type="button" secondary>
            Upload new avatar
          </Button>
        </CldUploadButton>
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
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsForm;
