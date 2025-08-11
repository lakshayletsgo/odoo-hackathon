import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { BookingActions } from "@/components/venue/booking-actions";
import { prisma } from "@/lib/prisma";
import { Clock, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getVenue(id: string) {
  const venue = await prisma.venue.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, name: true, email: true, isVerified: true },
      },
      courts: {
        where: { isActive: true },
        include: { availability: true },
      },
    },
  });

  if (venue && venue.isActive && venue.owner.isVerified) {
    let images: string[] = [];
    let amenities: string[] = [];
    
    console.log("Raw venue.images from DB:", venue.images);
    console.log("Raw venue.amenities from DB:", venue.amenities);
    
    try {
      if (venue.images) {
        // Check if it's already a JSON array or a single URL string
        if (venue.images.startsWith('[')) {
          // It's a JSON array
          images = JSON.parse(venue.images) as string[];
        } else if (venue.images.startsWith('http')) {
          // It's a single URL string
          images = [venue.images];
        } else {
          // Try to parse as JSON, fallback to treating as single string
          try {
            images = JSON.parse(venue.images) as string[];
          } catch {
            images = [venue.images];
          }
        }
      } else {
        images = [];
      }
    } catch (error) {
      console.error("Error parsing images:", error, "Raw value:", venue.images);
      images = [];
    }
    try {
      if (venue.amenities) {
        // Check if it's already a JSON array or a comma-separated string
        if (venue.amenities.startsWith('[')) {
          // It's a JSON array
          amenities = JSON.parse(venue.amenities) as string[];
        } else {
          // It's likely a comma-separated string
          amenities = venue.amenities.split(',').map(a => a.trim()).filter(Boolean);
        }
      } else {
        amenities = [];
      }
    } catch (error) {
      console.error("Error parsing amenities:", error, "Raw value:", venue.amenities);
      amenities = [];
    }

    console.log("Parsed images:", images);
    console.log("Parsed amenities:", amenities);

    return { ...venue, images, amenities };
  }

  return null;
}

// Fix the async params issue
export default async function VenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venue = await getVenue(id);
  if (!venue) return notFound();

  console.log("Raw venue.images:", venue.images);
  console.log("Parsed venue.images:", venue.images);
  const primaryImage = venue.images && venue.images.length > 0 ? venue.images[0] : "/placeholder.svg";
  console.log("Primary image:", primaryImage);

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  function HoursPopover({
    court,
  }: {
    court: {
      name: string;
      sport: string;
      pricePerHour: number;
      availability?: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isActive: boolean;
      }[];
    };
  }) {
    const grouped: Record<number, { start: string; end: string }[]> = {};
    for (const a of court.availability || []) {
      if (!a.isActive) continue;
      if (!grouped[a.dayOfWeek]) grouped[a.dayOfWeek] = [];
      grouped[a.dayOfWeek].push({ start: a.startTime, end: a.endTime });
    }
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            Pricing & Hours
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold">{court.name}</h4>
              <p className="text-sm text-muted-foreground">
                {court.sport} • ₹{court.pricePerHour}/hour
              </p>
            </div>
            <Separator />
            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {dayNames.map((d, idx) => {
                const slots = grouped[idx] || [];
                return (
                  <div
                    key={idx}
                    className="flex items-start justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{d}</span>
                    <span className="text-right">
                      {slots.length === 0
                        ? "Closed"
                        : slots.map((s) => `${s.start} - ${s.end}`).join(", ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{venue.name}</h1>
            <p className="text-muted-foreground flex items-center">
              <MapPin className="h-4 w-4 mr-1" /> {venue.address}, {venue.city}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {venue.rating && venue.rating > 0 ? (
                <>
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">
                    {Number(venue.rating).toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({venue.totalRating || 0} reviews)
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground text-sm">
                  No ratings yet
                </span>
              )}
            </div>
            <BookingActions
              venueId={venue.id}
              courts={venue.courts.map((c: any) => ({
                id: c.id,
                name: c.name,
                pricePerHour: c.pricePerHour,
              }))}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Media */}
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <Image
                  src={primaryImage}
                  alt={venue.name}
                  fill
                  className="object-cover"
                />
              </div>
            </CardContent>
          </Card>

          {/* Side info */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Operating Hours</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Monday - Friday:
                    </span>
                    <span>6:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday:</span>
                    <span>8:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday:</span>
                    <span>8:00 AM - 9:00 PM</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  * Hours may vary by court. Check individual court schedules.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Address</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {venue.address}, {venue.city}, {venue.state} {venue.zipCode}
                </p>
                {/* Placeholder for map */}
                <div className="mt-2 h-36 rounded-md bg-muted" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sports / Courts */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Courts Available</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {venue.courts.map((court: any) => (
              <Card key={court.id} className="">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{court.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {court.sport}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ₹{court.pricePerHour}
                      </p>
                      <p className="text-xs text-muted-foreground">per hour</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        Slot: {court.slotDuration}m
                      </Badge>
                      <Badge variant="outline">
                        Active: {court.isActive ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <HoursPopover court={court} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Amenities */}
        {venue.amenities.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {venue.amenities.map((a: string) => (
                <Badge key={a} variant="secondary">
                  {a}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* About */}
        {venue.description && (
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">About Venue</h2>
            <p className="text-muted-foreground">{venue.description}</p>
          </section>
        )}

        {/* Reviews section - will be implemented when review system is ready */}
        <section className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold">Player Reviews & Ratings</h2>
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Reviews Yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to review this venue after your visit!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
