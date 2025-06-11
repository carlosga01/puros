'use client';

import { useState } from 'react';
import { 
  Paper, 
  TextInput, 
  Textarea, 
  Group, 
  Button,
  Text,
  Stack
} from '@mantine/core';
// Removed DatePickerInput import - using native date input instead
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
      p="xl" 
      mx={{ base: 'md', sm: 0 }}
      radius="lg"
      style={{ 
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
      className="mobile-no-radius"
    >

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {/* Cigar Name */}
          <TextInput
            label="Cigar Name"
            placeholder="Enter the cigar name"
            required
            {...form.getInputProps('cigar_name')}
            styles={{
              label: {
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500,
                marginBottom: '8px',
              },
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'rgba(255, 255, 255, 0.9)',
                '&:focus': {
                  borderColor: 'rgba(255, 193, 68, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                },
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                }
              }
            }}
          />

          {/* Rating */}
          <div>
            <Text size="sm" fw={500} mb="xs" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Rating *
            </Text>
            <StarRating
              rating={rating}
              onChange={setRating}
              size={24}
            />
            {rating === 0 && (
              <Text size="xs" mt="xs" style={{ color: 'rgba(255, 100, 100, 0.9)' }}>
                Please provide a rating
              </Text>
            )}
          </div>

          {/* Review Date */}
          <TextInput
            label="Review Date"
            placeholder="Select date"
            type="date"
            required
            value={form.values.review_date ? 
              new Date(form.values.review_date.getTime() - form.values.review_date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : 
              new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]
            }
            onChange={(event) => form.setFieldValue('review_date', new Date(event.currentTarget.value))}
            error={form.errors.review_date}
            styles={{
              label: {
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500,
                marginBottom: '8px',
              },
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'rgba(255, 255, 255, 0.9)',
                colorScheme: 'dark',
                '&:focus': {
                  borderColor: 'rgba(255, 193, 68, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
              label: {
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500,
                marginBottom: '8px',
              },
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'rgba(255, 255, 255, 0.9)',
                '&:focus': {
                  borderColor: 'rgba(255, 193, 68, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                },
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
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
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              loading={isLoading}
              disabled={rating === 0}
              size="md"
              style={{
                backgroundColor: '#fff',
                color: '#000',
                fontWeight: 600,
                border: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              {review ? 'Update Review' : 'Save Review'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
} 