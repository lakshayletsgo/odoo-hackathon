"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

import AdminDashboard from "./admin-dashboard";
import OwnerDashboard from "./owner-dashboard";
import UserDashboard from "./user-dashboard";

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeVenues: number;
  activeCourts: number;
  monthlyGrowth: number;
  weeklyBookings: number;
  averageRating: number;
  completionRate: number;
}

interface Booking {
  id: string;
  user: { name: string; email: string; image?: string };
  court: { name: string; venue: { name: string } };
  date: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
}

interface Venue {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  images: string[];
  amenities: string[];
  isActive: boolean;
  isApproved: boolean;
  totalBookings: number;
  totalRevenue: number;
  activeCourts: number;
  _count: { courts: number };
  createdAt: string;
}

export default function EnhancedDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalRevenue: 0,
    activeVenues: 0,
    activeCourts: 0,
    monthlyGrowth: 0,
    weeklyBookings: 0,
    averageRating: 0,
    completionRate: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes, venuesRes] = await Promise.all([
        fetch("/api/owner/stats"),
        fetch("/api/owner/bookings?limit=10"),
        fetch("/api/owner/venues"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setRecentBookings(bookingsData);
      }

      if (venuesRes.ok) {
        const venuesData = await venuesRes.json();
        setVenues(venuesData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingAction = async (
    bookingId: string,
    action: "confirm" | "cancel"
  ) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/${action}`, {
        method: "PUT",
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error(`Failed to ${action} booking:`, error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500";
      case "PENDING":
        return "bg-secondary";
      case "COMPLETED":
        return "bg-primary";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth/signin");
  }

  const userRole = (session.user as any)?.role || "USER";

  // Render appropriate dashboard based on user role
  switch (userRole) {
    case "ADMIN":
      return <AdminDashboard />;
    case "OWNER":
      return <OwnerDashboard />;
    case "USER":
    default:
      return <UserDashboard />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name}
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/owner/venues/new">
              <Button>Add New Venue</Button>
            </Link>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.totalRevenue || 0)}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {(stats.monthlyGrowth || 0) > 0 ? (
                      <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={
                        (stats.monthlyGrowth || 0) > 0
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {Math.abs(stats.monthlyGrowth || 0).toFixed(1)}%
                    </span>
                    <span className="ml-1">from last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Bookings
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {(stats.totalBookings || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.weeklyBookings || 0} this week
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Rating
                  </CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {(stats.averageRating || 0).toFixed(1)}
                  </div>
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(stats.averageRating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completion Rate
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {stats.completionRate || 0}%
                  </div>
                  <Progress value={stats.completionRate || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Recent Bookings
            </TabsTrigger>
            <TabsTrigger value="venues" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              My Venues
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                  Manage your latest court bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={booking.user?.image} />
                            <AvatarFallback className="bg-primary/10">
                              {getInitials(booking.user?.name || "U")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">
                                {booking.court?.name}
                              </p>
                              <div
                                className={`w-2 h-2 rounded-full ${getStatusColor(
                                  booking.status
                                )}`}
                              />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {booking.user?.name} •{" "}
                              {new Date(booking.date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.startTime} - {booking.endTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatCurrency(booking.totalAmount)}
                            </p>
                            <Badge
                              variant={
                                booking.status === "CONFIRMED"
                                  ? "default"
                                  : booking.status === "PENDING"
                                  ? "secondary"
                                  : booking.status === "COMPLETED"
                                  ? "outline"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {booking.status}
                            </Badge>
                          </div>
                          {booking.status === "PENDING" && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleBookingAction(booking.id, "confirm")
                                }
                                className="h-8 w-8 p-0"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleBookingAction(booking.id, "cancel")
                                }
                                className="h-8 w-8 p-0"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No recent bookings
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="venues">
            <Card>
              <CardHeader>
                <CardTitle>My Venues</CardTitle>
                <CardDescription>
                  Manage your sports venues and courts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {venues.length > 0 ? (
                  <div className="space-y-4">
                    {venues.map((venue) => (
                      <motion.div
                        key={venue.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-6 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-white" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-lg">
                                {venue.name}
                              </h3>
                              <Badge
                                variant={
                                  venue.isActive ? "default" : "secondary"
                                }
                              >
                                {venue.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {venue.address}, {venue.city}, {venue.state}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>{venue._count.courts} courts</span>
                              <span>•</span>
                              <span>{venue.totalBookings} bookings</span>
                              <span>•</span>
                              <span>
                                {formatCurrency(venue.totalRevenue)} revenue
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/venues/${venue.id}`}>View</Link>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No venues yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first venue to start accepting bookings
                    </p>
                    <Link href="/owner/venues/new">
                      <Button>Create Your First Venue</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Venues
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeVenues}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeCourts} total courts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    This Week
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.weeklyBookings || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Growth Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.monthlyGrowth || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    monthly growth
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
