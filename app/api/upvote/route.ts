import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { streamID } = body;

    if (!streamID) {
      return NextResponse.json({
        message: "Stream ID is required"
      }, { status: 400 });
    }

    const stream = await prisma.stream.findUnique({
      where: {
        id: streamID
      }
    });

    if (!stream) {
      return NextResponse.json({
        message: "Stream does not exist"
      }, { status: 404 });
    }

    const upvotedStream = await prisma.stream.update({
      where: {
        id: streamID
      },
      data: {
        upvotes: { increment: 1 },
      },
    });

    return NextResponse.json({
      message: "Upvoted the song",
      upvotes: upvotedStream.upvotes
    });
  } catch (e) {
    console.error("Error in upvote API:", e);
    return NextResponse.json({
      message: "Failed to upvote"
    }, { status: 500 });    
  }
}
