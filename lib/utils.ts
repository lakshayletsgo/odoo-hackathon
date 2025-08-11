import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function generateTimeSlots(startTime: string, endTime: string, duration: number): string[] {
  const slots: string[] = []
  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)

  const current = new Date(start)

  while (current < end) {
    const timeString = current.toTimeString().slice(0, 5)
    slots.push(timeString)
    current.setMinutes(current.getMinutes() + duration)
  }

  return slots
}

export function isSlotAvailable(slot: string, date: Date, bookings: any[], blockedSlots: any[]): boolean {
  const dateStr = date.toISOString().split("T")[0]

  // Check if slot is booked
  const isBooked = bookings.some(
    (booking) =>
      booking.date.toISOString().split("T")[0] === dateStr &&
      booking.startTime === slot &&
      booking.status !== "CANCELLED",
  )

  // Check if slot is blocked
  const isBlocked = blockedSlots.some(
    (blocked) => blocked.date.toISOString().split("T")[0] === dateStr && blocked.startTime === slot,
  )

  return !isBooked && !isBlocked
}
