-- Add isBanned column to User table
ALTER TABLE "User"
ADD COLUMN "isBanned" BOOLEAN NOT NULL DEFAULT false;