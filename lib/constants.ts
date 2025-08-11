export const SPORTS = [
  "Swimming",
  "Tennis",
  "Cricket",
  "Football",
  "Volleyball",
  "Basketball",
  "Pickleball",
  "Badminton",
  "Table Tennis",
] as const;

export type SportType = (typeof SPORTS)[number];

export const SPORTS_OPTIONS = SPORTS.map((sport) => ({
  value: sport,
  label: sport,
}));

export const SPORTS_WITH_ALL = ["All Sports", ...SPORTS] as const;

export const USER_ROLES = ["USER", "OWNER", "ADMIN", "VENUE_OWNER"] as const;

export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;

export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

export const INVITE_STATUSES = ["OPEN", "CLOSED", "CANCELLED"] as const;
