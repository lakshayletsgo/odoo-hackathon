"use client";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { UserProfileCard } from "@/components/ui/user-profile-card";
import { CalendarDays, Clock, MapPin, Plus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface Booking {
  id: string;
  date: string;
  startTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  court: {
    name: string;
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
  const [bookings] = useState<Booking[]>([]);
  const [invites] = useState<Invite[]>([]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

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
              {bookings.length === 0 ? (
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
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={session?.user?.image}
                          name={session?.user?.name}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium">{booking.court.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.date} at {booking.startTime}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          booking.status === "CONFIRMED"
                            ? "default"
                            : booking.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
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
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Game Invite
                </Button>

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
                <Button variant="outline" className="h-20 z-10 flex-col gap-2">
                  <CalendarDays className="h-6 w-6" />
                  <span>Book a Court</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span>Find Players</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <MapPin className="h-6 w-6" />
                  <span>Find Venues</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
