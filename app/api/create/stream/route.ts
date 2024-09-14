import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
// @ts-ignore
import youtubesearchapi from "youtube-search-api";

const StreamSchema = z.object({
  spaceId: z.string(),
  url: z.string(),
});

const YT_REGEX =
  /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

const SPOTIFY_REGEX =
  /(https?:\/\/open.spotify.com\/(track|album|playlist)\/([a-zA-Z0-9]+))(?:\?.*)?/;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = StreamSchema.parse(await req.json());
    const isyt = data.url.match(YT_REGEX);
    const isSpotify = data.url.match(SPOTIFY_REGEX);

    if (!isyt && !isSpotify) {
      return NextResponse.json(
        { message: "Invalid YouTube or Spotify URL" },
        { status: 400 }
      );
    }

    // Extract ID from YouTube or Spotify URL
    let extractedId;
    let title;
    let thumbnail;

    if (isyt) {
      extractedId = isyt[1]; // Extracted YouTube video ID
      const videoDetails = await youtubesearchapi.GetVideoDetails(extractedId);
      title = videoDetails.title;
      thumbnail = videoDetails.thumbnail.thumbnails[0].url;
    } else if (isSpotify) {
      extractedId = isSpotify[3]; // Extracted Spotify track/album/playlist ID
      // Placeholder: Set title and thumbnail (you can use Spotify API to get real data)
      title = `Spotify ${isSpotify[2]} - ${extractedId}`;
      thumbnail = `https://i.scdn.co/image/${extractedId}`; // Spotify image URLs may vary, handle accordingly
    }

    // Check if stream already exists in the queue
    const existingStream = await prisma.stream.findFirst({
      where: {
        extractedurl: extractedId,
        spaceId: data.spaceId,
      },
    });

    if (existingStream) {
      return NextResponse.json(
        {
          message: "Already in the queue or playing",
        },
        { status: 400 }
      );
    }

    // Store the stream
    const stream = await prisma.stream.create({
      data: {
        spaceId: data.spaceId,
        url: data.url,
        extractedurl: extractedId ?? "",
        title: title,
        thumbnail: thumbnail,
      },
    });

    return NextResponse.json(
      { message: "Stream created", stream },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Failed to create stream" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const spaceId = searchParams.get("spaceId");

    if (!spaceId) {
      return NextResponse.json(
        { message: "Space ID is required" },
        { status: 400 }
      );
    }

    const streams = await prisma.stream.findMany({
      where: { spaceId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ streams }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Failed to fetch streams" },
      { status: 500 }
    );
  }
}
