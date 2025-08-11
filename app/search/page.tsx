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
  DollarSign,
  Filter,
  Grid,
  List,
  MapPin,
  Search,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const mockVenues = [
  {
    id: 1,
    name: "Elite Sports Complex",
    address: "123 Sports Ave, Downtown",
    city: "New York",
    rating: 4.8,
    totalRatings: 124,
    priceRange: [25, 45],
    image: "/modern-sports-complex.png",
    sports: ["Tennis", "Basketball", "Badminton"],
    amenities: ["Parking", "Locker Rooms", "Cafe"],
    distance: 0.8,
    courts: 8,
  },
  {
    id: 2,
    name: "City Recreation Center",
    address: "456 Recreation Blvd, Midtown",
    city: "New York",
    rating: 4.6,
    totalRatings: 89,
    priceRange: [20, 35],
    image: "/recreation-center-courts.png",
    sports: ["Football", "Volleyball", "Basketball"],
    amenities: ["Parking", "Showers", "Equipment Rental"],
    distance: 1.2,
    courts: 12,
  },
  {
    id: 3,
    name: "Premier Tennis Club",
    address: "789 Tennis Way, Uptown",
    city: "New York",
    rating: 4.9,
    totalRatings: 156,
    priceRange: [35, 60],
    image: "/premium-tennis-courts.png",
    sports: ["Tennis", "Badminton"],
    amenities: ["Pro Shop", "Coaching", "Restaurant"],
    distance: 2.1,
    courts: 6,
  },
  {
    id: 4,
    name: "Community Sports Hub",
    address: "321 Community St, Eastside",
    city: "New York",
    rating: 4.4,
    totalRatings: 67,
    priceRange: [15, 30],
    image: "/community-sports-center.png",
    sports: ["Basketball", "Volleyball", "Badminton"],
    amenities: ["Parking", "Locker Rooms"],
    distance: 1.8,
    courts: 10,
  },
];
const sortOptions = [
  { value: "distance", label: "Distance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState("distance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [venues, setVenues] = useState(mockVenues);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Filter and sort venues based on current filters
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const normalizedLocation = location.trim().toLowerCase();

    const filteredVenues = mockVenues.filter((venue) => {
      const matchesSearch =
        normalizedSearch === "" ||
        venue.name.toLowerCase().includes(normalizedSearch) ||
        venue.sports.some((sport) => sport.toLowerCase().includes(normalizedSearch));

      const matchesLocation =
        normalizedLocation === "" ||
        venue.city.toLowerCase().includes(normalizedLocation) ||
        venue.address.toLowerCase().includes(normalizedLocation);
      const matchesSport =
        selectedSport === "All Sports" || venue.sports.includes(selectedSport);
      const matchesPrice =
        venue.priceRange[0] >= priceRange[0] &&
        venue.priceRange[1] <= priceRange[1];

      return matchesSearch && matchesLocation && matchesSport && matchesPrice;
    });

    // Sort venues
    filteredVenues.sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return a.distance - b.distance;
        case "price-low":
          return a.priceRange[0] - b.priceRange[0];
        case "price-high":
          return b.priceRange[1] - a.priceRange[1];
        case "rating":
          return b.rating - a.rating;
        case "popular":
          return b.totalRatings - a.totalRatings;
        default:
          return 0;
      }
    });

    setVenues(filteredVenues);
  }, [searchQuery, location, selectedSport, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              QuickCourt
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-primary text-primary-foreground hover:opacity-90">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search courts, sports, or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
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
              className="mt-6 p-6 bg-gray-50 rounded-lg space-y-6"
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
            <h1 className="text-2xl font-bold text-gray-900">
              {venues.length} courts found
            </h1>
            <p className="text-gray-600">
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
            {venues.map((venue, index) => (
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
                          <h3 className="text-xl font-semibold text-gray-900">
                            {venue.name}
                          </h3>
                          <p className="text-gray-600 flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {venue.address}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{venue.rating}</span>
                            <span className="text-gray-500 text-sm">
                              ({venue.totalRatings})
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {venue.distance} miles away
                          </p>
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
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {venue.courts} courts
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatCurrency(venue.priceRange[0])}-
                            {formatCurrency(venue.priceRange[1])}/hr
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Link href={`/venues/${venue.id}`} className="flex-1">
                          <Button className="w-full bg-primary text-primary-foreground hover:opacity-90">
                            View Courts
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          Save
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {venues.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No courts found
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
