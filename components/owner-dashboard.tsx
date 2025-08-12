"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  Building2,
  CalendarDays,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
  Settings,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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

interface Venue {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  isApproved: boolean;
  isActive: boolean;
  rating: number;
  totalRating: number;
  createdAt: string;
  totalBookings?: number;
  totalRevenue?: number;
  activeCourts?: number;
  _count: {
    courts: number;
  };
}

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [pendingBookings, setPendingBookings] = useState<OwnerBooking[]>([]);
  const [recentBookings, setRecentBookings] = useState<OwnerBooking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [processingBookings, setProcessingBookings] = useState<Set<string>>(
    new Set()
  );

  // Convert to useCallback for stable references
  const fetchBookings = useCallback(async () => {
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
  }, [session?.user]);

  const fetchVenues = useCallback(async () => {
    if (!session?.user) return;

    try {
      setVenuesLoading(true);
      const response = await fetch("/api/owner/venues");
      if (response.ok) {
        const data = await response.json();
        // API returns array directly, not wrapped in { venues: [] }
        setVenues(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch venues", response.status);
        const errorData = await response.text();
        console.error("Error details:", errorData);
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
    } finally {
      setVenuesLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchBookings();
    fetchVenues();
  }, [fetchBookings, fetchVenues]);

  // Add visibility change listener to refresh data when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user) {
        fetchVenues();
        fetchBookings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session?.user, fetchVenues, fetchBookings]);

  // Removed duplicate function definitions - using useCallback versions above

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

        {/* Quick Actions */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Link href="/owner/venues/new">
                  <Button className="h-20 w-full flex-col gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-6 w-6" />
                    <span>Create New Venue</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="h-20 w-full flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-200"
                  onClick={() => {
                    // Scroll to venues section
                    document.getElementById('venues-section')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                >
                  <Building2 className="h-6 w-6" />
                  <span>View My Venues</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Venues Section */}
        <div id="venues-section" className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                My Venues ({venues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {venuesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : venues.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No venues yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start by creating your first venue to begin accepting bookings
                  </p>
                  <Link href="/owner/venues/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Venue
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {venues.map((venue) => (
                    <div
                      key={venue.id}
                      className="p-4 border rounded-lg space-y-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{venue.name}</h3>
                        <div className="flex gap-2">
                          {venue.isApproved ? (
                            <Badge variant="default">Approved</Badge>
                          ) : (
                            <Badge variant="secondary">Pending Approval</Badge>
                          )}
                          {venue.isActive && (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{venue.address}, {venue.city}, {venue.state}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3" />
                          <span>{venue._count.courts} courts</span>
                          {venue.activeCourts !== undefined && venue.activeCourts !== venue._count.courts && (
                            <span className="text-muted-foreground">({venue.activeCourts} active)</span>
                          )}
                        </div>
                        {venue.rating > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-500">★</span>
                            <span>{venue.rating.toFixed(1)} ({venue.totalRating} reviews)</span>
                          </div>
                        )}
                        {venue.totalBookings !== undefined && venue.totalBookings > 0 && (
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3 w-3" />
                            <span>{venue.totalBookings} bookings</span>
                            {venue.totalRevenue !== undefined && (
                              <span className="text-green-600 font-medium">₹{venue.totalRevenue}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {venue.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {venue.description}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Link href={`/owner/venues/${venue.id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Settings className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
