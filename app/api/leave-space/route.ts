import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized", status: 401 });
    }

    // Since we're not tracking user-space relations, no action is needed

    return NextResponse.json({
      message: "Successfully left space",
      status: 200,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      message: "Failed to leave space",
      status: 500,
    });
  }
}
