"use client";

import { JoinInviteModal } from "@/components/play-together/join-invite-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import {
  CalendarDays,
  Clock,
  MapPin,
  Settings,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Invite {
  id: string;
  name: string;
  venue: string;
  date: string;
  time: string;
  sport: string;
  playersRequired: number;
  playersJoined: number;
  playersLeft: number;
  contactDetails: string;
  status: string;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  image?: string;
}

interface JoinEventTabProps {
  onManageRequests: (inviteId: string) => void;
}

const sportImages = {
  SWIMMING: "/images/sports/swimming.jpg",
  TENNIS: "/images/sports/tennis.jpg",
  CRICKET: "/images/sports/cricket.jpg",
  FOOTBALL: "/images/sports/football.jpg",
  VOLLEYBALL: "/images/sports/volleyball.jpg",
  BASKETBALL: "/images/sports/basketball.jpg",
  PICKLEBALL: "/images/sports/pickleball.jpg",
  BADMINTON: "/images/sports/badminton.jpg",
  TABLE_TENNIS: "/images/sports/table-tennis.jpg",
};

export function JoinEventTab({ onManageRequests }: JoinEventTabProps) {
  const { data: session } = useSession();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const fetchInvites = async () => {
    try {
      const response = await axios.get("/api/invites");
      setInvites(response.data);
    } catch (error) {
      console.error("Error fetching invites:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatSport = (sport: string) => {
    return sport
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getSportImage = (sport: string) => {
    return (
      sportImages[sport as keyof typeof sportImages] ||
      "/images/sports/default.jpg"
    );
  };

  // Update the image source to use a placeholder or handle missing images
  const getEventImage = (sport: string) => {
    return `/api/images/sports/default`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse mx-auto mb-4" />
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Trophy className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Events</h2>
        <p className="text-gray-600">
          Discover and join sports activities in your area
        </p>
      </div>

      {invites.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Events Available
            </h3>
            <p className="text-gray-600">
              Be the first to create an event and find players to join you!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {invites.map((invite) => (
            <Card
              key={invite.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {/* Event Image */}
              <div className="relative h-40">
                <Image
                  src={invite.image || getSportImage(invite.sport)}
                  alt={invite.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/sports/default.jpg";
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Badge
                    variant="secondary"
                    className="bg-white/90 text-gray-900"
                  >
                    {formatSport(invite.sport)}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Event Name */}
                  <h3 className="font-semibold text-lg leading-tight">
                    {invite.name}
                  </h3>

                  {/* Event Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{invite.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 flex-shrink-0" />
                      <span>{formatDate(invite.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{formatTime(invite.time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>{invite.playersLeft} spots available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span>by {invite.creator.name}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    {invite.creator.id === session?.user?.id ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => onManageRequests(invite.id)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Requests
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedInvite(invite);
                          setShowJoinModal(true);
                        }}
                        disabled={invite.playersLeft === 0}
                      >
                        {invite.playersLeft === 0 ? "Event Full" : "Join Event"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Join Modal */}
      {selectedInvite && (
        <JoinInviteModal
          open={showJoinModal}
          onOpenChange={setShowJoinModal}
          invite={selectedInvite}
          onSuccess={fetchInvites}
        />
      )}
    </div>
  );
}
