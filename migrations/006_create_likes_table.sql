-- Migration: 006_create_likes_table.sql
-- Description: Create likes table for post likes
-- Date: 2024-01-03

CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only like a review once
  UNIQUE(user_id, review_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_review_id ON likes(review_id);
CREATE INDEX idx_likes_created_at ON likes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all likes" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id); 