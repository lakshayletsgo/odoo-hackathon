"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  Send,
  User,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  venues?: any[];
  extractedInfo?: any;
}

interface ChatbotProps {
  className?: string;
}

export function Chatbot({ className }: ChatbotProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your QuickCourt assistant. I can help you find courts and check availability. Just tell me what you need - like 'tennis court tomorrow' or 'basketball this weekend'.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !session) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          context: null, // Send null instead of object with undefined values
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
          venues: data.venues || [],
          extractedInfo: data.extractedInfo,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error. Please try again or search for venues manually.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!session) {
    return null; // Don't show chatbot if user is not logged in
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[calc(100vh-3rem)] shadow-xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5" />
              QuickCourt Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e1 transparent",
              }}
            >
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div
                    className={`flex gap-2 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === "assistant" && (
                          <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        {message.role === "user" && (
                          <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Venue Results */}
                  {message.venues && message.venues.length > 0 && (
                    <div className="space-y-2 ml-6">
                      <p className="text-xs text-muted-foreground font-medium">
                        Found {message.venues.length} venues:
                      </p>
                      {message.venues.slice(0, 3).map((venue, index) => (
                        <Card key={venue.id} className="border border-muted">
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-sm">
                                    {venue.name}
                                  </h4>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>{venue.city}</span>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  ⭐ {venue.rating || 4.5}
                                </Badge>
                              </div>

                              {/* Courts and Available Slots */}
                              {venue.courts && venue.courts.length > 0 && (
                                <div className="space-y-1">
                                  {venue.courts
                                    .slice(0, 2)
                                    .map((court: any) => (
                                      <div key={court.id} className="text-xs">
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium">
                                            {court.name} ({court.sport})
                                          </span>
                                          <span className="text-green-600">
                                            ₹{court.pricePerHour}/hr
                                          </span>
                                        </div>
                                        {court.availableSlots &&
                                          court.availableSlots.length > 0 && (
                                            <div className="flex items-center gap-1 mt-1">
                                              <Clock className="h-3 w-3 text-muted-foreground" />
                                              <span className="text-muted-foreground">
                                                Available:{" "}
                                                {court.availableSlots
                                                  .slice(0, 3)
                                                  .map(
                                                    (slot: any) =>
                                                      slot.startTime
                                                  )
                                                  .join(", ")}
                                              </span>
                                            </div>
                                          )}
                                      </div>
                                    ))}
                                </div>
                              )}

                              <Link href={`/venues/${venue.id}`}>
                                <Button
                                  size="sm"
                                  className="w-full text-xs h-7"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View & Book
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {message.venues.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{message.venues.length - 3} more venues available
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about court availability..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Try: "Tennis courts tomorrow morning" or "Basketball near me
                this weekend"
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
