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
  Box,
  Divider,
  Card
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconEdit, 
  IconTrash, 
  IconSearch,
  IconStar,
  IconDotsVertical
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import ImageCarousel from './ImageCarousel';
import SocialActions from './SocialActions';

interface Review {
  id: string;
  user_id: string;
  cigar_name: string;
  rating: number;
  notes: string;
  review_date: string;
  created_at: string;
  updated_at: string;
  images: string[];
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

export default function FeedTimeline() {
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

  const handleSaveReview = async (reviewData: { id?: string; cigar_name: string; rating: number; notes: string; review_date: string; images?: string[] }) => {
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
            images: reviewData.images || [],
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
            review_date: reviewData.review_date,
            images: reviewData.images || []
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

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}d`;
    return formatDate(dateString);
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
              review_date: editingReview.review_date,
              images: editingReview.images
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
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(255, 193, 68, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 154, 0, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 193, 68, 0.03) 0%, transparent 40%)
          `,
        }}
      />

      {/* Floating Orbs */}
      <Box
        style={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(255, 193, 68, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(255, 154, 0, 0.04) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 10s ease-in-out infinite reverse',
        }}
      />

      <Container size="md" py="xl" style={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <Paper 
          shadow="0 20px 40px rgba(0, 0, 0, 0.3)" 
          p={{ base: 'lg', sm: 'xl' }} 
          radius="xl" 
          mb="xl"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <Group justify="space-between" align="center">
            <Group align="center" gap="lg">
              <ActionIcon
                variant="subtle"
                component={Link}
                href="/home"
                size="xl"
                radius="xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 193, 68, 0.2)';
                  e.currentTarget.style.color = '#ffc144';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                <IconArrowLeft size={22} />
              </ActionIcon>
              <Title 
                order={1} 
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #ffc144 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '2rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                Feed
              </Title>
            </Group>
            
            <Button
              leftSection={<IconStar size={18} />}
              onClick={() => setShowForm(true)}
              size="lg"
              radius="xl"
              style={{
                background: 'linear-gradient(135deg, #ffc144 0%, #ff9a00 100%)',
                border: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 8px 25px rgba(255, 193, 68, 0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(255, 193, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 193, 68, 0.3)';
              }}
            >
              <Text visibleFrom="sm">New Review</Text>
              <Text hiddenFrom="sm">New</Text>
            </Button>
          </Group>
        </Paper>

        {/* Filters */}
        <Paper 
          shadow="0 15px 30px rgba(0, 0, 0, 0.2)" 
          p={{ base: 'lg', sm: 'xl' }} 
          radius="xl" 
          mb="xl"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
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
                radius="lg"
                styles={{
                  label: {
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                  },
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    '&:focus': {
                      borderColor: 'rgba(255, 193, 68, 0.6)',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    }
                  }
                }}
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
                radius="lg"
                styles={{
                  label: {
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                  },
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    '&:focus': {
                      borderColor: 'rgba(255, 193, 68, 0.6)',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    }
                  }
                }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                label="Search Cigar"
                placeholder="Search cigar name..."
                leftSection={<IconSearch size={18} style={{ color: 'rgba(255, 193, 68, 0.7)' }} />}
                value={filters.cigarName}
                onChange={(e) => setFilters({ ...filters, cigarName: e.target.value })}
                radius="lg"
                styles={{
                  label: {
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                  },
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    paddingLeft: '3rem',
                    '&:focus': {
                      borderColor: 'rgba(255, 193, 68, 0.6)',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    },
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.4)',
                    }
                  }
                }}
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
                radius="lg"
                styles={{
                  label: {
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                  },
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    '&:focus': {
                      borderColor: 'rgba(255, 193, 68, 0.6)',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    }
                  }
                }}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Feed */}
        {loading ? (
          <Center py="xl">
            <Stack align="center" gap="lg">
              <Box
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(255, 193, 68, 0.2) 0%, rgba(255, 154, 0, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse-glow 2s ease-in-out infinite',
                }}
              >
                <Loader size="lg" color="#ffc144" />
              </Box>
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }}>
                Loading your feed...
              </Text>
            </Stack>
          </Center>
        ) : reviews.length === 0 ? (
          <Paper 
            shadow="0 20px 40px rgba(0, 0, 0, 0.2)" 
            p="3rem" 
            radius="xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <Center>
              <Stack align="center" gap="xl">
                <Box
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255, 193, 68, 0.2) 0%, rgba(255, 154, 0, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 193, 68, 0.3)',
                    boxShadow: '0 8px 32px rgba(255, 193, 68, 0.2)',
                  }}
                >
                  <IconStar size={48} color="#ffc144" />
                </Box>
                <Stack align="center" gap="md">
                  <Title 
                    order={3} 
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                    }}
                  >
                    No reviews found
                  </Title>
                  <Text 
                    ta="center" 
                    maw={400}
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {filters.rating || filters.dateRange || filters.cigarName
                      ? 'Try adjusting your filters to see more results'
                      : 'Be the first to write a review and start the conversation!'
                    }
                  </Text>
                </Stack>
                <Button
                  onClick={() => setShowForm(true)}
                  size="lg"
                  radius="xl"
                  style={{
                    background: 'linear-gradient(135deg, #ffc144 0%, #ff9a00 100%)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    padding: '1rem 2rem',
                    boxShadow: '0 8px 25px rgba(255, 193, 68, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(255, 193, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 193, 68, 0.3)';
                  }}
                >
                  Write the first review
                </Button>
              </Stack>
            </Center>
          </Paper>
        ) : (
          <Stack gap="xl">
            {reviews.map((review) => (
              <Card
                key={review.id}
                shadow="0 20px 40px rgba(0, 0, 0, 0.25)"
                padding="xl"
                radius="xl"
                className="card-hover"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(255, 193, 68, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.25)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                {/* Post Header */}
                <Group justify="space-between" mb="md">
                  <Group>
                    <Avatar
                      src={review.profiles.avatar_url}
                      size="md"
                      radius="xl"
                      color="brand"
                    >
                      {getInitials(review.profiles.first_name, review.profiles.last_name)}
                    </Avatar>
                    <Stack gap={2}>
                      <Text fw={600} size="sm">
                        {review.profiles.first_name} {review.profiles.last_name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {getTimeAgo(review.created_at)}
                      </Text>
                    </Stack>
                  </Group>
                  
                  {review.user_id === user?.id ? (
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
                  ) : (
                    <ActionIcon variant="subtle" color="gray">
                      <IconDotsVertical size={16} />
                    </ActionIcon>
                  )}
                </Group>

                {/* Images */}
                {review.images && review.images.length > 0 && (
                  <Box mb="md">
                    <ImageCarousel 
                      images={review.images} 
                      height={400}
                      radius="md"
                      fullWidth={true}
                    />
                  </Box>
                )}

                {/* Content */}
                <Stack gap="sm" mb="md">
                  <Group justify="space-between" align="center">
                    <Title order={4} c="brand.3">
                      {review.cigar_name}
                    </Title>
                    <StarRating rating={review.rating} readonly size={18} />
                  </Group>
                  
                  {review.notes && (
                    <Text size="sm" style={{ lineHeight: 1.6 }}>
                      {review.notes}
                    </Text>
                  )}
                </Stack>

                <Divider my="sm" />

                {/* Actions */}
                <Group justify="space-between" align="center">
                  <SocialActions 
                    reviewId={review.id}
                    userId={user?.id || null}
                    showInlineComments={true}
                  />
                  <Text size="xs" c="dimmed">
                    {formatDate(review.review_date)}
                  </Text>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
} 