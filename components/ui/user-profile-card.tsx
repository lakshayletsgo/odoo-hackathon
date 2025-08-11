"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Mail, Phone, Settings, User } from "lucide-react";
import { useSession } from "next-auth/react";

interface UserProfileCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    profilePicture?: string;
    createdAt: string;
  };
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const { data: session } = useSession();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "VENUE_OWNER":
        return "bg-blue-100 text-blue-800";
      case "OWNER":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatRole = (role: string) => {
    return role
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={user.profilePicture || undefined}
              alt={user.name}
            />
            <AvatarFallback className="text-lg">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge className={getRoleBadgeColor(user.role)}>
                {formatRole(user.role)}
              </Badge>
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user.phone}</span>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">ID: {user.id.slice(-8)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
