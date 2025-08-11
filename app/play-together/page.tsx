"use client";

import { CreateInviteForm } from "@/components/play-together/create-invite-form";
import { JoinInviteModal } from "@/components/play-together/join-invite-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { Clock, MapPin, Plus, Trophy, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PlayTogetherPage() {
  const { data: session, status } = useSession();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = async () => {
    try {
      const response = await axios.get("/api/invites");
      setInvites(response.data);
    } catch (error) {
      console.error("Error fetching invites:", error);
      toast.error("Failed to load invites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Play Together
          </h1>
          <p className="text-xl text-gray-600">
            Find players and venues for your favorite sports
          </p>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Invite
          </Button>
        </div>

        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Available Invites
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading invites...</p>
          ) : invites.length === 0 ? (
            <p className="text-gray-600">
              No invites available. Create one to get started!
            </p>
          ) : (
            <div className="grid gap-4">
              {invites.map((invite: any) => (
                <Card
                  key={invite.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{invite.name}</h3>
                        <p className="text-sm text-gray-600">{invite.venue}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(invite.date).toLocaleDateString()} at{" "}
                          {invite.time}
                        </p>
                        <p className="text-sm text-gray-600">
                          {invite.playersLeft} spots left
                        </p>
                      </div>
                      {invite.creatorId === session?.user?.id ? (
                        <span className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full border">
                          Your Invite
                        </span>
                      ) : (
                        <Button
                          onClick={() => {
                            setSelectedInvite(invite);
                            setShowJoinModal(true);
                          }}
                          disabled={invite.playersLeft === 0}
                        >
                          Join
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Recent Activities
          </h2>
          <p className="text-gray-600">
            No recent activities yet. Start playing to see your activities here!
          </p>
        </div>

        {/* Modals */}
        <CreateInviteForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          onSuccess={fetchInvites}
        />

        {selectedInvite && (
          <JoinInviteModal
            open={showJoinModal}
            onOpenChange={setShowJoinModal}
            invite={selectedInvite}
            onSuccess={fetchInvites}
          />
        )}
      </div>
    </div>
  );
}
