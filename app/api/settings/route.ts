import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { name, image } = body;

    if (!currentUser?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data: { name?: string; image?: string } = {};

    if (typeof name === "string" && name.trim()) {
      data.name = name.trim();
    }

    if (typeof image === "string" && image.trim()) {
      data.image = image.trim();
    }

    if (!data.name && !data.image) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
