"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { ImageKitProvider, Video as ImageKitVideo } from "@imagekit/next";
import config from "@/lib/config";

interface BookVideoProps {
  videoUrl: string;
  coverUrl?: string;
}

const BookVideo = ({ videoUrl, coverUrl }: BookVideoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!videoUrl) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-dark-300 text-light-100">
        No video trailer available for this book.
      </div>
    );
  }

  const isImageKitPath = (url?: string) =>
    url ? url.startsWith("/") && !url.startsWith("/sample-video") : false;

  const fullVideoSrc = isImageKitPath(videoUrl)
    ? `${config.env.imagekit.urlEndpoint}${videoUrl}`
    : videoUrl;

  const posterSrc = coverUrl
    ? coverUrl.startsWith("http")
      ? coverUrl
      : `${config.env.imagekit.urlEndpoint}${coverUrl}`
    : undefined;

  const handlePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error("Error playing video:", err);
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-dark-300 shadow-2xl aspect-video max-h-[380px] group">
      <video
        ref={videoRef}
        src={fullVideoSrc}
        controls={isPlaying}
        poster={posterSrc}
        className="h-full w-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {!isPlaying && (
        <div
          onClick={handlePlay}
          className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/40 backdrop-blur-[1px] transition-all hover:bg-black/30"
        >
          {posterSrc && (
            <img
              src={posterSrc}
              alt="Video thumbnail"
              className="absolute inset-0 -z-10 h-full w-full object-cover"
            />
          )}
          <div className="flex size-16 items-center justify-center rounded-full bg-white/20 p-2 backdrop-blur-md transition-transform group-hover:scale-110 shadow-lg border border-white/30">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary text-dark-100 shadow-inner">
              <Play className="size-6 fill-dark-100 translate-x-0.5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookVideo;
