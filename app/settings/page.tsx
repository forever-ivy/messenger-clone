import { redirect } from "next/navigation";
import getCurrentUser from "@/app/actions/getCurrentUser";
import SettingsForm from "./components/SettingsForm";

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  return (
    <div className="lg:pl-20 h-full">
      <div className="h-full flex flex-col">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">
            Update your profile name and avatar.
          </p>
        </div>
        <div className="flex-1 px-6 py-6">
          <SettingsForm currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}
