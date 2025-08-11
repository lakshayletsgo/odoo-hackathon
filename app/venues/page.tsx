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
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { MapPin, Search, Star, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  capacity: number;
  pricePerHour: number;
  sport: string;
  amenities: string[];
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await fetch("/api/venues");
      if (response.ok) {
        const data = await response.json();
        setVenues(data);
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport =
      selectedSport === "all" || venue.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const sports = [
    "all",
    ...Array.from(new Set(venues.map((venue) => venue.sport))),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Discover Amazing Venues
          </h1>
          <p className="text-xl text-gray-600">
            Find the perfect space for your next sporting event
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search venues, cities, or addresses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sports.map((sport) => (
                <option key={sport} value={sport}>
                  {sport === "all"
                    ? "All Sports"
                    : sport.charAt(0).toUpperCase() + sport.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Found {filteredVenues.length} venue
            {filteredVenues.length !== 1 ? "s" : ""}
          </div>
        </motion.div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue, index) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-r from-blue-400 to-purple-500">
                  {venue.imageUrl ? (
                    <img
                      src={venue.imageUrl}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <Users className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">{venue.sport}</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={venue.isAvailable ? "default" : "secondary"}
                    >
                      {venue.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-bold group-hover:text-blue-600 transition-colors">
                      {venue.name}
                    </CardTitle>
                    {venue.rating && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{venue.rating}</span>
                        {venue.reviewCount && (
                          <span className="ml-1">({venue.reviewCount})</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>
                      {venue.city}, {venue.state}
                    </span>
                  </div>
                  <CardDescription className="text-sm">
                    {venue.description ||
                      `Professional ${venue.sport} facility`}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">
                        {venue.capacity} people
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-bold text-green-600">
                        ${venue.pricePerHour}/hour
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Sport:</span>
                      <Badge variant="outline">{venue.sport}</Badge>
                    </div>

                    {/* Amenities */}
                    {venue.amenities.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {venue.amenities.slice(0, 3).map((amenity, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {amenity}
                            </Badge>
                          ))}
                          {venue.amenities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{venue.amenities.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Button className="w-full" disabled={!venue.isAvailable}>
                      {venue.isAvailable ? "Book Now" : "Unavailable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredVenues.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No venues found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or check back later for new
              venues.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
