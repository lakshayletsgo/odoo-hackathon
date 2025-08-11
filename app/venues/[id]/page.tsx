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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Mail,
  MapPin,
  Phone,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function VenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [venueImages, setVenueImages] = useState<string[]>([]);
  const [venueAmenities, setVenueAmenities] = useState<string[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingDuration, setBookingDuration] = useState("1");
  const [isBooking, setIsBooking] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchVenue() {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/venues/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("Venue not found");
        }
        const venueData = await response.json();
        setVenue(venueData);

        // Process images
        let processedImages: string[] = [];
        if (venueData.images) {
          if (typeof venueData.images === "string") {
            try {
              processedImages = JSON.parse(venueData.images);
            } catch (e) {
              processedImages = venueData.images
                .split(",")
                .map((img: string) => img.trim())
                .filter((img: string) => img);
            }
          } else if (Array.isArray(venueData.images)) {
            processedImages = venueData.images;
          }
        }
        setVenueImages(processedImages);

        // Process amenities
        let processedAmenities: string[] = [];
        if (venueData.amenities) {
          if (typeof venueData.amenities === "string") {
            try {
              processedAmenities = JSON.parse(venueData.amenities);
            } catch (e) {
              processedAmenities = venueData.amenities
                .split(",")
                .map((a: string) => a.trim())
                .filter((a: string) => a);
            }
          } else if (Array.isArray(venueData.amenities)) {
            processedAmenities = venueData.amenities;
          }
        }
        setVenueAmenities(processedAmenities);
      } catch (error) {
        console.error("Error fetching venue:", error);
        setVenue(null);
      } finally {
        setLoading(false);
      }
    }

    fetchVenue();
  }, [params]);

  const handleBooking = async (court: any) => {
    setSelectedCourt(court);
    setIsDialogOpen(true);
  };

  const submitBooking = async () => {
    if (!selectedCourt || !bookingDate || !bookingTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsBooking(true);
    try {
      // Calculate end time based on start time and duration
      const startDateTime = new Date(`${bookingDate}T${bookingTime}`);
      const endDateTime = new Date(
        startDateTime.getTime() + parseInt(bookingDuration) * 60 * 60 * 1000
      );
      const endTime = endDateTime.toTimeString().slice(0, 5); // Format as HH:MM

      const totalAmount =
        selectedCourt.pricePerHour * parseInt(bookingDuration);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courtId: selectedCourt.id,
          date: bookingDate,
          startTime: bookingTime,
          endTime: endTime,
          totalAmount: totalAmount,
        }),
      });

      if (response.ok) {
        toast.success("Booking confirmed!");
        setIsDialogOpen(false);
        setBookingDate("");
        setBookingTime("");
        setBookingDuration("1");
      } else {
        const error = await response.text();
        toast.error(error || "Booking failed");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    notFound();
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Image Gallery */}
        <div className="mb-8">
          {venueImages.length > 0 ? (
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative h-96 w-full rounded-lg overflow-hidden">
                <Image
                  src={venueImages[0]}
                  alt={venue.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Image Gallery - Horizontal Scroll */}
              {venueImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {venueImages.map((image: string, index: number) => (
                    <div
                      key={index}
                      className="relative flex-shrink-0 h-24 w-32 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        window.open(image, "_blank");
                      }}
                    >
                      <Image
                        src={image}
                        alt={`${venue.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="relative h-96 w-full rounded-lg overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
              <div className="text-center text-white">
                <Users className="w-16 h-16 mx-auto mb-4" />
                <p className="text-xl font-semibold">No images available</p>
                <p className="text-sm opacity-90">
                  Venue images will appear here
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Venue Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {venue.name}
              </h1>
              <div className="flex items-center text-muted-foreground mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                <span>
                  {venue.address}, {venue.city}, {venue.state} {venue.zipCode}
                </span>
              </div>
              {venue.description && (
                <p className="text-muted-foreground">{venue.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.5</span>
                <span className="text-muted-foreground">(23 reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Courts and Pricing */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Available Courts</h2>
            <div className="space-y-4">
              {venue.courts?.map((court: any) => (
                <Card key={court.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{court.name}</span>
                      <Badge>{court.sport}</Badge>
                    </CardTitle>
                    {court.description && (
                      <CardDescription>{court.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Capacity: {court.capacity} people
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{court.pricePerHour}/hour
                        </p>
                      </div>
                      <Button onClick={() => handleBooking(court)}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {venue.contactPhone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                    <span>{venue.contactPhone}</span>
                  </div>
                )}
                {venue.contactEmail && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                    <span>{venue.contactEmail}</span>
                  </div>
                )}
                {venue.operatingHours && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
                    <span>{venue.operatingHours}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Amenities */}
            {venueAmenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {venueAmenities.map((amenity: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book {selectedCourt?.name}</DialogTitle>
            <DialogDescription>
              Choose your preferred date and time for {selectedCourt?.sport} at{" "}
              {venue?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="col-span-3"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <select
                id="duration"
                value={bookingDuration}
                onChange={(e) => setBookingDuration(e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
              </select>
            </div>
            {selectedCourt && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Total</Label>
                <div className="col-span-3 font-bold text-green-600">
                  ₹
                  {(
                    selectedCourt.pricePerHour * parseInt(bookingDuration)
                  ).toFixed(2)}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitBooking} disabled={isBooking}>
              {isBooking ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
