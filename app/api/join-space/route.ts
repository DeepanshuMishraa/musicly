import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized", status: 401 });
    }

    const { spaceId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found", status: 404 });
    }

    const space = await prisma.space.findUnique({
      where: { id: spaceId },
    });

    if (!space) {
      return NextResponse.json({ message: "Space not found", status: 404 });
    }

    const isCreator = space.authorId === user.id;

    return NextResponse.json({
      message: "Successfully joined space",
      status: 200,
      isCreator,
      userId: user.id,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      message: "Failed to join space",
      status: 500,
    });
  }
}
