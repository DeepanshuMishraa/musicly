'use client'

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import YouTube from 'react-youtube';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import prisma from '@/lib/db';
import { Appbar } from '@/components/Appbar';

interface Space {
  id: string;
  name: string;
  description: string;
  author: string;
  authorId: string;
}

interface Stream {
  id: string;
  title: string;
  extractedurl: string;
}

const DashboardPage: React.FC = () => {
  const { data: session } = useSession();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [newSongUrl, setNewSongUrl] = useState<string>('');
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<Stream | null>(null);
  const [queue, setQueue] = useState<Stream[]>([]);
  const playerRef = useRef<YouTube>(null);
  const [newSpaceName, setNewSpaceName] = useState<string>('');
  const [newSpaceDescription, setNewSpaceDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const response = await axios.get<{ spaces: Space[] }>('/api/create/space');
      setSpaces(response.data.spaces || []);
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
      setError('Failed to fetch spaces. Please try again later.');
    }
  };

  const joinSpace = async (space: Space) => {
    try {
      const response = await axios.post("/api/join-space", {
        spaceId: space.id,
      });
      setCurrentSpace(space);
      setIsCreator(response.data.isCreator);
      await fetchStreams(space.id);
    } catch (error) {
      console.error("Failed to join space:", error);
      setError("Failed to join space. Please try again later.");
    }
  };

  const fetchStreams = async (spaceId: string) => {
    try {
      const response = await axios.get<{ streams: Stream[] }>(`/api/create/stream?spaceId=${spaceId}`);
      setQueue(response.data.streams || []);
      if (response.data.streams && response.data.streams.length > 0) {
        setCurrentSong(response.data.streams[0]);
      }
    } catch (error) {
      console.error('Failed to fetch streams:', error);
      setError('Failed to fetch streams. Please try again later.');
    }
  };

  const createStream = async () => {
    if (!newSongUrl || !currentSpace) return;

    try {
      const response = await axios.post<{ stream: Stream }>('/api/create/stream', {
        spaceId: currentSpace.id,
        url: newSongUrl,
      });
      if (response.data.stream) {
        setQueue([...queue, response.data.stream]);
        setNewSongUrl('');
        if (!currentSong) {
          setCurrentSong(response.data.stream);
        }
      }
    } catch (error) {
      console.error('Failed to create stream:', error);
      setError('Failed to add song to queue. Please try again.');
    }
  };

  const createSpace = async () => {
    try {
      const response = await axios.post<{ space: Space }>('/api/create/space', {
        name: newSpaceName,
        description: newSpaceDescription,
      });
      if (response.data.space) {
        setSpaces([...spaces, response.data.space]);
        setNewSpaceName('');
        setNewSpaceDescription('');
      }
    } catch (error) {
      console.error('Failed to create space:', error);
      setError('Failed to create space. Please try again.');
    }
  };

  const onVideoEnd = () => {
    playNext();
  };

  const playNext = () => {
    const newQueue = [...queue];
    newQueue.shift();
    setQueue(newQueue);
    if (newQueue.length > 0) {
      setCurrentSong(newQueue[0]);
    } else {
      setCurrentSong(null);
    }
  };

return (
    <div className="container mx-auto p-4">
        <Appbar/>

      {error && <div className="bg-red-100  border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      {!currentSpace ? (
        <div>
          <div className="mt-8 mb-4">
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSpaceName(e.target.value)}
                  />
                  <Input
                    placeholder="Space Description"
                    value={newSpaceDescription}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSpaceDescription(e.target.value)}
                  />
                  <Button onClick={createSpace}>Create Space</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spaces.map((space) => (
              <Card key={space.id}>
                <CardHeader>
                  <CardTitle>{space.name || 'Unnamed Space'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{space.description || 'No description'}</p>
                  <p className="text-sm text-gray-500">Created by: {space.author || 'Unknown'}</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => joinSpace(space)}>Join Space</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">{currentSpace.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Now Playing
                  <Button onClick={playNext} disabled={queue.length <= 1}>Play Next</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentSong && (
                  <div>
                    <YouTube
                      videoId={currentSong.extractedurl}
                      opts={{ width: '100%', height: '300' }}
                      onEnd={onVideoEnd}
                      ref={playerRef}
                    />
                    <p className="mt-2">{currentSong.title}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Songs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {queue.slice(1).map((song, index) => (
                    <div key={song.id} className="mb-2">
                      <p>{index + 1}. {song.title}</p>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4">
            <Input
              type="text"
              placeholder="Paste YouTube URL here"
              value={newSongUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSongUrl(e.target.value)}
            />
            <Button onClick={createStream} className="mt-2">Add to Queue</Button>
          </div>
          <Button onClick={() => setCurrentSpace(null)} className="mt-4">Leave Space</Button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
