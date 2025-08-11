"use client";

import { CreateInviteForm } from "@/components/play-together/create-invite-form";
import { JoinInviteModal } from "@/components/play-together/join-invite-modal";
import { ManageRequestsModal } from "@/components/play-together/manage-requests-modal";
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
import axios from "axios";
import { CalendarDays, Clock, MapPin, Plus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

export default function PlayTogetherPage() {
  const { data: session } = useSession();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [filteredInvites, setFilteredInvites] = useState<Invite[]>([]);
  const [myInvites, setMyInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageInviteId, setManageInviteId] = useState<string>("");

  // Filters
  const [venueFilter, setVenueFilter] = useState("");
  const [sportFilter, setSportFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const sports = [
    "TENNIS",
    "BASKETBALL",
    "FOOTBALL",
    "BADMINTON",
    "VOLLEYBALL",
    "SQUASH",
    "CRICKET",
    "SOCCER",
  ];

  useEffect(() => {
    fetchInvites();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invites, venueFilter, sportFilter, dateFilter]);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/invites");
      const allInvites = response.data.invites;

      // Separate my invites and others
      const my = allInvites.filter(
        (invite: Invite) => invite.creator.id === session?.user?.id
      );
      const others = allInvites.filter(
        (invite: Invite) => invite.creator.id !== session?.user?.id
      );

      setMyInvites(my);
      setInvites(others);
    } catch (error) {
      console.error("Error fetching invites:", error);
      toast.error("Failed to fetch invites");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invites];

    if (venueFilter) {
      filtered = filtered.filter((invite) =>
        invite.venue.toLowerCase().includes(venueFilter.toLowerCase())
      );
    }

    if (sportFilter && sportFilter !== "all") {
      filtered = filtered.filter((invite) => invite.sport === sportFilter);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter(
        (invite) => new Date(invite.date).toDateString() === filterDate
      );
    }

    setFilteredInvites(filtered);
  };

  const handleJoinInvite = (invite: Invite) => {
    setSelectedInvite(invite);
    setShowJoinModal(true);
  };

  const handleManageRequests = (inviteId: string) => {
    setManageInviteId(inviteId);
    setShowManageModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>Please log in to access Play Together feature.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Play Together</h1>
          <p className="text-muted-foreground">
            Find players to join your sports activities
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Invite
        </Button>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Invites</TabsTrigger>
          <TabsTrigger value="my-invites">My Invites</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Venue
                  </label>
                  <Input
                    placeholder="Search by venue..."
                    value={venueFilter}
                    onChange={(e) => setVenueFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Sport
                  </label>
                  <Select value={sportFilter} onValueChange={setSportFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sports</SelectItem>
                      {sports.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport.charAt(0) + sport.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invites Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInvites.map((invite) => (
                <Card
                  key={invite.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{invite.name}</CardTitle>
                      <Badge variant="secondary">
                        {invite.sport.charAt(0) +
                          invite.sport.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                    <CardDescription>
                      Hosted by {invite.creator.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{invite.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(invite.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatTime(invite.time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{invite.playersLeft} spots available</span>
                    </div>
                    <Button
                      onClick={() => handleJoinInvite(invite)}
                      disabled={invite.playersLeft === 0}
                      className="w-full"
                    >
                      {invite.playersLeft === 0 ? "Full" : "Join"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredInvites.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No invites found matching your filters.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-invites" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myInvites.map((invite) => (
              <Card
                key={invite.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{invite.name}</CardTitle>
                    <Badge
                      variant={
                        invite.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {invite.status.toLowerCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{invite.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(invite.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(invite.time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {invite.playersJoined}/{invite.playersRequired} players
                      joined
                    </span>
                  </div>
                  <Button
                    onClick={() => handleManageRequests(invite.id)}
                    variant="outline"
                    className="w-full"
                  >
                    Manage Requests
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {myInvites.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  You haven't created any invites yet.
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4"
                >
                  Create Your First Invite
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateInviteForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={fetchInvites}
      />

      {selectedInvite && (
        <JoinInviteModal
          open={showJoinModal}
          onOpenChange={setShowJoinModal}
          invite={selectedInvite}
          onSuccess={fetchInvites}
        />
      )}

      <ManageRequestsModal
        open={showManageModal}
        onOpenChange={setShowManageModal}
        inviteId={manageInviteId}
        onSuccess={fetchInvites}
      />
    </div>
  );
}
