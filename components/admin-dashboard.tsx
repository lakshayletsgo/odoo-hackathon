"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building,
  Calendar,
  CheckCircle,
  DollarSign,
  Eye,
  LineChart,
  MapPin,
  Shield,
  Star,
  TrendingUp,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
};

interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalBookings: number;
  totalVenues: number;
  totalCourts: number;
  pendingVenues: number;
  totalRevenue: number;
  monthlyGrowth: number;
  chartData: {
    bookingActivity: Array<{ date: string; count: number; revenue: number }>;
    userRegistrations: Array<{ date: string; count: number }>;
    topSports: Array<{ sport: string; bookings: number }>;
  };
}

interface PendingVenue {
  id: string;
  name: string;
  address: string;
  city: string;
  owner: { name: string; email: string };
  courts: Array<{ name: string; sport: string }>;
  createdAt: string;
  _count: { courts: number };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  _count: { bookings: number; venues: number };
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOwners: 0,
    totalBookings: 0,
    totalVenues: 0,
    totalCourts: 0,
    pendingVenues: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    chartData: {
      bookingActivity: [],
      userRegistrations: [],
      topSports: [],
    },
  });
  const [pendingVenues, setPendingVenues] = useState<PendingVenue[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVenue, setSelectedVenue] = useState<PendingVenue | null>(null);
  const [actionComment, setActionComment] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (session?.user && (session.user as any)?.role === "ADMIN") {
      fetchDashboardData();
    }
  }, [session]);

  useEffect(() => {
    if (activeTab === "venues") {
      fetchPendingVenues();
    } else if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, searchQuery, roleFilter, statusFilter]);

  const fetchDashboardData = async () => {
    try {
      // Mock data for demo
      setStats({
        totalUsers: 1250,
        totalOwners: 85,
        totalBookings: 3400,
        totalVenues: 42,
        totalCourts: 180,
        pendingVenues: 7,
        totalRevenue: 125000,
        monthlyGrowth: 12.5,
        chartData: {
          bookingActivity: [],
          userRegistrations: [],
          topSports: [
            { sport: "Tennis", bookings: 850 },
            { sport: "Basketball", bookings: 720 },
            { sport: "Football", bookings: 680 },
            { sport: "Badminton", bookings: 420 },
            { sport: "Swimming", bookings: 380 },
          ],
        },
      });
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingVenues = async () => {
    try {
      // Mock data for demo
      setPendingVenues([
        {
          id: "1",
          name: "Elite Sports Complex",
          address: "123 Sports Ave",
          city: "New York",
          owner: { name: "John Smith", email: "john@elite.com" },
          courts: [
            { name: "Court A", sport: "Tennis" },
            { name: "Court B", sport: "Basketball" },
          ],
          createdAt: new Date().toISOString(),
          _count: { courts: 2 },
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch pending venues:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Mock data for demo
      setUsers([
        {
          id: "1",
          name: "Alice Johnson",
          email: "alice@example.com",
          role: "USER",
          isVerified: true,
          isBanned: false,
          createdAt: new Date().toISOString(),
          _count: { bookings: 12, venues: 0 },
        },
        {
          id: "2",
          name: "Bob Wilson",
          email: "bob@venue.com",
          role: "OWNER",
          isVerified: true,
          isBanned: false,
          createdAt: new Date().toISOString(),
          _count: { bookings: 0, venues: 3 },
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleVenueAction = async (
    venueId: string,
    action: "approve" | "reject",
    comments?: string
  ) => {
    setIsActionLoading(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Venue ${action}d successfully`);
      fetchPendingVenues();
      fetchDashboardData();
      setSelectedVenue(null);
      setActionComment("");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUserAction = async (
    userId: string,
    action: "ban" | "unban",
    reason?: string
  ) => {
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(`User ${action}ned successfully`);
      fetchUsers();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  if (
    !session ||
    !(session.user as any)?.role ||
    (session.user as any)?.role !== "ADMIN"
  ) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your platform, users, and venues
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            Admin Panel
          </Badge>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="venues" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Facility Approval
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Global Stats */}
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
                        Total Users
                      </p>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.totalUsers.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalOwners} facility owners
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
                        Total Bookings
                      </p>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.totalBookings.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Platform wide bookings
                    </p>
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
                        Active Courts
                      </p>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.totalCourts}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across {stats.totalVenues} venues
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
                        Total Revenue
                      </p>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(stats.totalRevenue)}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {stats.monthlyGrowth > 0 ? (
                        <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                      )}
                      <span
                        className={
                          stats.monthlyGrowth > 0
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {Math.abs(stats.monthlyGrowth)}%
                      </span>
                      <span className="ml-1">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 mb-8 md:grid-cols-3">
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveTab("venues")}
              >
                <CardContent className="p-6 text-center">
                  <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Facility Approvals</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Review and approve venue registrations
                  </p>
                  <Badge variant="secondary">
                    {stats.pendingVenues} pending
                  </Badge>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveTab("users")}
              >
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">User Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage users and facility owners
                  </p>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveTab("analytics")}
              >
                <CardContent className="p-6 text-center">
                  <LineChart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    View platform insights and trends
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="venues">
            <Card>
              <CardHeader>
                <CardTitle>Facility Approval</CardTitle>
                <CardDescription>
                  Review and approve pending venue registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingVenues.length > 0 ? (
                    pendingVenues.map((venue) => (
                      <motion.div
                        key={venue.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{venue.name}</h4>
                            <Badge variant="outline">
                              {venue._count.courts} courts
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {venue.address}, {venue.city}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Owner: {venue.owner.name} ({venue.owner.email})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedVenue(venue)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{venue.name}</DialogTitle>
                                <DialogDescription>
                                  {venue.address}, {venue.city}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Owner Information
                                  </h4>
                                  <p>Name: {venue.owner.name}</p>
                                  <p>Email: {venue.owner.email}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Courts ({venue._count.courts})
                                  </h4>
                                  <div className="grid gap-2">
                                    {venue.courts.map((court, idx) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between p-2 bg-muted rounded"
                                      >
                                        <span>{court.name}</span>
                                        <Badge variant="secondary">
                                          {court.sport}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="comment">
                                    Comments (optional)
                                  </Label>
                                  <Textarea
                                    id="comment"
                                    placeholder="Add any comments or feedback..."
                                    value={actionComment}
                                    onChange={(e) =>
                                      setActionComment(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleVenueAction(
                                      venue.id,
                                      "reject",
                                      actionComment
                                    )
                                  }
                                  disabled={isActionLoading}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleVenueAction(
                                      venue.id,
                                      "approve",
                                      actionComment
                                    )
                                  }
                                  disabled={isActionLoading}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No pending venue approvals
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage platform users and facility owners
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="USER">Users</SelectItem>
                      <SelectItem value="OWNER">Owners</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {users.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{user.name}</h4>
                            <Badge
                              variant={
                                user.role === "OWNER" ? "default" : "secondary"
                              }
                            >
                              {user.role}
                            </Badge>
                            {!user.isVerified && (
                              <Badge variant="destructive">Unverified</Badge>
                            )}
                            {user.isBanned && (
                              <Badge variant="destructive">Banned</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user._count.bookings} bookings •{" "}
                            {user._count.venues} venues
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant={
                                user.isBanned ? "default" : "destructive"
                              }
                              size="sm"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              {user.isBanned ? "Unban" : "Ban"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {user.isBanned ? "Unban" : "Ban"} User
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to{" "}
                                {user.isBanned ? "unban" : "ban"} {user.name}?
                                {!user.isBanned &&
                                  " This will prevent them from accessing the platform."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleUserAction(
                                    user.id,
                                    user.isBanned ? "unban" : "ban"
                                  )
                                }
                              >
                                {user.isBanned ? "Unban" : "Ban"} User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              {/* Most Active Sports */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Active Sports</CardTitle>
                  <CardDescription>
                    Sports with the most bookings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.chartData.topSports.map((sport, index) => (
                      <div
                        key={sport.sport}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-medium">{sport.sport}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${
                                  (sport.bookings /
                                    stats.chartData.topSports[0].bookings) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-16 text-right">
                            {sport.bookings}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Growth */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Monthly Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.monthlyGrowth}%
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                      <span className="text-green-500">Positive growth</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.8</div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < 4
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Platform Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">98%</div>
                    <Progress value={98} className="h-2 mt-2" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Admin Profile</CardTitle>
                <CardDescription>
                  Manage your admin account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">
                      {session?.user?.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {session?.user?.email}
                    </p>
                    <Badge variant="secondary">Administrator</Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={session?.user?.name || ""} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      defaultValue={session?.user?.email || ""}
                      disabled
                    />
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
