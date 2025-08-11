"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { MapPin, Play, Search, Trophy, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const sports = [
  { name: "Tennis", icon: "🎾", color: "bg-green-500" },
  { name: "Basketball", icon: "🏀", color: "bg-orange-500" },
  { name: "Football", icon: "🏈", color: "bg-brown-500" },
  { name: "Soccer", icon: "⚽", color: "bg-blue-500" },
  { name: "Badminton", icon: "🏸", color: "bg-yellow-500" },
  { name: "Volleyball", icon: "🏐", color: "bg-red-500" },
  { name: "Cricket", icon: "🏏", color: "bg-purple-500" },
  { name: "Squash", icon: "🎯", color: "bg-indigo-500" },
];

export default function HomePage() {
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (searchQuery) params.set("sport", searchQuery);
    router.push(`/search?${params.toString()}`);
  };

  const handleSportClick = (sportName: string) => {
    router.push(`/search?sport=${sportName.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-background">
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
            className="absolute top-20 right-20 w-32 h-32 opacity-10"
          >
            <div className="w-full h-full rounded-full border-4 border-primary/30"></div>
          </motion.div>
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            className="absolute bottom-40 left-20 w-16 h-16 bg-primary rounded-full opacity-20"
          ></motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-foreground space-y-8"
          >
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl lg:text-7xl font-bold leading-tight drop-shadow-md"
              >
                Book Your
                <span className="block text-primary drop-shadow-lg">Sports Court</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl lg:text-2xl text-foreground/80 max-w-lg leading-relaxed"
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
              {sports.slice(0, 4).map((sport, index) => (
                <Badge
                  key={sport.name}
                  variant="secondary"
                  className="bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/90 transition-colors text-sm px-3 py-1 font-medium"
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
              <Link href="/search" className="z-10">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
                >
                  Find Courts
                  <Search className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/play-together" className="z-10">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground hover:bg-accent hover:text-accent-foreground px-8 py-4 text-lg bg-transparent"
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
                src="/homeImage.jpg"
                alt="Sports equipment and courts"
                width={600}
                height={600}
                className="w-full h-auto"
                priority
              />
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="absolute top-10 right-10 bg-primary p-3 rounded-full shadow-lg"
              >
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
                className="absolute bottom-20 left-10 bg-secondary p-3 rounded-full shadow-lg"
              >
                <Play className="h-6 w-6 text-secondary-foreground" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-20 bg-card">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <h2 className="text-4xl font-bold text-foreground">
              Find Your Game Anytime
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover courts in your area. Whether you're into tennis,
              basketball, badminton, or any other sport, we've got you covered.
            </p>

            {/* Search Bar */}
            <div className="bg-muted p-8 rounded-2xl shadow-lg border border-border">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Enter location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 h-12 text-lg border-input focus:border-primary text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Search sports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-lg border-input focus:border-primary text-foreground placeholder:text-muted-foreground"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                  />
                </div>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8 h-12 text-primary-foreground font-semibold shadow-md"
                  onClick={handleSearch}
                >
                  Search Courts
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sports Selection Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <h2 className="text-4xl font-bold text-foreground">
              Choose Your Sport
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Select your favorite sport and discover courts near you. Click on
              any sport to start exploring!
            </p>

            {/* Sports Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mt-12">
              {sports.map((sport, index) => (
                <motion.div
                  key={sport.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer"
                  onClick={() => handleSportClick(sport.name)}
                >
                  <div className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div
                      className={`w-16 h-16 ${sport.color} rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl group-hover:scale-110 transition-transform`}
                    >
                      {sport.icon}
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {sport.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Find courts near you
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <Link href="/search">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  View All Sports
                  <Search className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-12"
          >
            <h2 className="text-4xl font-bold text-foreground">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We make it easy to find and book sports venues with just a few
              clicks
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="h-8 w-8" />,
                title: "Easy Search",
                description: "Find courts by location, sport, and availability",
              },
              {
                icon: <Trophy className="h-8 w-8" />,
                title: "Quality Venues",
                description: "Only verified and high-quality sports facilities",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Play Together",
                description: "Find players and organize games with others",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-primary-foreground drop-shadow-md">Ready to Play?</h2>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              Join thousands of players who book their courts with us
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <Button size="lg" variant="secondary" className="px-8 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold shadow-lg">
                  Book a Court
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-3 border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-secondary font-semibold transition-all duration-200"
                >
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
