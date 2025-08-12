"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { UserProfileCard } from "@/components/ui/user-profile-card";
import {
  Bot,
  CalendarDays,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Search,
  User,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    };
  };
  type?: "venue" | "game";
}

interface JoinRequest {
  id: string;
  joinerName: string;
  contactDetails: string;
  playersCount: number;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
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

interface Invite {
  id: string;
  name: string;
  venue: string;
  time: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  playersJoined: number;
  playersRequired: number;
}

export default function UserDashboard() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [invites] = useState<Invite[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
    fetchJoinRequests();
  }, [session]);

  useEffect(() => {
    combineBookings();
  }, [bookings, joinRequests]);

  // Removed refreshDashboard function as it's not used

  // Add periodic refresh to check for updated data
  useEffect(() => {
    const interval = setInterval(() => {
      if (session?.user) {
        fetchBookings();
        fetchJoinRequests();
      }
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [session]);

  const fetchBookings = async () => {
    if (!session?.user) return;

    try {
      setLoadingBookings(true);
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data.map((b: any) => ({ ...b, type: "venue" })));
      } else {
        console.error("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchJoinRequests = async () => {
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
  };

  const combineBookings = () => {
    // Convert accepted join requests to booking format for display
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
          },
        },
        type: "game" as const,
      }));

    // Combine venue bookings and game bookings
    const combined = [...bookings, ...gameBookings];
    setAllBookings(combined);
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <UserAvatar
                  src={session?.user?.image}
                  name={session?.user?.name}
                  size="xl"
                />
                <div>
                  <h1 className="text-2xl font-bold">
                    Welcome back,{" "}
                    {session?.user?.name?.split(" ")[0] || "Player"}!
                  </h1>
                  <p className="text-muted-foreground">
                    Ready for your next game?
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Section */}
        <div className="grid gap-6 mb-6">
          {session?.user && <UserProfileCard user={session.user as any} />}
        </div>

        {/* Dashboard Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* My Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                My Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : allBookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No bookings yet. Book your first court!
                </p>
              ) : (
                <div className="space-y-4">
                  {allBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <UserAvatar
                            src={session?.user?.image}
                            name={session?.user?.name}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium">{booking.court.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.court.venue.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(booking.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.startTime} - {booking.endTime}
                          </span>
                          <span className="font-medium text-green-600">
                            {booking.type === "game" ? "Free" : `₹${booking.totalAmount}`}
                          </span>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                  {allBookings.length > 3 && (
                    <div className="text-center pt-2">
                      <Link href="/dashboard/bookings">
                        <Button variant="ghost" size="sm">
                          View All Bookings
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Invites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Game Invites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/play-together">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Game Invite
                  </Button>
                </Link>

                {invites.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No active invites. Create one to find players!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {invites.slice(0, 2).map((invite) => (
                      <div
                        key={invite.id}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{invite.name}</h4>
                          <Badge
                            variant={
                              invite.status === "ACTIVE"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {invite.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {invite.venue}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {invite.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {invite.playersJoined}/{invite.playersRequired}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <Link href="/search" className="block">
                  <Button
                    variant="outline"
                    className="h-20 w-full flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-200"
                  >
                    <Search className="h-6 w-6" />
                    <span>Book a Court</span>
                  </Button>
                </Link>
                <Link href="/chatbot" className="block">
                  <Button
                    variant="outline"
                    className="h-20 w-full flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-200"
                  >
                    <Bot className="h-6 w-6" />
                    <span>AI Assistant</span>
                  </Button>
                </Link>
                <Link href="/play-together" className="block">
                  <Button
                    variant="outline"
                    className="h-20 w-full flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-200"
                  >
                    <Users className="h-6 w-6" />
                    <span>Find Players</span>
                  </Button>
                </Link>
                <Link href="/dashboard/profile" className="block">
                  <Button
                    variant="outline"
                    className="h-20 w-full flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-200"
                  >
                    <User className="h-6 w-6" />
                    <span>Profile Settings</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Game Invites Card - New Addition */}
        <div className="mt-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent
              className="p-6"
              onClick={() => router.push("/dashboard/game-invites")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">My Game Invites</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage requests for your events
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
