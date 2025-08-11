"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookingModal } from "@/components/ui/booking-modal"

type Court = { id: string; name: string; pricePerHour: number }

export function BookingActions({
  venueId,
  courts,
}: {
  venueId: string
  courts: Court[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button className="bg-primary text-primary-foreground hover:opacity-90" onClick={() => setOpen(true)}>
        Book This Venue
      </Button>
      <BookingModal open={open} onOpenChange={setOpen} venueId={venueId} courts={courts} />
    </>
  )
}


