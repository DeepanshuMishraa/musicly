"use client";
import React from "react";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";
export function Hero() {
  return (
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

        <Link className="z-10" href="/login">
          <Button className="p-4">Stream Now <ArrowRightIcon className="ml-2 hover:animate-ping"/></Button>
        </Link>
      </div>
      <ShootingStars />
      <StarsBackground />
    </div>
  );
}
