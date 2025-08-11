-- Convert enum fields to text fields
-- This migration removes all enum types and converts them to regular text fields
-- Step 1: Alter tables to use text instead of enums
ALTER TABLE "User"
ALTER COLUMN "role" TYPE TEXT;
ALTER TABLE "OtpCode"
ALTER COLUMN "type" TYPE TEXT;
ALTER TABLE "Court"
ALTER COLUMN "sport" TYPE TEXT;
ALTER TABLE "Booking"
ALTER COLUMN "status" TYPE TEXT;
ALTER TABLE "Booking"
ALTER COLUMN "paymentStatus" TYPE TEXT;
ALTER TABLE "Invite"
ALTER COLUMN "sport" TYPE TEXT;
ALTER TABLE "Invite"
ALTER COLUMN "status" TYPE TEXT;
ALTER TABLE "JoinRequest"
ALTER COLUMN "status" TYPE TEXT;
-- Step 2: Update any existing enum values to proper text format
UPDATE "Court"
SET "sport" = CASE
        WHEN "sport" = 'TENNIS' THEN 'Tennis'
        WHEN "sport" = 'BASKETBALL' THEN 'Basketball'
        WHEN "sport" = 'FOOTBALL' THEN 'Football'
        WHEN "sport" = 'BADMINTON' THEN 'Badminton'
        WHEN "sport" = 'VOLLEYBALL' THEN 'Volleyball'
        WHEN "sport" = 'SQUASH' THEN 'Squash'
        WHEN "sport" = 'CRICKET' THEN 'Cricket'
        WHEN "sport" = 'SOCCER' THEN 'Football'
        WHEN "sport" = 'TABLE_TENNIS' THEN 'Table Tennis'
        WHEN "sport" = 'SWIMMING' THEN 'Swimming'
        WHEN "sport" = 'PICKLEBALL' THEN 'Pickleball'
        ELSE 'Tennis'
    END;
UPDATE "Invite"
SET "sport" = CASE
        WHEN "sport" = 'TENNIS' THEN 'Tennis'
        WHEN "sport" = 'BASKETBALL' THEN 'Basketball'
        WHEN "sport" = 'FOOTBALL' THEN 'Football'
        WHEN "sport" = 'BADMINTON' THEN 'Badminton'
        WHEN "sport" = 'VOLLEYBALL' THEN 'Volleyball'
        WHEN "sport" = 'SQUASH' THEN 'Squash'
        WHEN "sport" = 'CRICKET' THEN 'Cricket'
        WHEN "sport" = 'SOCCER' THEN 'Football'
        WHEN "sport" = 'TABLE_TENNIS' THEN 'Table Tennis'
        WHEN "sport" = 'SWIMMING' THEN 'Swimming'
        WHEN "sport" = 'PICKLEBALL' THEN 'Pickleball'
        ELSE 'Tennis'
    END;
UPDATE "Invite"
SET "status" = CASE
        WHEN "status" = 'ACTIVE' THEN 'OPEN'
        WHEN "status" = 'COMPLETED' THEN 'CLOSED'
        WHEN "status" = 'CANCELLED' THEN 'CANCELLED'
        ELSE 'OPEN'
    END;
-- Step 3: Drop all enum types
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "OtpType" CASCADE;
DROP TYPE IF EXISTS "Sport" CASCADE;
DROP TYPE IF EXISTS "BookingStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "InviteStatus" CASCADE;
DROP TYPE IF EXISTS "JoinRequestStatus" CASCADE;