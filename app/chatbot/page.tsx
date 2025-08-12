"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, Clock, MapPin, MessageSquare, Search } from "lucide-react";

export default function ChatbotTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Booking Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Your intelligent sports court booking companion powered by Gemini AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                How It Works
              </CardTitle>
              <CardDescription>
                Our AI chatbot understands natural language and helps you find
                the perfect court
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">
                      Natural Language Understanding
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Just type what you want in plain English - "tennis court
                      tomorrow morning" or "basketball near me this weekend"
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Search className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Smart Search</h4>
                    <p className="text-sm text-muted-foreground">
                      AI analyzes your request and searches through all
                      available venues, courts, and time slots
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Real-Time Availability</h4>
                    <p className="text-sm text-muted-foreground">
                      Get instant updates on available time slots and court
                      pricing
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Example Queries</CardTitle>
              <CardDescription>
                Try these sample questions to see the AI in action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    "I want to book a tennis court tomorrow morning"
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    "Find basketball courts near me this weekend"
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    "Show me swimming pools available today evening"
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    "Book a badminton court for 2 hours under ₹500"
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    "Cricket grounds available next Monday"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Supported Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <h4 className="font-medium mb-2">Sports Recognition</h4>
                <p className="text-sm text-muted-foreground">
                  Tennis, Basketball, Football, Cricket, Badminton, Swimming,
                  Volleyball, Pickleball, Table Tennis
                </p>
              </div>
              <div className="text-center">
                <h4 className="font-medium mb-2">Time Understanding</h4>
                <p className="text-sm text-muted-foreground">
                  Today, tomorrow, this weekend, specific dates, morning/evening
                  preferences
                </p>
              </div>
              <div className="text-center">
                <h4 className="font-medium mb-2">Location Aware</h4>
                <p className="text-sm text-muted-foreground">
                  Find venues near you or in specific cities and areas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Click the chat button in the bottom right corner to start your
            conversation with the AI assistant!
          </p>
        </div>
      </div>

      {/* The chatbot component will appear as a floating button */}
    </div>
  );
}
