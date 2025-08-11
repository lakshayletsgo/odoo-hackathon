"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Clock, MapPin, Plus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Room {
  id: string;
  name: string;
  sport: string;
  venue: string;
  date: string;
  time: string;
  playersRequired: number;
  playersJoined: number;
  playersLeft: number;
  contactDetails: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

export default function RoomsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/invites");
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      // Show a simple join form or use placeholder data
      const joinData = {
        joinerName: session?.user?.name || "Player",
        contactDetails: session?.user?.email || "contact@example.com",
        playersCount: 1,
      };

      const response = await fetch(`/api/invites/${roomId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(joinData),
      });

      if (response.ok) {
        fetchRooms(); // Refresh the list
        alert("Join request sent successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to join room"}`);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Error joining room");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Game Rooms
            </h1>
            <p className="text-xl text-gray-600">
              Join or create rooms to play together
            </p>
          </div>
          <Button
            onClick={() => router.push("/rooms/create")}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Room
          </Button>
        </div>

        {rooms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No rooms available
              </h3>
              <p className="text-gray-500 mb-4">
                Be the first to create a game room!
              </p>
              <Button onClick={() => router.push("/rooms/create")}>
                Create First Room
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card key={room.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <Badge variant="secondary">{room.sport}</Badge>
                  </div>
                  <CardDescription>
                    Created by {room.creator.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {room.venue}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarDays className="w-4 h-4" />
                    {new Date(room.date).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {room.time}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {room.playersJoined}/{room.playersRequired} players
                  </div>

                  <div className="pt-2">
                    {room.creator.id === session?.user?.id ? (
                      <Badge variant="outline">Your Room</Badge>
                    ) : room.playersLeft > 0 ? (
                      <Button
                        onClick={() => handleJoinRoom(room.id)}
                        className="w-full"
                        size="sm"
                      >
                        Join Room
                      </Button>
                    ) : (
                      <Badge variant="secondary">Room Full</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
