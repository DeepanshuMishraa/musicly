import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
//@ts-ignore
import youtubesearchapi from "youtube-search-api";
import prisma from "@/lib/db";


const StreamSchema = z.object({
    spaceId:z.string(),
    url:z.string(),
})

const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

export async function POST(req:NextRequest){
    try{
        const data = StreamSchema.parse(await req.json());
        const isyt = data.url.match(YT_REGEX)

        if(!isyt){
            return NextResponse.json({
                message:"wrong url format",
                status:401
            })
        }

        const extractedId = data.url.split("?v=")[1];
        const res = await youtubesearchapi.GetVideoDetails(extractedId);
        const thumbnail = res.thumbnail.thumbnails[0].url;

       await prisma.stream.create({
            data:{
                spaceId:data.spaceId,
                url:data.url,
                extractedurl:extractedId,
                title:res.title,
                thumbnail,
            }
        })

        return NextResponse.json({
            message:"Stream created",
            status:200
        })

    }catch(e){
        console.log(e);
        return NextResponse.json({
            message:"Failed to create stream",
            status:501
        });

    }
}
