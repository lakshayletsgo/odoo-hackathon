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
  value: sport.toUpperCase().replace(/\s+/g, "_"),
  label: sport,
}));

export const SPORTS_WITH_ALL = ["All Sports", ...SPORTS] as const;
