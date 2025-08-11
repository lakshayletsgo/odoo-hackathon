"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  MapPin,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OwnerBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  user: {
    name: string;
    email: string;
    image?: string;
  };
  court: {
    name: string;
    venue: {
      name: string;
    };
  };
}

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [pendingBookings, setPendingBookings] = useState<OwnerBooking[]>([]);
  const [recentBookings, setRecentBookings] = useState<OwnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingBookings, setProcessingBookings] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetchBookings();
  }, [session]);

  const fetchBookings = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const response = await fetch("/api/owner/bookings");
      if (response.ok) {
        const data = await response.json();
        setPendingBookings(data.pending || []);
        setRecentBookings(data.recent || []);
      } else {
        console.error("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (
    bookingId: string,
    action: "CONFIRMED" | "CANCELLED"
  ) => {
    setProcessingBookings((prev) => new Set(prev).add(bookingId));

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        toast.success(`Booking ${action.toLowerCase()} successfully!`);
        fetchBookings(); // Refresh the list
      } else {
        const error = await response.text();
        toast.error(error || "Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setProcessingBookings((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
                    {session?.user?.name?.split(" ")[0] || "Owner"}!
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your venue bookings and grow your business
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pending Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Approvals ({pendingBookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : pendingBookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No pending bookings to review
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            src={booking.user.image}
                            name={booking.user.name}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium">{booking.user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.user.email}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">PENDING</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {booking.court.name} - {booking.court.venue.name}
                          </span>
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

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleBookingAction(booking.id, "CONFIRMED")
                          }
                          disabled={processingBookings.has(booking.id)}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {processingBookings.has(booking.id)
                            ? "Processing..."
                            : "Confirm"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleBookingAction(booking.id, "CANCELLED")
                          }
                          disabled={processingBookings.has(booking.id)}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {processingBookings.has(booking.id)
                            ? "Processing..."
                            : "Decline"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : recentBookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No recent bookings
                </p>
              ) : (
                <div className="space-y-4">
                  {recentBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <UserAvatar
                            src={booking.user.image}
                            name={booking.user.name}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium">{booking.user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.court.name}
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
