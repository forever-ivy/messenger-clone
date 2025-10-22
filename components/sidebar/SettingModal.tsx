"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { User } from "@/app/generated/prisma";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "@/app/components/modal";
import Input from "@/components/inputs/Input";
import Image from "next/image";
import { CldUploadButton } from "next-cloudinary";
import Button from "@/components/Button";

interface SettingModalProps {
  currentUser?: User | null;
  isOpen?: boolean;
  onClose: () => void;
}

const SettingModal: React.FC<SettingModalProps> = ({
  currentUser,
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      name: currentUser?.name ?? "",
      image: currentUser?.image ?? "",
    },
  });

  const image = watch("image");

  const handleUpload = (result: any) => {
    setValue("image", result?.info?.secure_url, {
      shouldValidate: true,
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (!currentUser?.id) {
      toast.error("User not found");
      return;
    }

    setIsLoading(true);

    axios
      .post("/api/settings", data)
      .then(() => {
        reset({
          name: data.name ?? "",
          image: data.image ?? "",
        });
        router.refresh();
        onClose();
      })
      .catch(() => toast.error("Something went wrong"))
      .finally(() => setIsLoading(false));
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-medium leading-7 text-gray-900 ">
            Profile
          </h2>
          <div className="mt-10 flex flex-col gap-y-8">
            <Input
              disabled={isLoading}
              label="Name"
              id="name"
              errors={errors}
              required
              register={register}
            />
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Photo
              </label>
              <div className="mt-2 flex items-center gap-x-3">
                <Image
                  width="48"
                  height="48"
                  className="rounded-full"
                  src={image || currentUser?.image || "/images/placeholder.jpg"}
                  alt="Avatar"
                />
                <CldUploadButton
                  options={{ maxFiles: 1 }}
                  onSuccess={handleUpload}
                  uploadPreset="kbdp9mhb"
                >
                  <Button disabled={isLoading} secondary type="button">
                    Change
                  </Button>
                </CldUploadButton>
              </div>
            </div>
          </div>

          <div
            className="
          mt-6
          flex
          items-center
          justify-end
          gap-x-6
          "
          >
            <Button
              disabled={isLoading}
              onClick={() => {
                reset({
                  name: currentUser?.name ?? "",
                  image: currentUser?.image ?? "",
                });
                onClose();
              }}
              secondary
              type="button"
            >
              Cancel
            </Button>
            <Button disabled={isLoading} type="submit">
              Save
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default SettingModal;
