"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { UserProfileCard } from "@/components/ui/user-profile-card";
import { CalendarDays, Clock, MapPin, Plus, Search, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
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
  const [invites] = useState<Invite[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [session]);

  const fetchBookings = async () => {
    if (!session?.user) return;

    try {
      setLoadingBookings(true);
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
      setLoadingBookings(false);
    }
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
              ) : bookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No bookings yet. Book your first court!
                </p>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking) => (
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
                            ₹{booking.totalAmount}
                          </span>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                  {bookings.length > 3 && (
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
              <div className="grid gap-4 md:grid-cols-3">
                <Link href="/search" className="block">
                  <Button
                    variant="outline"
                    className="h-20 w-full flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-200"
                  >
                    <Search className="h-6 w-6" />
                    <span>Book a Court</span>
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
                <Link href="/venues" className="block">
                  <Button
                    variant="outline"
                    className="h-20 w-full flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-200"
                  >
                    <MapPin className="h-6 w-6" />
                    <span>Find Venues</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
