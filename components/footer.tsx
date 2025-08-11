"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Facebook,
  Instagram,
  Mail,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";

const sports = [
  "Tennis",
  "Basketball", 
  "Football",
  "Soccer",
  "Badminton",
  "Volleyball",
  "Cricket",
  "Squash",
];

const quickLinks = [
  { name: "Find Courts", href: "/search" },
  { name: "Find Players", href: "/play-together" },
  { name: "Browse Venues", href: "/venues" },
  { name: "How It Works", href: "/how-it-works" },
];

const company = [
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Careers", href: "/careers" },
  { name: "Press", href: "/press" },
  { name: "Blog", href: "/blog" },
];

const support = [
  { name: "Help Center", href: "/help" },
  { name: "Safety", href: "/safety" },
  { name: "Community Guidelines", href: "/guidelines" },
  { name: "Report an Issue", href: "/report" },
  { name: "FAQ", href: "/faq" },
];

const legal = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Cookie Policy", href: "/cookies" },
  { name: "Refund Policy", href: "/refunds" },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                QuickCourt
              </span>
            </div>
            
            <p className="text-slate-300 text-lg leading-relaxed">
              Your ultimate destination for booking sports courts instantly. 
              Connect with players, discover venues, and never miss a game.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-slate-300">
                <Mail className="h-5 w-5 text-primary" />
                <span>support@quickcourt.com</span>
              </div>
            </div>


    
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-slate-300 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Company</h3>
            <ul className="space-y-3">
              {company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-slate-300 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-3">
              {support.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-slate-300 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sports Section */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-6">Popular Sports</h3>
          <div className="flex flex-wrap gap-3">
            {sports.map((sport) => (
              <Link key={sport} href={`/search?sport=${sport.toLowerCase()}`}>
                <Badge 
                  variant="secondary" 
                  className="bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer px-3 py-1"
                >
                  {sport}
                </Badge>
              </Link>
            ))}
          </div>
        </div>


      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-slate-400 text-sm">
              © 2024 QuickCourt. All rights reserved.
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm">
              {legal.map((link, index) => (
                <span key={link.name} className="flex items-center">
                  <Link 
                    href={link.href}
                    className="text-slate-400 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                  {index < legal.length - 1 && (
                    <Separator orientation="vertical" className="h-4 bg-slate-700 ml-6" />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
