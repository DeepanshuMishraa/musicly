import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest){

    try{
        const {streamID} = await req.json();

        const stream = await prisma.stream.findMany({
            where:{
                id:streamID
            }
        })

        if(!stream){
            return NextResponse.json({
                message:"Stream does not exist"
            },{status:400})
        }

      const upvote = await prisma.stream.update({
            where:{
                id:streamID
            },
            data:{
                upvotes:{increment:1},
            },
        })

        return NextResponse.json({
            message:"Upvoted the song",
            upvotes:upvote.upvotes
    })


    }catch(e){
        return NextResponse.json({
            message:"Failed to upvote "
        },{status:401})
    }
}
