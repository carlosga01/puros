'use client';

import { useState } from 'react';
import { 
  Paper, 
  Title, 
  TextInput, 
  Textarea, 
  Group, 
  Button,
  Text,
  Stack
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import StarRating from './StarRating';
import ImageUpload from './ImageUpload';

interface Review {
  id?: string;
  cigar_name: string;
  rating: number;
  notes: string;
  review_date: string;
  images?: string[];
}

interface ReviewFormProps {
  review?: Review;
  onSave: (review: Review) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ReviewForm({ 
  review, 
  onSave, 
  onCancel, 
  isLoading = false 
}: ReviewFormProps) {
  const [rating, setRating] = useState(review?.rating || 0);
  const [images, setImages] = useState<string[]>(review?.images || []);

  const form = useForm({
    initialValues: {
      cigar_name: review?.cigar_name || '',
      notes: review?.notes || '',
      review_date: review?.review_date ? new Date(review.review_date) : new Date(),
    },
    validate: {
      cigar_name: (value) => (value.trim().length < 1 ? 'Cigar name is required' : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    if (rating === 0) {
      return;
    }

    const reviewData: Review = {
      ...(review?.id && { id: review.id }),
      cigar_name: values.cigar_name.trim(),
      rating,
      notes: values.notes.trim(),
      review_date: values.review_date.toISOString().split('T')[0],
      images,
    };

    onSave(reviewData);
  };

  return (
    <Paper 
      shadow="lg" 
      p="xl" 
      radius="lg"
      style={{ 
        background: 'rgba(18, 18, 23, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Title order={2} mb="xl" c="brand.3">
        {review ? 'Edit Review' : 'Write a Review'}
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {/* Cigar Name */}
          <TextInput
            label="Cigar Name"
            placeholder="Enter the cigar name"
            required
            {...form.getInputProps('cigar_name')}
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:focus': {
                  borderColor: 'var(--mantine-color-brand-6)'
                }
              }
            }}
          />

          {/* Rating */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              Rating *
            </Text>
            <StarRating
              rating={rating}
              onChange={setRating}
              size={24}
            />
            {rating === 0 && (
              <Text size="xs" c="red" mt="xs">
                Please provide a rating
              </Text>
            )}
          </div>

          {/* Review Date */}
          <DateInput
            label="Review Date"
            placeholder="Select date"
            required
            {...form.getInputProps('review_date')}
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:focus': {
                  borderColor: 'var(--mantine-color-brand-6)'
                }
              }
            }}
          />

          {/* Notes */}
          <Textarea
            label="Notes"
            placeholder="Share your thoughts about this cigar..."
            rows={4}
            {...form.getInputProps('notes')}
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:focus': {
                  borderColor: 'var(--mantine-color-brand-6)'
                }
              }
            }}
          />

          {/* Images */}
          <ImageUpload
            images={images}
            onChange={setImages}
            disabled={isLoading}
            maxImages={3}
          />

          {/* Actions */}
          <Group justify="flex-end" mt="xl">
            <Button
              variant="subtle"
              onClick={onCancel}
              disabled={isLoading}
              color="gray"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              loading={isLoading}
              disabled={rating === 0}
              variant="gradient"
              gradient={{ from: 'brand.6', to: 'brand.8' }}
              size="md"
            >
              {review ? 'Update Review' : 'Save Review'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
} 