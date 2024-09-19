import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod";
//@ts-ignore
import youtubesearchapi from "youtube-search-api";
// Optionally: You can use Sentry for error tracking
// import * as Sentry from "@sentry/nextjs";

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
      return NextResponse.json(
        { message: "Unauthorized: Missing email in session" },
        { status: 401 }
      );
    }

    // Parse the request body and validate using Zod schema
    const data = StreamSchema.parse(await req.json());
    const isyt = data.url.match(YT_REGEX);
    const isSpotify = data.url.match(SPOTIFY_REGEX);

    if (!isyt && !isSpotify) {
      return NextResponse.json(
        { message: "Invalid YouTube or Spotify URL format", url: data.url },
        { status: 400 }
      );
    }

    // Extract ID from YouTube or Spotify URL
    let extractedId;
    let title;
    let thumbnail;

    if (isyt) {
      try {
        extractedId = isyt[1]; // Extracted YouTube video ID
        const videoDetails = await youtubesearchapi.GetVideoDetails(
          extractedId
        );
        title = videoDetails.title;
        thumbnail = videoDetails.thumbnail?.thumbnails[0]?.url;
      } catch (err: any) {
        console.error(
          `Failed to fetch YouTube video details: ${err.message}`,
          err.stack
        );
        return NextResponse.json(
          {
            message: "Failed to fetch YouTube video details",
            error: err.message,
          },
          { status: 500 }
        );
      }
    } else if (isSpotify) {
      extractedId = isSpotify[3]; // Extracted Spotify track/album/playlist ID
      title = `Spotify ${isSpotify[2]} - ${extractedId}`;
      thumbnail = `https://i.scdn.co/image/${extractedId}`;
    }

    try {
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
            message: "Stream already in the queue or currently playing",
            streamId: existingStream.id,
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
        { message: "Stream created successfully", stream },
        { status: 200 }
      );
    } catch (dbError: any) {
      console.error(
        `Failed to store stream in database: ${dbError.message}`,
        dbError.stack
      );
      return NextResponse.json(
        {
          message: "Database error: Failed to store stream",
          error: dbError.message,
        },
        { status: 500 }
      );
    }
  } catch (e: any) {
    console.error(`Unhandled error in POST stream: ${e.message}`, e.stack);
    // Optionally capture the error with Sentry
    // Sentry.captureException(e);
    return NextResponse.json(
      { message: "Failed to create stream", error: e.message },
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
        { message: "Missing required query parameter: spaceId" },
        { status: 400 }
      );
    }

    try {
      const streams = await prisma.stream.findMany({
        where: { spaceId },
        orderBy: { createdAt: "asc" },
      });

      return NextResponse.json({ streams }, { status: 200 });
    } catch (dbError: any) {
      console.error(
        `Database error: Failed to fetch streams for spaceId ${spaceId}: ${dbError.message}`,
        dbError.stack
      );
      return NextResponse.json(
        {
          message: "Failed to fetch streams from database",
          error: dbError.message,
        },
        { status: 500 }
      );
    }
  } catch (e: any) {
    console.error(`Unhandled error in GET streams: ${e.message}`, e.stack);
    // Optionally capture the error with Sentry
    // Sentry.captureException(e);
    return NextResponse.json(
      { message: "Failed to fetch streams", error: e.message },
      { status: 500 }
    );
  }
}
