"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Check, Clock, MapPin, User, Users, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  };
}

interface MyInvite {
  id: string;
  name: string;
  venue: string;
  sport: string;
  date: string;
  time: string;
  playersRequired: number;
  contactDetails: string;
  createdAt: string;
  playersJoined: number;
  playersLeft: number;
  joinRequests: JoinRequest[];
}

export default function GameInvitesPage() {
  const { data: session } = useSession();
  const [myInvites, setMyInvites] = useState<MyInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (session?.user) {
      fetchMyInvites();
    }
  }, [session]);

  const fetchMyInvites = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/my-invites");
      if (response.ok) {
        const data = await response.json();
        setMyInvites(data.invites);
      } else {
        toast.error("Failed to load your invites");
      }
    } catch (error) {
      console.error("Error fetching invites:", error);
      toast.error("Failed to load your invites");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    try {
      setProcessingRequest(requestId);
      const response = await fetch(`/api/requests/${requestId}/${action}`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success(`Request ${action}ed successfully!`);
        fetchMyInvites(); // Refresh the data
      } else {
        const result = await response.json();
        toast.error(result.error || `Failed to ${action} request`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "default" as const;
      case "PENDING":
        return "secondary" as const;
      case "REJECTED":
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading your game invites...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Game Invites</h1>
          <p className="text-muted-foreground">
            Manage requests for your gaming events
          </p>
        </div>

        {/* My Created Events */}
        <div className="space-y-6">
          {myInvites.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  No game invites found
                </h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any game events yet.
                </p>
                <Button>Create New Event</Button>
              </CardContent>
            </Card>
          ) : (
            myInvites.map((invite) => (
              <Card key={invite.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{invite.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {invite.venue}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(invite.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {invite.time}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{invite.sport}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-sm text-muted-foreground">
                      Players: {invite.playersJoined}/{invite.playersRequired}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {invite.playersLeft} spots left
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="requests">
                    <TabsList>
                      <TabsTrigger value="requests">
                        Join Requests (
                        {
                          invite.joinRequests.filter(
                            (r) => r.status === "PENDING"
                          ).length
                        }
                        )
                      </TabsTrigger>
                      <TabsTrigger value="accepted">
                        Accepted (
                        {
                          invite.joinRequests.filter(
                            (r) => r.status === "ACCEPTED"
                          ).length
                        }
                        )
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="requests">
                      <div className="space-y-4">
                        {invite.joinRequests.filter(
                          (r) => r.status === "PENDING"
                        ).length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">
                            No pending requests
                          </p>
                        ) : (
                          invite.joinRequests
                            .filter((r) => r.status === "PENDING")
                            .map((request) => (
                              <div
                                key={request.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                    <User className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {request.joinerName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {request.playersCount} player
                                      {request.playersCount > 1 ? "s" : ""}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {request.contactDetails}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleRequestAction(request.id, "accept")
                                    }
                                    disabled={processingRequest === request.id}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleRequestAction(request.id, "reject")
                                    }
                                    disabled={processingRequest === request.id}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="accepted">
                      <div className="space-y-4">
                        {invite.joinRequests.filter(
                          (r) => r.status === "ACCEPTED"
                        ).length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">
                            No accepted players yet
                          </p>
                        ) : (
                          invite.joinRequests
                            .filter((r) => r.status === "ACCEPTED")
                            .map((request) => (
                              <div
                                key={request.id}
                                className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-900/10"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {request.joinerName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {request.playersCount} player
                                      {request.playersCount > 1 ? "s" : ""}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {request.contactDetails}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="default">
                                  <Check className="h-3 w-3 mr-1" />
                                  Accepted
                                </Badge>
                              </div>
                            ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
