import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  try {
    // First, fetch the stream to get its spaceId
    const stream = await prisma.stream.findUnique({
      where: { id },
      include: { space: true },
    });

    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    // Check if the current user is the owner of the space
    if (stream.space.author !== session?.user?.name) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If the user is the owner, proceed with deletion
    const deletedStream = await prisma.stream.delete({
      where: { id },
    });

    return NextResponse.json({
      status: 200,
      message: `Deleted the stream with id ${id}`,
    });
  } catch (error) {
    console.error("Error deleting stream:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
