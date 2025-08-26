'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Paper,
  Title,
  Button,
  Group,
  Stack,
  Select,
  Text,
  Avatar,
  ActionIcon,
  Loader,
  Center,
  Box,
  Card,
  Badge,
  TextInput,
  Menu
} from '@mantine/core';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus,
  IconStar,
  IconDotsVertical,
  IconFilter,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconSearch,
  IconArrowLeft
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import OptimizedImageCarousel from './OptimizedImageCarousel';
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
    id: string;
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

interface FeedTimelineProps {
  userId?: string; // If provided, only show reviews from this user
  initialReviews?: Review[]; // If provided, use these reviews instead of fetching
  showFilters?: boolean; // Whether to show filter controls
  showAddButton?: boolean; // Whether to show the "Add Review" button
}

export default function FeedTimeline({ 
  userId, 
  initialReviews, 
  showFilters = true, 
  showAddButton = true 
}: FeedTimelineProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    rating: '',
    dateRange: '',
    cigarName: '',
    sortBy: 'newest'
  });
  const [pendingFilters, setPendingFilters] = useState<Filters>({
    rating: '',
    dateRange: '',
    cigarName: '',
    sortBy: 'newest'
  });
  const [filterModalOpen, setFilterModalOpen] = useState(false);
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
      // Reset pagination when filters or page size change
      setCurrentPage(1);
    }
  }, [user, filters, pageSize]);

  const fetchReviews = useCallback(async () => {
    // If initial reviews are provided, use them instead of fetching
    if (initialReviews) {
      setReviews(initialReviews);
      setTotalCount(initialReviews.length);
      setLoading(false);
      return;
    }

    if (!user?.id) {
      console.log('No user available, skipping fetch');
      return;
    }
    
    setLoading(true);
    
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // First, get the total count for pagination
    let countQuery = supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true });

    // Filter by userId if provided
    if (userId) {
      countQuery = countQuery.eq('user_id', userId);
    }

    // Apply the same filters to count query
    if (filters.rating) {
      const ratingNum = parseFloat(filters.rating);
      countQuery = countQuery.gte('rating', ratingNum).lt('rating', ratingNum + 1);
    }

    if (filters.cigarName) {
      countQuery = countQuery.ilike('cigar_name', `%${filters.cigarName}%`);
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
        countQuery = countQuery.gte('review_date', startDate.toISOString().split('T')[0]);
      }
    }

    // Get total count
    const { count } = await countQuery;
    setTotalCount(count || 0);
    
    // Now get the actual data
    let query = supabase
      .from('reviews')
      .select(`
        *,
        profiles!inner(id, first_name, last_name, avatar_url)
      `)
      .range(from, to);

    // Filter by userId if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

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

    // Apply sorting based on review_date (smoked on date)
    switch (filters.sortBy) {
      case 'oldest':
        query = query.order('review_date', { ascending: true }).order('created_at', { ascending: true }); // oldest smoked first
        break;
      case 'rating_high':
        query = query.order('rating', { ascending: false }).order('review_date', { ascending: false });
        break;
      case 'rating_low':
        query = query.order('rating', { ascending: true }).order('review_date', { ascending: false });
        break;
      case 'cigar_name':
        query = query.order('cigar_name', { ascending: true }).order('review_date', { ascending: false });
        break;
      default: // 'newest'
        query = query.order('review_date', { ascending: false }).order('created_at', { ascending: false }); // newest smoked first
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching reviews:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load reviews',
        color: 'red',
      });
      setReviews([]);
    } else {
      setReviews(data || []);
    }
    
    setLoading(false);
  }, [supabase, filters, currentPage, pageSize, user?.id, userId, initialReviews]);

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user, currentPage, fetchReviews]);

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
        const { data: newReview, error } = await supabase
          .from('reviews')
          .insert({
            user_id: user!.id,
            cigar_name: reviewData.cigar_name,
            rating: reviewData.rating,
            notes: reviewData.notes,
            review_date: reviewData.review_date,
            images: reviewData.images || []
          })
          .select('id')
          .single();
          
        if (error) throw error;
        
        // Send notifications to followers about the new post
        if (newReview?.id) {
          fetch('/api/notifications/new-post', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reviewId: newReview.id }),
          }).catch(error => {
            console.error('Failed to send post notifications:', error);
            // Don't fail the review creation if notifications fail
          });
        }
        
        notifications.show({
          title: 'Success',
          message: 'Review created successfully',
          color: 'green',
        });
      }
      
      setShowForm(false);
      setEditingReview(null);
      // Reset pagination and refetch
      setCurrentPage(1);
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
      onConfirm: () => performActualDelete(reviewId),
    });
  };

  const performActualDelete = async (reviewId: string) => {
    console.log('Performing delete for review:', reviewId);
    
    try {
      console.log('Attempting to delete review:', reviewId, 'for user:', user?.id);
      
      const { error, data } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user?.id)
        .select();
        
      console.log('Delete result:', { error, data, dataLength: data?.length });
        
      if (error) {
        console.error('Delete error:', error);
        notifications.show({
          title: 'Error',
          message: `Failed to delete review: ${error.message}`,
          color: 'red',
        });
      } else if (!data || data.length === 0) {
        console.error('No rows deleted - user may not own this review or review not found');
        notifications.show({
          title: 'Error',
          message: 'Review not found or you can only delete your own reviews',
          color: 'red',
        });
      } else {
        console.log('Delete successful:', data);
        notifications.show({
          title: 'Success',
          message: 'Review deleted successfully',
          color: 'green',
        });
        
        // Refetch the reviews
        fetchReviews();
      }
    } catch (err) {
      console.error('Unexpected error during delete:', err);
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred while deleting the review',
        color: 'red',
      });
    }
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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.rating && filters.rating.trim()) count++;
    if (filters.dateRange && filters.dateRange.trim()) count++;
    if (filters.cigarName && filters.cigarName.trim()) count++;
    if (filters.sortBy && filters.sortBy !== 'newest') count++;
    return count;
  };



  if (showForm) {
    return (
      <Box 
        style={{ 
          minHeight: '100vh',
          background: 'rgb(18, 18, 23)',
          paddingTop: '70px',
        }}
      >
        <Box
          px={{ base: 0, sm: 'md' }}
          py={{ base: 0, sm: 'md' }}
          style={{ 
            position: 'relative', 
            maxWidth: '600px', 
            margin: '0 auto',
            overflow: 'visible',
          }}
          w={{ base: '100%', sm: 'auto' }}
          maw={{ base: '100%', sm: '600px' }}
        >
          {/* Header */}
          <Group justify="space-between" align="center" mb="lg" px={{ base: 'md', sm: 0 }} pt="lg">
            <Group gap="md">
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => {
                  setShowForm(false);
                  setEditingReview(null);
                }}
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Title
                order={1}
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '2rem',
                  fontWeight: 600,
                }}
              >
                {editingReview ? 'Edit Review' : 'New Review'}
              </Title>
            </Group>
          </Group>

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
          
          {/* Bottom spacing */}
          <Box h="4rem" />
        </Box>
      </Box>
    );
  }



  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .mobile-no-radius { border-radius: 0 !important; }
        }
        
        /* Fix dropdown animations and z-index issues */
        [data-mantine-component="Combobox"] [data-mantine-component="ComboboxDropdown"],
        [data-floating-ui-portal],
        .mantine-Select-dropdown {
          animation: none !important;
          transform: none !important;
          transition: none !important;
        }
        
        [data-mantine-portal],
        .mantine-Menu-dropdown {
          z-index: 10000 !important;
        }
      `}</style>
      

      
      <Box 
        p={{ base: 0, sm: 'md' }}
        style={{ 
          minHeight: 'calc(100vh - 70px)',
          background: 'rgb(18, 18, 23)',
          position: 'relative',
          paddingTop: '70px',
        }}
      >


      <Box
        px={{ base: 0, sm: 'md' }}
        py={{ base: 0, sm: 'md' }}
        style={{ 
          position: 'relative', 
          maxWidth: '600px', 
          margin: '0 auto',
          overflow: 'visible',
        }}
        w={{ base: '100%', sm: 'auto' }}
        maw={{ base: '100%', sm: '600px' }}
      >

        {/* Filter Button and Active Filters */}
        {showFilters && (
          <Group justify="space-between" align="center" wrap="wrap" gap="md" mt="lg" mb="lg" px={{ base: 'md', sm: 0 }}>
            <Group gap="md">
              <Button
              leftSection={<IconFilter size={18} />}
              onClick={() => {
                setPendingFilters(filters); // Initialize pending filters with current filters
                setFilterModalOpen(!filterModalOpen);
              }}
              variant="subtle"
              radius="xl"
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <Group gap="xs" wrap="nowrap">
                <Text>Filters</Text>
                {getActiveFiltersCount() > 0 && (
                  <Badge
                    size="xs"
                    style={{
                      backgroundColor: '#ffc144',
                      color: '#000',
                      minWidth: '18px',
                      height: '18px',
                      fontSize: '10px',
                      fontWeight: 700,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Group>
            </Button>
            


          </Group>

          {showAddButton && (
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => setShowForm(true)}
              radius="xl"
              style={{
                backgroundColor: '#fff',
                border: 'none',
                fontWeight: 600,
                color: '#000',
              }}
            >
              <Text visibleFrom="sm">New Review</Text>
              <Text hiddenFrom="sm">New</Text>
            </Button>
          )}
          </Group>
        )}

        {/* Filter Panel */}
        {showFilters && filterModalOpen && (
          <Paper
            p="md"
            mb="lg"
            mx={{ base: 'md', sm: 0 }}
            radius="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              position: 'relative',
              zIndex: 100,
              pointerEvents: 'auto',
            }}
          >
            <Stack gap="md">
              {/* Rating Filter */}
              <div>
                <Text size="sm" fw={500} mb="xs" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Rating</Text>
                <Select
                  placeholder="All Ratings"
                  value={pendingFilters.rating}
                  onChange={(value) => setPendingFilters(prev => ({ ...prev, rating: value || '' }))}
                  data={[
                    { value: '', label: 'All Ratings' },
                    { value: '4', label: '4+ Stars' },
                    { value: '3', label: '3+ Stars' },
                    { value: '2', label: '2+ Stars' },
                    { value: '1', label: '1+ Stars' },
                  ]}
                  clearable
                  styles={{
                    input: {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'rgba(255, 255, 255, 0.9)',
                      position: 'relative',
                      zIndex: 1,
                      pointerEvents: 'auto',
                    },
                    dropdown: {
                      backgroundColor: 'rgba(30, 30, 40, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      zIndex: 1000,
                      animation: 'none !important',
                      transform: 'none !important',
                      transition: 'none !important',
                    }
                  }}
                />
              </div>

              {/* Date Range Filter */}
              <div>
                <Text size="sm" fw={500} mb="xs" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Date Range</Text>
                <Select
                  placeholder="All Time"
                  value={pendingFilters.dateRange}
                  onChange={(value) => setPendingFilters(prev => ({ ...prev, dateRange: value || '' }))}
                  data={[
                    { value: '', label: 'All Time' },
                    { value: 'week', label: 'Last Week' },
                    { value: 'month', label: 'Last Month' },
                    { value: 'year', label: 'Last Year' },
                  ]}
                  clearable
                  styles={{
                    input: {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'rgba(255, 255, 255, 0.9)',
                      position: 'relative',
                      zIndex: 1,
                      pointerEvents: 'auto',
                    },
                    dropdown: {
                      backgroundColor: 'rgba(30, 30, 40, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      zIndex: 1000,
                      animation: 'none !important',
                      transform: 'none !important',
                      transition: 'none !important',
                    }
                  }}
                />
              </div>

              {/* Cigar Name Search */}
              <div>
                <Text size="sm" fw={500} mb="xs" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Search Cigar</Text>
                <TextInput
                  placeholder="Type cigar name..."
                  value={pendingFilters.cigarName}
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, cigarName: e.target.value }))}
                  leftSection={<IconSearch size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                  styles={{
                    input: {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'rgba(255, 255, 255, 0.9)',
                      position: 'relative',
                      zIndex: 1,
                      pointerEvents: 'auto',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)',
                      }
                    }
                  }}
                />
              </div>

              {/* Sort By */}
              <div>
                <Text size="sm" fw={500} mb="xs" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Sort By</Text>
                <Select
                  value={pendingFilters.sortBy}
                  onChange={(value) => setPendingFilters(prev => ({ ...prev, sortBy: value || 'newest' }))}
                  data={[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'oldest', label: 'Oldest First' },
                    { value: 'rating_high', label: 'Highest Rated' },
                    { value: 'rating_low', label: 'Lowest Rated' },
                    { value: 'cigar_name', label: 'Cigar Name' },
                  ]}
                  styles={{
                    input: {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'rgba(255, 255, 255, 0.9)',
                      position: 'relative',
                      zIndex: 1,
                      pointerEvents: 'auto',
                    },
                    dropdown: {
                      backgroundColor: 'rgba(30, 30, 40, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      zIndex: 1000,
                      animation: 'none !important',
                      transform: 'none !important',
                      transition: 'none !important',
                    }
                  }}
                />
              </div>

              {/* Action Buttons */}
              <Group justify="space-between" mt="sm">
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    setPendingFilters({
                      rating: '',
                      dateRange: '',
                      cigarName: '',
                      sortBy: 'newest'
                    });
                  }}
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setFilters(pendingFilters); // Apply the pending filters
                    setFilterModalOpen(false);
                  }}
                  style={{
                    backgroundColor: '#fff',
                    color: '#000',
                    fontWeight: 600,
                  }}
                >
                  Apply
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}





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
            
            p="3rem" 
            mx={{ base: 'md', sm: 0 }}
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
                    backgroundColor: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    color: '#000',
                    padding: '1rem 2rem',
                  }}
                >
                  Write the first review
                </Button>
              </Stack>
            </Center>
          </Paper>
        ) : (
          <Stack 
            gap="lg"
          >
            {reviews.map((review) => (
              <Card
                key={review.id}
                padding={0}
                radius="lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                }}
                className="mobile-no-radius"
              >
                {/* Post Header */}
                <Box px={{ base: 'md', sm: 'md' }} py="md">
                  <Group justify="space-between" align="center">
                    <Group
                      gap="sm"
                      style={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/profile/${review.profiles.id}`)}
                    >
                      <Avatar
                        src={review.profiles.avatar_url}
                        size="md"
                        radius="xl"
                        color="brand"
                      >
                        {getInitials(review.profiles.first_name, review.profiles.last_name)}
                      </Avatar>
                      <Stack gap={2}>
                        <Text fw={600} size="sm" style={{ color: '#fff' }}>
                          {review.profiles.first_name} {review.profiles.last_name}
                        </Text>
                        <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {getTimeAgo(review.created_at)}
                        </Text>
                      </Stack>
                    </Group>
                    
                    {review.user_id === user?.id && (
                      <Menu width={200} withinPortal>
                        <Menu.Target>
                          <ActionIcon variant="subtle" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown 
                          style={{
                            backgroundColor: 'rgba(30, 30, 40, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 10000,
                          }}
                        >
                          <Menu.Item
                            leftSection={<IconEdit size={16} />}
                            onClick={() => handleEditReview(review)}
                            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                          >
                            Edit Post
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconTrash size={16} />}
                            onClick={() => handleDeleteReview(review.id)}
                            style={{ color: 'rgba(255, 100, 100, 0.9)' }}
                          >
                            Delete Post
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    )}
                  </Group>
                </Box>

                {/* Images */}
                {review.images && review.images.length > 0 && (
                  <OptimizedImageCarousel 
                    images={review.images} 
                    height={400}
                    radius="0"
                    fullWidth={true}
                  />
                )}

                {/* Content */}
                <Box px={{ base: 'md', sm: 'md' }} py="md">
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Title order={4} style={{ color: '#fff', fontSize: '1.1rem' }}>
                        {review.cigar_name}
                      </Title>
                      <StarRating rating={review.rating} readonly size={18} />
                    </Group>
                    
                    {review.notes && (
                      <Text size="sm" style={{ lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.9)' }}>
                        {review.notes}
                      </Text>
                    )}
                  </Stack>
                </Box>

                {/* Actions */}
                <Box px={{ base: 'md', sm: 'md' }} pb="md">
                  <Group justify="space-between" align="center">
                    <SocialActions 
                      reviewId={review.id}
                      userId={user?.id || null}
                      showInlineComments={true}
                    />
                    <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      {formatDate(review.review_date)}
                    </Text>
                  </Group>
                </Box>
              </Card>
            ))}
            
            {/* Pagination Controls */}
            {totalCount > pageSize && (
              <Box 
                p="lg" 
                mx={{ base: 'md', sm: 0 }}
                mt="xl"
                mb="xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                }}
                className="mobile-no-radius"
              >
                <Stack gap="md" align="center">
                  {/* Page Size Selector */}
                  <Group gap="md" justify="center">
                    <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Show:
                    </Text>
                    <Select
                      value={pageSize.toString()}
                      onChange={(value) => {
                        setPageSize(parseInt(value || '10'));
                        setCurrentPage(1);
                      }}
                      data={[
                        { value: '5', label: '5 per page' },
                        { value: '10', label: '10 per page' },
                        { value: '20', label: '20 per page' },
                        { value: '50', label: '50 per page' },
                      ]}
                      size="sm"
                      radius="lg"
                      w={140}
                      styles={{
                        input: {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '14px',
                          '&:focus': {
                            borderColor: 'rgba(255, 193, 68, 0.5)',
                          }
                        },
                        dropdown: {
                          backgroundColor: 'rgba(18, 18, 23, 0.95)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(20px)',
                        },
                        option: {
                          color: 'rgba(255, 255, 255, 0.9)',
                        }
                      }}
                    />
                  </Group>

                  {/* Pagination Info */}
                  <Text size="sm" ta="center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {totalCount === 0 ? 'No reviews' : 
                     `Showing ${((currentPage - 1) * pageSize) + 1}-${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} reviews`}
                  </Text>
                  
                  {/* Pagination Controls */}
                  <Group gap="sm" justify="center">
                    <ActionIcon
                      variant="subtle"
                      size="lg"
                      radius="lg"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                      style={{
                        color: currentPage === 1 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                        backgroundColor: currentPage === 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <IconChevronsLeft size={18} />
                    </ActionIcon>
                    
                    <ActionIcon
                      variant="subtle"
                      size="lg"
                      radius="lg"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      style={{
                        color: currentPage === 1 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                        backgroundColor: currentPage === 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <IconChevronLeft size={18} />
                    </ActionIcon>
                    
                    <Box
                      px="lg"
                      py="sm"
                      style={{
                        backgroundColor: 'rgba(255, 193, 68, 0.15)',
                        border: '1px solid rgba(255, 193, 68, 0.3)',
                        borderRadius: '8px',
                        minWidth: '120px',
                        textAlign: 'center',
                      }}
                    >
                      <Text size="sm" fw={500} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                      </Text>
                    </Box>
                    
                    <ActionIcon
                      variant="subtle"
                      size="lg"
                      radius="lg"
                      disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / pageSize), prev + 1))}
                      style={{
                        color: currentPage >= Math.ceil(totalCount / pageSize) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                        backgroundColor: currentPage >= Math.ceil(totalCount / pageSize) ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <IconChevronRight size={18} />
                    </ActionIcon>
                    
                    <ActionIcon
                      variant="subtle"
                      size="lg"
                      radius="lg"
                      disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                      onClick={() => setCurrentPage(Math.ceil(totalCount / pageSize))}
                      style={{
                        color: currentPage >= Math.ceil(totalCount / pageSize) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                        backgroundColor: currentPage >= Math.ceil(totalCount / pageSize) ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <IconChevronsRight size={18} />
                    </ActionIcon>
                  </Group>
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </Box>
      
      {/* Bottom spacing */}
      <Box pb="4xl" />
    </Box>
    </>
  );
} 