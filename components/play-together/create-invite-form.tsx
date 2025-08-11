"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createInviteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  venue: z.string().min(1, "Venue is required"),
  date: z.string().min(1, "Date is required"),
  time: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  sport: z.string().min(1, "Sport is required"),
  playersRequired: z.string().min(1, "Number of players is required"),
  contactDetails: z.string().min(1, "Contact details are required"),
});

type CreateInviteFormData = z.infer<typeof createInviteSchema>;

interface CreateInviteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const sports = [
  { value: "SWIMMING", label: "Swimming" },
  { value: "TENNIS", label: "Tennis" },
  { value: "CRICKET", label: "Cricket" },
  { value: "FOOTBALL", label: "Football" },
  { value: "VOLLEYBALL", label: "Volleyball" },
  { value: "BASKETBALL", label: "Basketball" },
  { value: "PICKLEBALL", label: "Pickleball" },
  { value: "BADMINTON", label: "Badminton" },
  { value: "TABLE_TENNIS", label: "Table Tennis" },
];

export function CreateInviteForm({
  open,
  onOpenChange,
  onSuccess,
}: CreateInviteFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateInviteFormData>({
    resolver: zodResolver(createInviteSchema),
    defaultValues: {
      name: "",
      venue: "",
      date: "",
      time: "",
      sport: "",
      playersRequired: "",
      contactDetails: "",
    },
  });

  const onSubmit = async (data: CreateInviteFormData) => {
    try {
      setLoading(true);

      // Convert date to ISO string and playersRequired to number
      const submitData = {
        ...data,
        date: new Date(data.date).toISOString(),
        playersRequired: parseInt(data.playersRequired, 10),
      };

      await axios.post("/api/invites", submitData);

      toast.success("Invite created successfully!");
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating invite:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create invite";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Invite</DialogTitle>
          <DialogDescription>
            Create an invite to find players for your sports activity.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Weekend Tennis Match"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue/Place</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Central Park Tennis Court"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" min={today} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport.value} value={sport.value}>
                            {sport.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="playersRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Players Needed</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        placeholder="e.g., 3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {loading ? "Creating..." : "Create Invite"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
