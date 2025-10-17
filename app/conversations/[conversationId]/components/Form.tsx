/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useConversation from "@/app/hooks/useConversation";
import axios from "axios";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import MessageInput from "./MessageInput";
import { HiPaperAirplane, HiPhoto } from "react-icons/hi2";
import { CldUploadButton } from "next-cloudinary";
import { useRouter } from "next/navigation";

const Form = () => {
  const { conversationId } = useConversation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FieldValues>({
    defaultValues: {
      message: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setValue("message", "", { shouldValidate: true });

    try {
      await axios.post(`/api/messages`, {
        ...data,
        conversationId,
      });
      router.refresh();
    } catch (error) {
      console.error("发送消息失败", error);
    }
  };

  const handleUpload = async (result: any) => {
    try {
      await axios.post(`/api/messages`, {
        image: result?.info?.secure_url,
        conversationId,
      });
      router.refresh();
    } catch (error) {
      console.error("图片上传消息失败", error);
    }
  };

  return (
    <div
      className="
  py-4
  px-4
  bg-white
  border-t
  flex
  items-center
  gap-2
  lg:gap-4
  w-full
  
  "
    >
      <CldUploadButton
        options={{ maxFiles: 1 }}
        onSuccess={handleUpload}
        uploadPreset="kbdp9mhb"
      >
        <HiPhoto size={30} className="text-sky-500" />
      </CldUploadButton>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="
        flex
        items-center
        gap-2
        lg:gap-4
        w-full
      "
      >
        <MessageInput
          id="message"
          register={register}
          errors={errors}
          required
          placeholder="Write a message"
        />
        <button
          type="submit"
          className="
        rounded-full
        p-2
        bg-sky-500
        cursor-pointer
        hover:bg-sky-600
        transition
        "
        >
          <HiPaperAirplane
            size={18}
            className="
          text-white
          "
          />
        </button>
      </form>
    </div>
  );
};

export default Form;
