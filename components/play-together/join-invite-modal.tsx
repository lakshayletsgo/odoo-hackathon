"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const joinInviteSchema = z.object({
  joinerName: z.string().min(1, "Name is required"),
  contactDetails: z.string().min(1, "Contact details are required"),
  playersCount: z.string().min(1, "Number of players is required"),
});

type JoinInviteFormData = z.infer<typeof joinInviteSchema>;

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

interface JoinInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invite: Invite;
  onSuccess: () => void;
}

export function JoinInviteModal({
  open,
  onOpenChange,
  invite,
  onSuccess,
}: JoinInviteModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<JoinInviteFormData>({
    resolver: zodResolver(joinInviteSchema),
    defaultValues: {
      joinerName: "",
      contactDetails: "",
      playersCount: "1",
    },
  });

  const onSubmit = async (data: JoinInviteFormData) => {
    try {
      setLoading(true);

      const submitData = {
        ...data,
        playersCount: parseInt(data.playersCount, 10),
      };

      // Validate players count doesn't exceed available spots
      if (submitData.playersCount > invite.playersLeft) {
        toast.error(`Only ${invite.playersLeft} spots available`);
        return;
      }

      await axios.post(`/api/invites/${invite.id}/join`, submitData);

      toast.success("Join request sent successfully!");
      form.reset();
      onOpenChange(false);
      onSuccess();
      
      // Refresh the page to update all booking data
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Error joining invite:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to join invite";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Join Activity</DialogTitle>
          <DialogDescription>
            Send a request to join this sports activity.
          </DialogDescription>
        </DialogHeader>

        {/* Invite Details */}
        <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{invite.name}</h3>
            <Badge variant="secondary">
              {invite.sport
                .replace(/_/g, " ")
                .split(" ")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" ")}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{invite.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(invite.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatTime(invite.time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{invite.playersLeft} spots available</span>
            </div>
          </div>

          <div className="text-sm">
            <span className="font-medium">Host:</span> {invite.creator.name}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="joinerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Phone number, email, or other contact info"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="playersCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of People (including you)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={invite.playersLeft.toString()}
                      placeholder="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-xs text-muted-foreground">
              Note: Your request will be sent to the host for approval. You'll
              be notified once they respond.
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
