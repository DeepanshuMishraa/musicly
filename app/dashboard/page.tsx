"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import YouTube from "react-youtube";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Appbar } from "@/components/Appbar";
import SpotifyPlayer from "react-spotify-player";
import { useToast } from "@/hooks/use-toast";

interface Space {
  id: string;
  name: string;
  description: string;
  authorId: string;
  author: {
    name: string;
  };
}

interface Stream {
  id: string;
  title: string;
  extractedurl: string;
  url: string;
  startedAt?: string;
}

const DashboardPage: React.FC = () => {
  const { data: session } = useSession();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [newSongUrl, setNewSongUrl] = useState<string>("");
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<Stream | null>(null);
  const [queue, setQueue] = useState<Stream[]>([]);
  const playerRef = useRef<YouTube>(null);
  const [newSpaceName, setNewSpaceName] = useState<string>("");
  const [newSpaceDescription, setNewSpaceDescription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [userId, setUserId] = useState<string>("");

  const { toast } = useToast();

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const response = await axios.get<{ spaces: Space[] }>(
        "/api/create/space"
      );
      setSpaces(response.data.spaces || []);
    } catch (error) {
      console.error("Failed to fetch spaces:", error);
      setError("Failed to fetch spaces. Please try again later.");
    }
  };

  const joinSpace = async (space: Space) => {
    try {
      const response = await axios.post("/api/join-space", {
        spaceId: space.id,
      });
      setCurrentSpace(space);
      setIsCreator(response.data.isCreator);
      setUserId(response.data.userId);
      await fetchStreams(space.id);

      // Set up WebSocket connection
      const wsClient = new WebSocket(
        `ws://localhost:8080?spaceId=${space.id}&userId=${response.data.userId}`
      );

      wsClient.onopen = () => {
        console.log("WebSocket connection established");
      };

      wsClient.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsClient.onclose = () => {
        console.log("WebSocket connection closed");
      };

      setWs(wsClient);

      toast({
        title: "Space Joined",
        description: "You have successfully joined the space.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Failed to join space",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const leaveSpace = async () => {
    if (!currentSpace) return;

    try {
      await axios.post("/api/leave-space", { spaceId: currentSpace.id });
      setCurrentSpace(null);
      setQueue([]);
      setCurrentSong(null);

      // Close WebSocket connection
      if (ws) {
        ws.close();
        setWs(null);
      }

      toast({
        title: "Left Space",
        description: "You have left the space.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Failed to leave space",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const fetchStreams = async (spaceId: string) => {
    try {
      const response = await axios.get<{ streams: Stream[] }>(
        `/api/create/stream?spaceId=${spaceId}`
      );
      setQueue(response.data.streams || []);
      if (response.data.streams && response.data.streams.length > 0) {
        setCurrentSong(response.data.streams[0]);
      } else {
        setCurrentSong(null);
      }
    } catch (error) {
      console.error("Failed to fetch streams:", error);
      setError("Failed to fetch streams. Please try again later.");
    }
  };

  const createStream = async () => {
    if (!newSongUrl || !currentSpace) return;

    try {
      const response = await axios.post<{ stream: Stream }>(
        "/api/create/stream",
        {
          spaceId: currentSpace.id,
          url: newSongUrl,
        }
      );
      if (response.data.stream) {
        setQueue([...queue, response.data.stream]);
        setNewSongUrl("");
        if (!currentSong) {
          setCurrentSong(response.data.stream);
        }

        // Notify other users about the updated queue
        if (ws) {
          ws.send(
            JSON.stringify({
              type: "update-queue",
              payload: {},
            })
          );
        }
      }
      toast({
        title: "Song Added Successfully",
        description: "Song has been added to the queue.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Failed to add song",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const createSpace = async () => {
    try {
      const response = await axios.post<{ space: Space }>("/api/create/space", {
        name: newSpaceName,
        description: newSpaceDescription,
      });
      if (response.data.space) {
        setSpaces([...spaces, response.data.space]);
        setNewSpaceName("");
        setNewSpaceDescription("");
      }
      toast({
        title: "Space Created Successfully",
        description: "Space has been created.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Failed to create space",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const playNext = async () => {
    if (!currentSpace) return;

    try {
      await axios.post(`/api/space/${currentSpace.id}/play-next`);
      // Notify other users to update their current song
      if (ws) {
        ws.send(
          JSON.stringify({
            type: "play-next",
            payload: {},
          })
        );
      }
      toast({
        title: "Playing Next Song",
        description: "The next song is now playing.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Failed to play next song",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const onVideoEnd = () => {
    if (isCreator) {
      playNext();
    }
  };

  const handleWebSocketMessage = async (data: any) => {
    if (data.type === "play-next") {
      await fetchStreams(currentSpace?.id || "");
    } else if (data.type === "update-queue") {
      await fetchStreams(currentSpace?.id || "");
    }
  };

  const isSpotifyTrack = (url: string) => {
    return url.includes("spotify.com/track/");
  };

  const renderPlayer = () => {
    if (!currentSong) return null;

    const playbackPositionInSeconds = currentSong.startedAt
      ? Math.floor(
          (Date.now() - new Date(currentSong.startedAt).getTime()) / 1000
        )
      : 0;

    if (isSpotifyTrack(currentSong.url)) {
      // Note: SpotifyPlayer may not support starting at a specific position
      return (
        <SpotifyPlayer
          uri={`spotify:track:${currentSong.extractedurl}`}
          size={{ width: "100%", height: 80 }}
          view="list"
          theme="black"
        />
      );
    } else {
      return (
        <YouTube
          videoId={currentSong.extractedurl}
          opts={{
            width: "100%",
            height: "200",
            playerVars: {
              autoplay: 1,
              start: playbackPositionInSeconds,
            },
          }}
          onEnd={onVideoEnd}
          ref={playerRef}
        />
      );
    }
  };

  return (
    <div className="container mt-12 p-4">
      <Appbar />

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          {error}
        </div>
      )}

      {!currentSpace ? (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Available Spaces</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create New Space</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Space</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    placeholder="Space Name"
                    value={newSpaceName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewSpaceName(e.target.value)
                    }
                  />
                  <Input
                    placeholder="Space Description"
                    value={newSpaceDescription}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewSpaceDescription(e.target.value)
                    }
                  />
                  <Button onClick={createSpace}>Create Space</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {spaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaces.map((space) => (
                <Card
                  key={space.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => joinSpace(space)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      {space.name || "Unnamed Space"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {space.description || "No description"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Created by: {space.author?.name || "Unknown"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No spaces available.</p>
          )}
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">{currentSpace.name}</h2>
              <p className="text-sm text-gray-600">
                {currentSpace.description}
              </p>
            </div>
            <Button variant="destructive" onClick={leaveSpace}>
              Leave Space
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Now Playing
                    {isCreator && (
                      <Button
                        onClick={playNext}
                        disabled={queue.length <= 1}
                        variant="secondary"
                      >
                        Play Next
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentSong ? (
                    <>
                      {renderPlayer()}
                      <p className="mt-4 text-lg font-semibold">
                        {currentSong.title}
                      </p>
                    </>
                  ) : (
                    <p className="text-center text-gray-500">
                      No song is playing.
                    </p>
                  )}
                </CardContent>
              </Card>
              <div className="flex items-center">
                <Input
                  type="text"
                  placeholder="Paste YouTube or Spotify URL here"
                  value={newSongUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewSongUrl(e.target.value)
                  }
                  className="flex-1 mr-2"
                />
                <Button onClick={createStream}>Add to Queue</Button>
              </div>
            </div>
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Queue</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    {queue.length > 1 ? (
                      queue.slice(1).map((song) => (
                        <div
                          key={song.id}
                          className="px-4 py-2 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <p className="text-sm font-medium">{song.title}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 mt-4">
                        The queue is empty.
                      </p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
