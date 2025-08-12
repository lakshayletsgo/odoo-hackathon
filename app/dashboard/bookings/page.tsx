"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock, MapPin, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  court: {
    name: string;
    venue: {
      name: string;
      address: string;
      city: string;
    };
  };
  createdAt: string;
  type: "venue" | "game";
}

interface JoinRequest {
  id: string;
  joinerName: string;
  contactDetails: string;
  playersCount: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  invite: {
    id: string;
    name: string;
    venue: string;
    sport: string;
    date: string;
    time: string;
    playersRequired: number;
    creator: {
      name: string;
      email: string;
    };
  };
}

export default function UserBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  // Removed allBookings as it's not used - using filteredBookings instead
  // Removed filteredBookings state - now using useMemo computed value
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookings = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        console.error("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  const fetchJoinRequests = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/user/join-requests");
      if (response.ok) {
        const data = await response.json();
        setJoinRequests(data.joinRequests || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch join requests:", response.status, errorData);
        // Set empty array on error so UI still works
        setJoinRequests([]);
      }
    } catch (error) {
      console.error("Error fetching join requests:", error);
      // Set empty array on error so UI still works
      setJoinRequests([]);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchBookings();
    fetchJoinRequests();
  }, [fetchBookings, fetchJoinRequests]);

  // Add periodic refresh to check for updated join requests
  useEffect(() => {
    const interval = setInterval(() => {
      if (session?.user) {
        fetchJoinRequests();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [session?.user, fetchJoinRequests]);

  // Removed duplicate functions - using the useCallback versions above

  const filteredBookings = useMemo(() => {
    // Convert join requests to booking format for display
    const gameBookings: Booking[] = joinRequests
      .filter((request) => request.status === "ACCEPTED") // Only show accepted requests
      .map((request) => ({
        id: `game-${request.id}`,
        date: request.invite.date,
        startTime: request.invite.time,
        endTime: `${parseInt(request.invite.time.split(":")[0]) + 2}:${
          request.invite.time.split(":")[1]
        }`, // Assume 2 hour duration
        totalAmount: 0, // Game bookings don't have amount
        status: "CONFIRMED" as const,
        court: {
          name: request.invite.sport,
          venue: {
            name: request.invite.venue,
            address: request.invite.venue,
            city: request.invite.venue,
          },
        },
        createdAt: request.createdAt,
        type: "game" as const,
      }));

    // Combine venue bookings and game bookings
    const combined = [
      ...bookings.map((b) => ({ ...b, type: "venue" as const })),
      ...gameBookings,
    ];

    // Apply filters
    let filtered = combined;

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (booking) =>
          booking.court.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.court.venue.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.court.venue.city
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [bookings, joinRequests, statusFilter, searchQuery]);

  // Removed filterBookings as it's not used - using combineAndFilterBookings instead

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "default" as const;
      case "PENDING":
        return "secondary" as const;
      case "CANCELLED":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Your booking is confirmed! Get ready for your game.";
      case "PENDING":
        return "Waiting for venue owner approval.";
      case "CANCELLED":
        return "This booking has been cancelled.";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            Track all your court reservations and their status
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by venue or court name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter === "ALL"
                  ? "You haven't made any bookings yet."
                  : `No bookings with ${statusFilter.toLowerCase()} status.`}
              </p>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Find Courts
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {booking.court.name}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {booking.type === "game"
                                ? "Game Event"
                                : "Venue Booking"}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">
                            {booking.court.venue.name}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.court.venue.city}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {getStatusDescription(booking.status)}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {booking.type === "game" ? "Joined on" : "Booked on"}{" "}
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                        <span className="font-bold text-green-600 text-lg">
                          {booking.type === "game"
                            ? "Free"
                            : `₹${booking.totalAmount}`}
                        </span>
                      </div>
                    </div>
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
