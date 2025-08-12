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
import { useCallback, useEffect, useMemo, useState } from "react";
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

// Sport-specific images from assets folder with multiple mapping variations
const sportImages: { [key: string]: string } = {
  // Primary mappings
  SWIMMING: "/assets/swimming.jpg",
  TENNIS: "/assets/tennis.jpg", 
  CRICKET: "/assets/cricket.jpg",
  FOOTBALL: "/assets/football.jpg",
  VOLLEYBALL: "/assets/volleyball.jpg",
  BASKETBALL: "/assets/basketball.jpg",
  PICKLEBALL: "/assets/pickleball.jpg",
  BADMINTON: "/assets/badminton.jpg",
  TABLE_TENNIS: "/assets/table-tennis.jpg",
  
  // Alternative mappings for common variations
  "TABLE TENNIS": "/assets/table-tennis.jpg",
  "PING PONG": "/assets/table-tennis.jpg",
  TABLETENNIS: "/assets/table-tennis.jpg",
  SOCCER: "/assets/football.jpg",
  SWIM: "/assets/swimming.jpg",
  
  // Lowercase variations (just in case)
  badminton: "/assets/badminton.jpg",
  basketball: "/assets/basketball.jpg",
  swimming: "/assets/swimming.jpg",
  tennis: "/assets/tennis.jpg",
  cricket: "/assets/cricket.jpg",
  football: "/assets/football.jpg",
  volleyball: "/assets/volleyball.jpg",
  pickleball: "/assets/pickleball.jpg",
};

export function JoinEventTab({ onManageRequests }: JoinEventTabProps) {
  const { data: session } = useSession();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const fetchInvites = useCallback(async () => {
    try {
      const response = await axios.get("/api/invites");
      setInvites(response.data);
    } catch (error) {
      console.error("Error fetching invites:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const formatTime = useCallback((timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }, []);

  const formatSport = useCallback((sport: string) => {
    return sport
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }, []);

  const getSportImage = useCallback((sport: string) => {
    if (!sport) return "/placeholder.svg";
    
    // Normalize the sport name - handle underscores, spaces, and case
    const normalizedSport = sport
      .toUpperCase()
      .replace(/_/g, " ")  // Convert underscores to spaces
      .trim();             // Remove extra whitespace
    
    // Debug logging to see what sport names we're getting
    console.log("Original sport:", sport, "-> Normalized:", normalizedSport);
    
    // Try exact match first
    if (sportImages[normalizedSport]) {
      console.log("Found exact match for:", normalizedSport);
      return sportImages[normalizedSport];
    }
    
    // Try without spaces (for cases like "TABLE_TENNIS" vs "TABLETENNIS")
    const noSpaceSport = normalizedSport.replace(/\s+/g, "");
    if (sportImages[noSpaceSport]) {
      console.log("Found no-space match for:", noSpaceSport);
      return sportImages[noSpaceSport];
    }
    
    // Try with underscores instead of spaces
    const underscoreSport = normalizedSport.replace(/\s+/g, "_");
    if (sportImages[underscoreSport]) {
      console.log("Found underscore match for:", underscoreSport);
      return sportImages[underscoreSport];
    }
    
    // Try the original sport name as-is (in case it's already properly formatted)
    if (sportImages[sport]) {
      console.log("Found original match for:", sport);
      return sportImages[sport];
    }
    
    // Log when we fall back to placeholder
    console.log("No match found for sport:", sport, "using placeholder");
    
    // Fallback to placeholder
    return "/placeholder.svg";
  }, []);

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
                    target.src = "/placeholder.svg";
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
