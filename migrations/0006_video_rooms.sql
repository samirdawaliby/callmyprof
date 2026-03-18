-- Migration 0006: Add video room support to bookings
-- Supports Daily.co (primary) and Jitsi Meet (fallback)

ALTER TABLE bookings ADD COLUMN video_provider TEXT;          -- 'daily' or 'jitsi'
ALTER TABLE bookings ADD COLUMN video_room_url TEXT;          -- Student join link
ALTER TABLE bookings ADD COLUMN video_host_url TEXT;          -- Admin/tutor join link
ALTER TABLE bookings ADD COLUMN video_room_name TEXT;         -- Room identifier
