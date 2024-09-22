import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }
  try {
    const { id } = await req.json();

    //check if the space exists
    const space = await prisma.space.findUnique({
        where:{
            id:id
        }
    })

    if(!space){
        return NextResponse.json({
            error: "Space not found"
        }, {status: 404})

    }

    // check if the user is the owner of the space
    if(space?.author != session?.user?.name){
        return NextResponse.json({
            error: "Forbidden"
        }, {status: 403})
    }

    // if the user is the owner, proceed with deletion

    await prisma.space.delete({
        where:{
            id
        }
    });

    return NextResponse.json({
        error:`space with id: ${id} deleted succesfully`
    },{status:200})
    } catch (e) {
    return NextResponse.json(
      {
        error: `Error : ${e}`,
      },
      { status: 500 }
    );
  }
}
