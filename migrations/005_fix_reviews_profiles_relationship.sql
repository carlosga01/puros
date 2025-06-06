-- Migration: 005_fix_reviews_profiles_relationship.sql
-- Description: Fix the foreign key relationship between reviews and profiles
-- Date: 2024-01-02

-- First, drop the existing foreign key constraint on user_id
ALTER TABLE reviews DROP CONSTRAINT reviews_user_id_fkey;

-- Add a new foreign key constraint that references profiles.id instead of auth.users.id
ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Update RLS policies to allow viewing profiles in joins
-- First drop existing profile policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create new policies that allow viewing profiles for reviews
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id); 