'use client';

import { useState, useRef } from 'react';
import { 
  Paper, 
  Group, 
  Text, 
  ActionIcon, 
  Image,
  Stack,
  Center
} from '@mantine/core';
import { 
  IconCamera, 
  IconX,
  IconUpload
} from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';
import { notifications } from '@mantine/notifications';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export default function ImageUpload({ 
  images, 
  onChange, 
  disabled = false,
  maxImages = 3 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileSelect = () => {
    if (disabled || images.length >= maxImages) return;
    fileInputRef.current?.click();
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('review-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('review-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      notifications.show({
        title: 'Too many images',
        message: `You can only upload ${remainingSlots} more image(s)`,
        color: 'orange',
      });
    }

    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(uploadImage);
      const uploadedUrls = await Promise.all(uploadPromises);
      
      const successfulUploads = uploadedUrls.filter(url => url !== null) as string[];
      
      if (successfulUploads.length > 0) {
        onChange([...images, ...successfulUploads]);
        notifications.show({
          title: 'Success',
          message: `${successfulUploads.length} image(s) uploaded successfully`,
          color: 'green',
        });
      }

      if (successfulUploads.length < filesToUpload.length) {
        notifications.show({
          title: 'Upload Error',
          message: 'Some images failed to upload',
          color: 'red',
        });
      }
    } catch {
      notifications.show({
        title: 'Upload Error',
        message: 'Failed to upload images',
        color: 'red',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <Stack gap="md">
      <Text size="sm" fw={500}>
        Photos ({images.length}/{maxImages})
      </Text>

      <Group gap="md" align="flex-start">
        {/* Existing Images */}
        {images.map((imageUrl, index) => (
          <Paper
            key={index}
            radius="md"
            style={{ 
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Image
              src={imageUrl}
              alt={`Review image ${index + 1}`}
              width={100}
              height={100}
              fit="cover"
            />
            <ActionIcon
              variant="filled"
              color="red"
              size="sm"
              radius="xl"
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
              }}
              onClick={() => removeImage(index)}
              disabled={disabled}
            >
              <IconX size={12} />
            </ActionIcon>
          </Paper>
        ))}

        {/* Upload Button */}
        {images.length < maxImages && (
          <Paper
            radius="md"
            style={{
              width: 100,
              height: 100,
              border: '2px dashed rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
            }}
            onClick={handleFileSelect}
          >
            <Center h="100%">
              <Stack align="center" gap="xs">
                {uploading ? (
                  <IconUpload size={20} color="var(--mantine-color-brand-6)" />
                ) : (
                  <IconCamera size={20} color="var(--mantine-color-dimmed)" />
                )}
                <Text size="xs" c="dimmed" ta="center">
                  {uploading ? 'Uploading...' : 'Add Photo'}
                </Text>
              </Stack>
            </Center>
          </Paper>
        )}
      </Group>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />

      {images.length === 0 && (
        <Text size="xs" c="dimmed">
          Add up to {maxImages} photos to your review
        </Text>
      )}
    </Stack>
  );
} 