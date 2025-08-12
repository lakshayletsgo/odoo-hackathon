"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import {
  Calendar,
  Check,
  Clock,
  MapPin,
  Phone,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface JoinRequest {
  id: string;
  joinerName: string;
  contactDetails: string;
  playersCount: number;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  invite: {
    name: string;
    venue: string;
    date: string;
    time: string;
    sport: string;
  };
}

interface ManageRequestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteId: string;
  onSuccess: () => void;
}

export function ManageRequestsModal({
  open,
  onOpenChange,
  inviteId,
  onSuccess,
}: ManageRequestsModalProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (open && inviteId) {
      fetchRequests();
    }
  }, [open, inviteId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/invites/${inviteId}/requests`);
      setRequests(response.data.requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await axios.patch(`/api/requests/${requestId}/accept`);
      toast.success("Request accepted successfully!");
      await fetchRequests();
      onSuccess();
      
      // Refresh parent page data
      if (typeof window !== 'undefined') {
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error: any) {
      console.error("Error accepting request:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to accept request";
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await axios.patch(`/api/requests/${requestId}/decline`);
      toast.success("Request declined successfully!");
      await fetchRequests();
      onSuccess();
      
      // Refresh parent page data
      if (typeof window !== 'undefined') {
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error: any) {
      console.error("Error declining request:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to decline request";
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "default";
      case "DECLINED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const pendingRequests = requests.filter((req) => req.status === "PENDING");
  const processedRequests = requests.filter((req) => req.status !== "PENDING");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Join Requests</DialogTitle>
          <DialogDescription>
            Review and respond to requests to join your activity.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6">
              {/* Activity Details */}
              {requests.length > 0 && requests[0].invite && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {requests[0].invite.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{requests[0].invite.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(requests[0].invite.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatTime(requests[0].invite.time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {requests[0].invite.sport.charAt(0) +
                            requests[0].invite.sport.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">
                    Pending Requests ({pendingRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <Card key={request.id} className="border-orange-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {request.joinerName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{request.playersCount} player(s)</span>
                              </div>
                            </div>
                            <Badge variant={getStatusVariant(request.status)}>
                              {request.status.toLowerCase()}
                            </Badge>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-start gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span>{request.contactDetails}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Requested {formatDateTime(request.createdAt)}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDecline(request.id)}
                                disabled={actionLoading === request.id}
                                className="gap-1"
                              >
                                <X className="h-3 w-3" />
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAccept(request.id)}
                                disabled={actionLoading === request.id}
                                className="gap-1"
                              >
                                <Check className="h-3 w-3" />
                                Accept
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Processed Requests */}
              {processedRequests.length > 0 && (
                <div>
                  {pendingRequests.length > 0 && <Separator />}
                  <h3 className="font-medium mb-3 mt-6">
                    Processed Requests ({processedRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {processedRequests.map((request) => (
                      <Card key={request.id} className="opacity-75">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {request.joinerName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{request.playersCount} player(s)</span>
                              </div>
                            </div>
                            <Badge variant={getStatusVariant(request.status)}>
                              {request.status.toLowerCase()}
                            </Badge>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-start gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span>{request.contactDetails}</span>
                            </div>
                          </div>

                          <span className="text-xs text-muted-foreground">
                            Requested {formatDateTime(request.createdAt)}
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {requests.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No join requests yet.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
