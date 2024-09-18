"use client";
import React from "react";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { VideoDialog } from "./video-dailog";
import SparklesText from "./magicui/sparkles-text";
import { Feature } from "./bento";
export function Hero() {
  return (
    <>
      <div className="h-[40rem] space-y-2 rounded-md bg-neutral-900 flex flex-col items-center justify-center relative w-full">
        <h2 className="relative flex-col md:flex-row z-10 text-3xl md:text-6xl md:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-white to-white flex items-center gap-2 md:gap-8">
          <span>
            Stream together
            <br /> across borders, in seconds.
          </span>
        </h2>
        <div className="flex flex-col items-center gap-y-8">
          <p className="text-gray-400 text-lg ">
            With our seamless music streaming platform create spaces
            <br /> add songs, and listen together with people worldwide easily.
          </p>

          <Link className="z-10" href="/dashboard">
            <Button className="p-4">
              Stream Now <ArrowRightIcon className="ml-2 hover:animate-ping" />
            </Button>
          </Link>
        </div>
        <ShootingStars />
        <StarsBackground />
      </div>
      <div className="relative h-[500px] border-b border-blue-500 rounded-lg w-full bg-background overflow-hidden border">
        <div className="p-8 space-y-4">
          <h1 className="z-40 text-3xl md:text-5xl md:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium bg-clip-text text-transparent  bg-gradient-to-b from-neutral-800 via-white to-white">
            Chilling & Streaming made easier
          </h1>
          <VideoDialog />
        </div>
      </div>
      <Feature/>

    </>
  );
}
