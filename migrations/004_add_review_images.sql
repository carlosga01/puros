-- Migration: 004_add_review_images.sql
-- Description: Add image storage for review photos (up to 3 per review)
-- Date: 2024-01-02

-- Add images column to reviews table
ALTER TABLE reviews ADD COLUMN images TEXT[] DEFAULT '{}';

-- Create index for better query performance on images
CREATE INDEX idx_reviews_images ON reviews USING GIN(images);

-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for review images
CREATE POLICY "Users can upload review images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'review-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their review images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'review-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their review images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'review-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view review images" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images'); 