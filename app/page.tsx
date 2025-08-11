"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  MapPin,
  Play,
  Search,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const sports = [
  { name: "Football", icon: "⚽", color: "bg-green-500" },
  { name: "Badminton", icon: "🏸", color: "bg-yellow-500" },
  { name: "Basketball", icon: "🏀", color: "bg-orange-500" },
  { name: "Tennis", icon: "🎾", color: "bg-green-600" },
  { name: "Volleyball", icon: "🏐", color: "bg-blue-500" },
];

const featuredVenues = [
  {
    id: 1,
    name: "Elite  Complex",
    location: "Downtown",
    rating: 4.8,
    price: 25,
    image: "/modern-sports-complex.png",
    sports: ["Tennis", "Basketball"],
  },
  {
    id: 2,
    name: "City Recreation Center",
    location: "Midtown",
    rating: 4.6,
    price: 20,
    image: "/recreation-center-courts.png",
    sports: ["Football", "Volleyball"],
  },
  {
    id: 3,
    name: "Premier Courts",
    location: "Uptown",
    rating: 4.9,
    price: 35,
    image: "/premium-tennis-courts.png",
    sports: ["Tennis", "Badminton"],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-700">
      {/* Hero Navigation Overlay - for home page specific styling */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center space-x-8 text-white ml-auto">
            <Link
              href="/search"
              className="hover:text-yellow-300 transition-colors"
            >
              Find Courts
            </Link>
            <Link
              href="/how-it-works"
              className="hover:text-yellow-300 transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="/about"
              className="hover:text-yellow-300 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="hover:text-yellow-300 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute top-20 right-20 w-32 h-32 opacity-20"
          >
            <div className="w-full h-full rounded-full border-4 border-white"></div>
          </motion.div>
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            className="absolute bottom-40 left-20 w-16 h-16 bg-yellow-400 rounded-full opacity-30"
          ></motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white space-y-8"
          >
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl lg:text-7xl font-bold leading-tight"
              >
                Game On
                <br />
                <span className="text-yellow-300">Anytime</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl lg:text-2xl text-cyan-100 max-w-lg"
              >
                Anytime, anywhere—get ready to play! Book your favorite sports
                courts instantly and join the game.
              </motion.p>
            </div>

            {/* Sports Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-3"
            >
              {sports.map((sport, index) => (
                <Badge
                  key={sport.name}
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm"
                >
                  {sport.icon} {sport.name}
                </Badge>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/search">
                <Button
                  size="lg"
                  className="bg-yellow-400 text-black hover:bg-yellow-500 px-8 py-4 text-lg"
                >
                  Book a Court
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link className="cursor-pointer" href={`/play-together`}>
                <Button
                  size="lg"
                  variant="outline"
                  className=" border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg bg-transparent"
                >
                  Play Together
                  <Users className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative">
              <Image
                src="homeImage.jpg"
                alt="Sports equipment and courts"
                width={600}
                height={600}
                className="w-full h-auto"
              />
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="absolute top-10 right-10 bg-yellow-400 p-3 rounded-full shadow-lg"
              >
                <Trophy className="h-6 w-6 text-black" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
                className="absolute bottom-20 left-10 bg-white p-3 rounded-full shadow-lg"
              >
                <Play className="h-6 w-6 text-cyan-600" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <h2 className="text-4xl font-bold text-gray-900">
              Find Your Game Anytime
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover courts in your area. Whether you're into tennis,
              basketball, badminton, or any other sport, we've got you covered.
            </p>

            {/* Search Bar */}
            <div className="bg-gray-50 p-8 rounded-2xl shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Enter location..."
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search sports..."
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <Button
                  size="lg"
                  className="bg-cyan-600 hover:bg-cyan-700 px-8 h-12"
                >
                  Search Courts
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Venues */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900">
              Explore Popular Sports Venues
            </h2>
            <p className="text-xl text-gray-600">
              From football fields to badminton courts, find the most
              sought-after locations in your area.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVenues.map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative">
                    <Image
                      src={venue.image || "/placeholder.svg"}
                      alt={venue.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">
                        {venue.rating}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {venue.name}
                        </h3>
                        <p className="text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {venue.location}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
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
                        <div className="text-right">
                          <p className="text-2xl font-bold text-cyan-600">
                            ${venue.price}
                          </p>
                          <p className="text-sm text-gray-500">per hour</p>
                        </div>
                      </div>
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                        View Courts
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/search">
              <Button
                size="lg"
                variant="outline"
                className="border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white bg-transparent"
              >
                View All Venues
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900">
              Ready to play? Start exploring now!
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Be part of a growing sports community! Connect with players, join
              exciting sessions, or create your own league. Whether you're a
              beginner or a seasoned competitor, there's a place for you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "Find Courts",
                description:
                  "Search for courts by location, sport, and availability",
              },
              {
                icon: Clock,
                title: "Book Instantly",
                description:
                  "Reserve your preferred time slot with just a few clicks",
              },
              {
                icon: Users,
                title: "Play Together",
                description: "Connect with other players and enjoy your game",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto">
                  <step.icon className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Ready to Play? Book Your Spot Now!
            </h2>
            <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
              Don't wait to secure your venue today at night! It's time to make
              your sports dreams come true. Book now and get the perfect match
              for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <Button
                  size="lg"
                  className="bg-yellow-400 text-black hover:bg-yellow-500 px-8 py-4 text-lg"
                >
                  Book a Court
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/owner/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-cyan-600 px-8 py-4 text-lg bg-transparent"
                >
                  List Your Venue
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">QuickCourt</h3>
              <p className="text-gray-400">
                Your go-to platform for booking sports courts instantly.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Quick Links</h4>
              <div className="space-y-2">
                <Link
                  href="/search"
                  className="block text-gray-400 hover:text-white"
                >
                  Find Courts
                </Link>
                <Link
                  href="/how-it-works"
                  className="block text-gray-400 hover:text-white"
                >
                  How It Works
                </Link>
                <Link
                  href="/pricing"
                  className="block text-gray-400 hover:text-white"
                >
                  Pricing
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Support</h4>
              <div className="space-y-2">
                <Link
                  href="/help"
                  className="block text-gray-400 hover:text-white"
                >
                  Help Center
                </Link>
                <Link
                  href="/contact"
                  className="block text-gray-400 hover:text-white"
                >
                  Contact Us
                </Link>
                <Link
                  href="/terms"
                  className="block text-gray-400 hover:text-white"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Connect</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-gray-400 hover:text-white">
                  Twitter
                </Link>
                <Link href="#" className="block text-gray-400 hover:text-white">
                  Facebook
                </Link>
                <Link href="#" className="block text-gray-400 hover:text-white">
                  Instagram
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 QuickCourt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
