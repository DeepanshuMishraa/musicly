import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";

export async function POST(
  req: NextRequest,
  { params }: { params: { spaceId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized", status: 401 });
    }

    const spaceId = params.spaceId;

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

    if (space.authorId !== user.id) {
      return NextResponse.json({
        message: "Only the space creator can play next",
        status: 403,
      });
    }

    // Get the current song
    const currentSong = await prisma.stream.findFirst({
      where: { spaceId },
      orderBy: { createdAt: "asc" },
    });

    if (currentSong) {
      // Delete the current song
      await prisma.stream.delete({
        where: { id: currentSong.id },
      });
    }

    // Get the next song
    const nextSong = await prisma.stream.findFirst({
      where: { spaceId },
      orderBy: { createdAt: "asc" },
    });

    if (nextSong) {
      // Set startedAt to now
      await prisma.stream.update({
        where: { id: nextSong.id },
        data: { startedAt: new Date() },
      });
    }

    return NextResponse.json({ message: "Next song played", status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      message: "Failed to play next song",
      status: 500,
    });
  }
}
