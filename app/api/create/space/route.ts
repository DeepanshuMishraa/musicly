import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import {z} from "zod";


const SpaceSchema = z.object({
    name:z.string().min(3),
    description:z.string().min(3),
    userId:z.string()
})


export async function POST(req:NextRequest){
    try{
        const data = SpaceSchema.parse(await req.json());
        const session = await getServerSession();

        const user = await prisma.user.findUnique({
            where:{
                email:session?.user?.email ?? "Anonymous"
            }
        })

        if(!user){
            return NextResponse.json({
                message:"User not found",
                status:404
            })
        }

        await prisma.space.create({
            data:{
                name:data.name,
                description:data.description,
                author:session?.user?.name ?? "Anonymous",
                authorId:data.userId
            }
        })

        return NextResponse.json({
            message:"Space created",
            status:200
        })

    }catch(e){
        console.log(e);
        return NextResponse.json({
            message:"Failed to create space",
            status:501
        });
    }
}
