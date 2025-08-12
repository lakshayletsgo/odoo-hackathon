"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { CalendarDays, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  venue: z.string().min(1, "Venue is required"),
  sport: z.string().min(1, "Sport is required"),
  date: z.string().min(1, "Date is required"),
  time: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  playersRequired: z.string().min(1, "Number of players is required"),
  contactDetails: z.string().min(1, "Contact details are required"),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

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

export function CreateEventTab() {
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: "",
      venue: "",
      sport: "",
      date: "",
      time: "",
      playersRequired: "",
      contactDetails: "",
    },
  });

  const onSubmit = async (data: CreateEventFormData) => {
    try {
      setLoading(true);

      const submitData = {
        ...data,
        date: new Date(data.date).toISOString(),
        playersRequired: parseInt(data.playersRequired, 10),
      };

      await axios.post("/api/invites", submitData);

      toast.success("Event created successfully!");
      form.reset();
    } catch (error: any) {
      console.error("Error creating event:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create event";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CalendarDays className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Event</h2>
        <p className="text-gray-600">
          Organize a sports activity and find players to join you
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Event Details
          </CardTitle>
          <CardDescription>
            Fill in the details for your sports event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
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
                      <FormLabel>Venue</FormLabel>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <FormField
                control={form.control}
                name="playersRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Players Needed</FormLabel>
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

              <FormField
                control={form.control}
                name="contactDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Phone number, email, or other contact info..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? "Creating Event..." : "Create Event"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
