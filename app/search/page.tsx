"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchResultsSkeleton } from "@/components/ui/loading-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SPORTS_WITH_ALL } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Clock,
  Filter,
  Grid,
  List,
  MapPin,
  Search,
  Star,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  rating: number;
  totalRatings: number;
  priceRange: [number, number];
  image: string;
  sports: string[];
  amenities: string[];
  distance: number;
  courts: number;
}
const sortOptions = [
  { value: "distance", label: "Distance (km)" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState("distance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from URL parameters
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const urlLocation = searchParams.get("location");
    const urlSport = searchParams.get("sport");

    if (urlSearch) setSearchQuery(urlSearch);
    if (urlLocation) setLocation(urlLocation);
    if (urlSport) setSelectedSport(urlSport);
  }, [searchParams]);

  // Fetch venues from database
  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedSport !== "All Sports") params.set("sport", selectedSport);
      if (location) params.set("city", location);
      if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
      if (priceRange[1] < 100) params.set("maxPrice", priceRange[1].toString());

      const response = await fetch(`/api/venues?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // Transform the data to match our interface
        const transformedVenues = data.map((venue: any) => ({
          id: venue.id,
          name: venue.name,
          address: venue.address,
          city: venue.city,
          rating: venue.rating || 0,
          totalRatings: venue.reviewCount || 0,
          priceRange: venue.pricePerHour
            ? ([venue.pricePerHour, venue.pricePerHour] as [number, number])
            : ([0, 0] as [number, number]),
          image: venue.images?.[0] || "/placeholder.svg",
          sports:
            venue.courts?.map((court: any) => court.sport).filter(Boolean) ||
            [],
          amenities: venue.amenities || [],
          distance: 0, // Distance will be calculated properly when location services are implemented
          courts: venue.courts?.length || 0,
        }));
        setVenues(transformedVenues);
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter venues based on search criteria
  useEffect(() => {
    fetchVenues();
  }, [selectedSport, location, priceRange]);

  const filteredVenues = venues.filter((venue: Venue) => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const matchesSearch =
      normalizedSearch === "" ||
      venue.name.toLowerCase().includes(normalizedSearch) ||
      venue.sports.some((sport: string) =>
        sport.toLowerCase().includes(normalizedSearch)
      );

    const matchesLocation =
      location.trim() === "" ||
      venue.city.toLowerCase().includes(location.trim().toLowerCase()) ||
      venue.address.toLowerCase().includes(location.trim().toLowerCase());

    return matchesSearch && matchesLocation;
  });

  // Sort venues
  const sortedVenues = [...filteredVenues].sort((a: Venue, b: Venue) => {
    switch (sortBy) {
      case "distance":
        return a.distance - b.distance;
      case "price-low":
        return a.priceRange[0] - b.priceRange[0];
      case "price-high":
        return b.priceRange[1] - a.priceRange[1];
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "popular":
        return (b.totalRatings || 0) - (a.totalRatings || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Search Bar */}
      <div className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search courts, sports, or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Enter location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="h-12 px-6"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-6 bg-muted rounded-lg space-y-6"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sport</label>
                  <Select
                    value={selectedSport}
                    onValueChange={setSelectedSport}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORTS_WITH_ALL.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Price Range: {formatCurrency(priceRange[0])} -{" "}
                    {formatCurrency(priceRange[1])}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white-900">
              {sortedVenues.length}{" "}
              {sortedVenues.length === 1 ? "venue" : "venues"} found
            </h1>
            <p className="text-white-600">
              {location && `in ${location}`}{" "}
              {selectedSport !== "All Sports" && `for ${selectedSport}`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Venue Grid/List */}
        {isLoading ? (
          <SearchResultsSkeleton />
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {sortedVenues.map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
                    viewMode === "list" ? "flex" : ""
                  }`}
                >
                  <div
                    className={viewMode === "list" ? "w-64 flex-shrink-0" : ""}
                  >
                    <Image
                      src={venue.image || "/placeholder.svg"}
                      alt={venue.name}
                      width={300}
                      height={200}
                      className={`object-cover ${
                        viewMode === "list" ? "w-full h-full" : "w-full h-48"
                      }`}
                    />
                  </div>
                  <CardContent
                    className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white-900">
                            {venue.name}
                          </h3>
                          <p className="text-gray-600 flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {venue.address}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            {venue.rating && venue.rating > 0 ? (
                              <>
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="font-medium">
                                  {venue.rating}
                                </span>
                                <span className="text-gray-500 text-sm">
                                  ({venue.totalRatings})
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                No ratings yet
                              </span>
                            )}
                          </div>
                          {venue.distance > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              {venue.distance.toFixed(2)} km away
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {venue.sports.map((sport) => (
                          <Badge
                            key={sport}
                            variant="secondary"
                            className="text-xs"
                          >
                            {sport}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {venue.courts > 0 && (
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {venue.courts}{" "}
                              {venue.courts === 1 ? "court" : "courts"}
                            </span>
                          )}
                          {venue.priceRange[0] > 0 && (
                            <span className="flex items-center">
                              <Tag className="h-4 w-4 mr-1" />
                              {formatCurrency(venue.priceRange[0])}/hr
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Link href={`/venues/${venue.id}`} className="flex-1">
                          <Button className="w-full bg-primary text-primary-foreground hover:opacity-90">
                            View Courts
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {sortedVenues.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No venues found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or location
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setLocation("");
                setSelectedSport("All Sports");
                setPriceRange([0, 100]);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
