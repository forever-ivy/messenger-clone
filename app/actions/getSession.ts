import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

import { authOptions } from "@/app/libs/authOptions";

export default async function getSession() {
  cookies();
  return await getServerSession(authOptions);
}
