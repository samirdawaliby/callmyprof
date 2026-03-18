-- Migration 0004: Add preferred_language column to leads table
ALTER TABLE leads ADD COLUMN preferred_language TEXT DEFAULT 'en';
