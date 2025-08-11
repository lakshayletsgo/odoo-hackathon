-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS quickcourt;
USE quickcourt;

-- The Prisma schema will handle table creation
-- This script is for any additional setup needed

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_venues_city ON Venue(city);
CREATE INDEX IF NOT EXISTS idx_venues_approved ON Venue(isApproved);
CREATE INDEX IF NOT EXISTS idx_courts_sport ON Court(sport);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON Booking(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON Booking(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON Booking(userId);
CREATE INDEX IF NOT EXISTS idx_bookings_court ON Booking(courtId);

-- Insert sample sports data
INSERT IGNORE INTO Court (id, name, sport, pricePerHour, slotDuration, operatingHours, venueId, createdAt, updatedAt) VALUES
('sample-court-1', 'Tennis Court 1', 'TENNIS', 35.00, 60, '{"monday": {"start": "06:00", "end": "22:00"}, "tuesday": {"start": "06:00", "end": "22:00"}}', 'sample-venue-1', NOW(), NOW());
