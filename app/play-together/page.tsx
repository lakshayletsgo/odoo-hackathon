"use client";

import { CreateEventTab } from "@/components/play-together/create-event-tab";
import { JoinEventTab } from "@/components/play-together/join-event-tab";
import { ManageRequestsModal } from "@/components/play-together/manage-requests-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function PlayTogetherPage() {
  const { data: session, status } = useSession();
  const [selectedInviteId, setSelectedInviteId] = useState<string | null>(null);
  const [showManageRequests, setShowManageRequests] = useState(false);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect("/auth/signin");
  }

  const handleManageRequests = (inviteId: string) => {
    setSelectedInviteId(inviteId);
    setShowManageRequests(true);
  };

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
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <Tabs defaultValue="join" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="join">Join Event</TabsTrigger>
              <TabsTrigger value="create">Create Event</TabsTrigger>
            </TabsList>

            <TabsContent value="join" className="mt-6">
              <JoinEventTab onManageRequests={handleManageRequests} />
            </TabsContent>

            <TabsContent value="create" className="mt-6">
              <CreateEventTab />
            </TabsContent>
          </Tabs>
        </div>

        {/* Manage Requests Modal */}
        {selectedInviteId && (
          <ManageRequestsModal
            open={showManageRequests}
            onOpenChange={setShowManageRequests}
            inviteId={selectedInviteId}
            onSuccess={() => {
              // Refresh the events list
            }}
          />
        )}
      </div>
    </div>
  );
}
