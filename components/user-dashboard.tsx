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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  Search,
  Star,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
};

interface UserStats {
  totalBookings: number;
  totalSpent: number;
  favoriteVenues: number;
  averageRating: number;
  upcomingBookings: number;
  completedBookings: number;
}

interface Booking {
  id: string;
  venue: { name: string; address: string };
  court: { name: string; sport: string };
  date: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
}

export default function UserDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats>({
    totalBookings: 0,
    totalSpent: 0,
    favoriteVenues: 0,
    averageRating: 0,
    upcomingBookings: 0,
    completedBookings: 0,
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for demo
      setStats({
        totalBookings: 24,
        totalSpent: 480,
        favoriteVenues: 3,
        averageRating: 4.7,
        upcomingBookings: 2,
        completedBookings: 22,
      });

      setBookings([
        {
          id: "1",
          venue: { name: "Elite Tennis Club", address: "123 Sports Ave" },
          court: { name: "Court A", sport: "Tennis" },
          date: "2024-12-25",
          startTime: "10:00",
          endTime: "11:00",
          status: "CONFIRMED",
          totalAmount: 25,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          venue: { name: "Downtown Basketball", address: "456 City St" },
          court: { name: "Court 1", sport: "Basketball" },
          date: "2024-12-22",
          startTime: "14:00",
          endTime: "15:30",
          status: "COMPLETED",
          totalAmount: 35,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch user dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "COMPLETED":
        return "bg-blue-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
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
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {session?.user?.name}!
            </h1>
            <p className="text-muted-foreground">
              Track your bookings and discover new venues
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback>
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <Badge variant="secondary">Player</Badge>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="venues" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Find Venues
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Stats Cards */}
            <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Bookings
                      </p>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.totalBookings}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.upcomingBookings} upcoming
                    </p>
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
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Spent
                      </p>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(stats.totalSpent)}
                    </div>
                    <p className="text-xs text-muted-foreground">This year</p>
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
                      <p className="text-sm font-medium text-muted-foreground">
                        Favorite Venues
                      </p>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.favoriteVenues}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Venues you love
                    </p>
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
                      <p className="text-sm font-medium text-muted-foreground">
                        Average Rating
                      </p>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(stats.averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest bookings and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{booking.venue.name}</h4>
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusColor(
                              booking.status
                            )}`}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {booking.court.name} • {booking.court.sport}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.date).toLocaleDateString()} at{" "}
                          {booking.startTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(booking.totalAmount)}
                        </p>
                        <Badge
                          variant={
                            booking.status === "CONFIRMED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>
                  View and manage all your court bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="Search bookings..."
                    className="max-w-sm"
                  />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{booking.venue.name}</h4>
                          <Badge variant="outline">{booking.court.sport}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {booking.court.name} • {booking.venue.address}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(booking.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
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
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="venues">
            <Card>
              <CardHeader>
                <CardTitle>Discover Venues</CardTitle>
                <CardDescription>
                  Find and book courts at amazing venues near you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Find Your Perfect Court
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Browse through hundreds of sports venues in your area
                  </p>
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Browse Venues
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="text-lg">
                      {session?.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">
                      {session?.user?.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {session?.user?.email}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      Player Account
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input defaultValue={session?.user?.name || ""} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input defaultValue={session?.user?.email || ""} disabled />
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="font-medium mb-4">Account Statistics</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span>Member Since</span>
                      <span className="font-medium">
                        {new Date().getFullYear() - 1}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span>Total Bookings</span>
                      <span className="font-medium">{stats.totalBookings}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span>Completion Rate</span>
                      <span className="font-medium">98%</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span>Average Rating</span>
                      <span className="font-medium">
                        {stats.averageRating.toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Update Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
