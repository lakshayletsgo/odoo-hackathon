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
    try {
      images = venue.images ? (JSON.parse(venue.images) as string[]) : [];
    } catch {}
    try {
      amenities = venue.amenities
        ? (JSON.parse(venue.amenities) as string[])
        : [];
    } catch {}

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

  const primaryImage = venue.images[0] || "/placeholder.jpg";

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
                {court.sport} • ${court.pricePerHour}/hour
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
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="font-semibold">
                {Number(venue.rating || 0).toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({venue.totalRating || 0})
              </span>
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
                        ${court.pricePerHour}
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

        {/* Reviews placeholder; can be wired to real data later */}
        <section className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold">Player Reviews & Ratings</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">User {i}</p>
                      <p className="text-sm text-muted-foreground">
                        Nice court, well maintained
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      Recently
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-4 w-4 ${
                          idx < 4
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
