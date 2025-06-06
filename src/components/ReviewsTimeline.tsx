'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Paper,
  Title,
  Button,
  Group,
  Stack,
  Grid,
  Select,
  TextInput,
  Text,
  Avatar,
  ActionIcon,
  Loader,
  Center,
  Box
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconEdit, 
  IconTrash, 
  IconSearch,
  IconStar
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';

interface Review {
  id: string;
  user_id: string;
  cigar_name: string;
  rating: number;
  notes: string;
  review_date: string;
  created_at: string;
  updated_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

interface Filters {
  rating: string;
  dateRange: string;
  cigarName: string;
  sortBy: string;
}

export default function ReviewsTimeline() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    rating: '',
    dateRange: '',
    cigarName: '',
    sortBy: 'newest'
  });
  const [user, setUser] = useState<{ id: string } | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
    };
    getUser();
  }, [router, supabase]);

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user, filters]);

  const fetchReviews = async () => {
    setLoading(true);
    
    let query = supabase
      .from('reviews')
      .select(`
        *,
        profiles!inner(first_name, last_name, avatar_url)
      `);

    // Apply filters
    if (filters.rating) {
      const ratingNum = parseFloat(filters.rating);
      query = query.gte('rating', ratingNum).lt('rating', ratingNum + 1);
    }

    if (filters.cigarName) {
      query = query.ilike('cigar_name', `%${filters.cigarName}%`);
    }

    if (filters.dateRange) {
      const today = new Date();
      const startDate = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(today.getFullYear() - 1);
          break;
      }
      
      if (filters.dateRange !== '') {
        query = query.gte('review_date', startDate.toISOString().split('T')[0]);
      }
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'rating_high':
        query = query.order('rating', { ascending: false });
        break;
      case 'rating_low':
        query = query.order('rating', { ascending: true });
        break;
      case 'cigar_name':
        query = query.order('cigar_name', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching reviews:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load reviews',
        color: 'red',
      });
    } else {
      setReviews(data || []);
    }
    
    setLoading(false);
  };

  const handleSaveReview = async (reviewData: Omit<Review, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'profiles'>) => {
    setSaving(true);
    
    try {
      if (editingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            cigar_name: reviewData.cigar_name,
            rating: reviewData.rating,
            notes: reviewData.notes,
            review_date: reviewData.review_date,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingReview.id);
          
        if (error) throw error;
        
        notifications.show({
          title: 'Success',
          message: 'Review updated successfully',
          color: 'green',
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: user!.id,
            cigar_name: reviewData.cigar_name,
            rating: reviewData.rating,
            notes: reviewData.notes,
            review_date: reviewData.review_date
          });
          
        if (error) throw error;
        
        notifications.show({
          title: 'Success',
          message: 'Review created successfully',
          color: 'green',
        });
      }
      
      setShowForm(false);
      setEditingReview(null);
      fetchReviews();
    } catch (error) {
      console.error('Error saving review:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save review',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleDeleteReview = (reviewId: string) => {
    modals.openConfirmModal({
      title: 'Delete Review',
      children: (
        <Text size="sm">
          Are you sure you want to delete this review? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const { error } = await supabase
          .from('reviews')
          .delete()
          .eq('id', reviewId);
          
        if (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete review',
            color: 'red',
          });
        } else {
          notifications.show({
            title: 'Success',
            message: 'Review deleted successfully',
            color: 'green',
          });
          fetchReviews();
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (showForm) {
    return (
      <Box 
        style={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, rgba(18, 18, 23, 0.95) 0%, rgba(30, 30, 40, 0.9) 100%)',
        }}
      >
        <Container size="md" py="xl">
          <Paper shadow="xl" p="xl" radius="lg" mb="xl">
            <Group justify="space-between" align="center" mb="lg">
              <Title order={1} c="brand.3">
                {editingReview ? 'Edit Review' : 'New Review'}
              </Title>
            </Group>
          </Paper>

          <ReviewForm
            review={editingReview ? {
              id: editingReview.id,
              cigar_name: editingReview.cigar_name,
              rating: editingReview.rating,
              notes: editingReview.notes,
              review_date: editingReview.review_date
            } : undefined}
            onSave={handleSaveReview}
            onCancel={() => {
              setShowForm(false);
              setEditingReview(null);
            }}
            isLoading={saving}
          />
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(18, 18, 23, 0.95) 0%, rgba(30, 30, 40, 0.9) 100%)',
      }}
    >
      <Container size="xl" py="xl">
        {/* Header */}
        <Paper shadow="xl" p="xl" radius="lg" mb="xl">
          <Group justify="space-between" align="center">
            <Group align="center">
              <ActionIcon
                variant="subtle"
                component={Link}
                href="/home"
                size="lg"
                color="gray"
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Title order={1} c="brand.3">
                Reviews
              </Title>
            </Group>
            
            <Button
              leftSection={<IconStar size={16} />}
              variant="gradient"
              gradient={{ from: 'brand.6', to: 'brand.8' }}
              onClick={() => setShowForm(true)}
            >
              Write Review
            </Button>
          </Group>
        </Paper>

        {/* Filters */}
        <Paper shadow="md" p="lg" radius="lg" mb="xl">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Rating"
                placeholder="All Ratings"
                value={filters.rating}
                onChange={(value) => setFilters({ ...filters, rating: value || '' })}
                data={[
                  { value: '', label: 'All Ratings' },
                  { value: '4', label: '4+ Stars' },
                  { value: '3', label: '3+ Stars' },
                  { value: '2', label: '2+ Stars' },
                  { value: '1', label: '1+ Stars' },
                ]}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Date Range"
                placeholder="All Time"
                value={filters.dateRange}
                onChange={(value) => setFilters({ ...filters, dateRange: value || '' })}
                data={[
                  { value: '', label: 'All Time' },
                  { value: 'week', label: 'Last Week' },
                  { value: 'month', label: 'Last Month' },
                  { value: 'year', label: 'Last Year' },
                ]}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                label="Search Cigar"
                placeholder="Search cigar name..."
                leftSection={<IconSearch size={16} />}
                value={filters.cigarName}
                onChange={(e) => setFilters({ ...filters, cigarName: e.target.value })}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Sort By"
                value={filters.sortBy}
                onChange={(value) => setFilters({ ...filters, sortBy: value || 'newest' })}
                data={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' },
                  { value: 'rating_high', label: 'Highest Rated' },
                  { value: 'rating_low', label: 'Lowest Rated' },
                  { value: 'cigar_name', label: 'Cigar Name' },
                ]}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Reviews List */}
        {loading ? (
          <Center py="xl">
            <Stack align="center">
              <Loader size="lg" color="brand" />
              <Text c="dimmed">Loading reviews...</Text>
            </Stack>
          </Center>
        ) : reviews.length === 0 ? (
          <Paper shadow="md" p="xl" radius="lg">
            <Center>
              <Stack align="center">
                <IconStar size={48} color="var(--mantine-color-brand-6)" />
                <Title order={3} c="dimmed">No reviews found</Title>
                <Text c="dimmed" ta="center">
                  {filters.rating || filters.dateRange || filters.cigarName
                    ? 'Try adjusting your filters to see more results'
                    : 'Be the first to write a review!'
                  }
                </Text>
                <Button
                  variant="gradient"
                  gradient={{ from: 'brand.6', to: 'brand.8' }}
                  onClick={() => setShowForm(true)}
                  mt="md"
                >
                  Write the first review
                </Button>
              </Stack>
            </Center>
          </Paper>
        ) : (
          <Stack gap="lg">
            {reviews.map((review) => (
              <Paper
                key={review.id}
                shadow="md"
                p="lg"
                radius="lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Group justify="space-between" align="flex-start" mb="md">
                  <Group align="center">
                    <Avatar
                      src={review.profiles.avatar_url}
                      size="md"
                      radius="xl"
                      color="brand"
                    >
                      {getInitials(review.profiles.first_name, review.profiles.last_name)}
                    </Avatar>
                    <div>
                      <Text fw={500} size="sm">
                        {review.profiles.first_name} {review.profiles.last_name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDate(review.review_date)}
                      </Text>
                    </div>
                  </Group>
                  
                  {review.user_id === user?.id && (
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="brand"
                        onClick={() => handleEditReview(review)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  )}
                </Group>

                <Stack gap="sm">
                  <Title order={4} c="brand.3">
                    {review.cigar_name}
                  </Title>
                  <StarRating rating={review.rating} readonly size={18} />
                  {review.notes && (
                    <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                      {review.notes}
                    </Text>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
} 