-- Add avatar_url column to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update the table to include the new column
SELECT 'avatar_url column added to profiles table' as result;
