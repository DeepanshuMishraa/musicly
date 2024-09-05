import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod";

const SpaceSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(3),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized", status: 401 });
    }

    const data = SpaceSchema.parse(await req.json());

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found", status: 404 });
    }

    const space = await prisma.space.create({
      data: {
        name: data.name,
        description: data.description,
        author: session.user.name || "Anonymous",
        authorId: user.id,
      },
    });

    return NextResponse.json({ message: "Space created", status: 200, space });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      message: "Failed to create space",
      status: 500,
    });
  }
}

export async function GET() {
  try {
    const spaces = await prisma.space.findMany({
        include: { user: true},
    });
    return NextResponse.json({ spaces, status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      message: "Failed to fetch spaces",
      status: 500,
    });
  }
}
