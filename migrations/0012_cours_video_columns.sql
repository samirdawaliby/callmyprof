-- Add video room columns to cours table for session links
ALTER TABLE cours ADD COLUMN video_provider TEXT;
ALTER TABLE cours ADD COLUMN video_room_url TEXT;
ALTER TABLE cours ADD COLUMN video_host_url TEXT;
ALTER TABLE cours ADD COLUMN video_room_name TEXT;
