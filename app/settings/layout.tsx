import Sidebar from "@/components/sidebar/Sidebar";

export const dynamic = "force-dynamic";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Sidebar>{children}</Sidebar>;
}
