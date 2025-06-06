-- Migration: 002_create_storage_bucket.sql
-- Description: Create storage bucket for profile images with policies
-- Date: 2024-01-01

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true);

-- Create storage policies to allow authenticated users to upload/manage their files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-pictures' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-pictures' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures'); 