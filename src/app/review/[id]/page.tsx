'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Title, 
  Text, 
  Group, 
  Stack,
  Box,
  Avatar,
  Anchor,
  Button,
  Card,
  Menu,
  ActionIcon,
  Loader,
  Center
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconDotsVertical, 
  IconEdit, 
  IconTrash 
} from '@tabler/icons-react';
import Link from 'next/link';
import StarRating from '../../../components/StarRating';
import OptimizedImageCarousel from '../../../components/OptimizedImageCarousel';
import SocialActions from '../../../components/SocialActions';
import Header from '../../../components/Header';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

interface Profile {
  first_name: string;
  last_name: string;
  avatar_url: string;
}

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
  profiles: Profile;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  review_id: string;
  profiles: Profile;
}

interface ReviewDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const [review, setReview] = useState<Review | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const { user } = useAuth();
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  
  const supabase = createClient();
  const router = useRouter();
  const COMMENTS_PER_PAGE = 10;

  useEffect(() => {
    const initializeData = async () => {
      try {
        const resolvedParams = await params;
        
        // Check if user is authenticated (handled by auth context)
        if (!user) {
          router.push('/login');
          return;
        }
        
        // Fetch review
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles!inner(first_name, last_name, avatar_url)
          `)
          .eq('id', resolvedParams.id)
          .single();

        if (reviewError || !reviewData) {
          router.push('/home');
          return;
        }
        
        setReview(reviewData as Review);
        
        // Fetch initial comments
        await fetchComments(resolvedParams.id, 1, true);
        
      } catch (error) {
        console.error('Error initializing data:', error);
        router.push('/home');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [params, router, supabase]);

  const fetchComments = async (reviewId: string, page: number, reset: boolean = false) => {
    setCommentsLoading(true);
    
    try {
      // Get total count
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('review_id', reviewId);

      setTotalComments(count || 0);

      // Get comments for this page
      const from = (page - 1) * COMMENTS_PER_PAGE;
      const to = from + COMMENTS_PER_PAGE - 1;

      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          review_id,
          profiles!comments_user_id_fkey(first_name, last_name, avatar_url)
        `)
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true })
        .range(from, to);

      if (error) throw error;

      const newComments = (commentsData || []).map(comment => ({
        ...comment,
        profiles: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles
      })) as Comment[];
      
      if (reset) {
        setComments(newComments);
      } else {
        setComments(prev => [...prev, ...newComments]);
      }

      setHasMoreComments((count || 0) > page * COMMENTS_PER_PAGE);
      setCommentsPage(page);
      
    } catch (error) {
      console.error('Error fetching comments:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load comments',
        color: 'red',
      });
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLoadMoreComments = () => {
    if (review && !commentsLoading) {
      fetchComments(review.id, commentsPage + 1, false);
    }
  };

  const handleDeleteReview = () => {
    if (!review) return;
    
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
          .eq('id', review.id);
          
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
          router.push('/home');
        }
      },
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
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Header>
        <Box
          style={{
            minHeight: 'calc(100vh - 70px)',
            background: 'rgb(18, 18, 23)',
            paddingTop: '70px',
          }}
        >
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
                Loading review...
              </Text>
            </Stack>
          </Center>
        </Box>
      </Header>
    );
  }

  if (!review) {
    return null;
  }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .mobile-no-radius {
            border-radius: 0 !important;
          }
        }
        
        /* Ensure Menu dropdowns appear correctly */
        [data-mantine-portal] {
          z-index: 10000 !important;
        }
        
        .mantine-Menu-dropdown {
          z-index: 10000 !important;
        }
      `}</style>
      
      <Header>
        <Box
          px={{ base: 0, sm: 'md' }}
          py={{ base: 0, sm: 'md' }}
          style={{ 
            position: 'relative', 
            maxWidth: '600px', 
            margin: '0 auto',
            overflow: 'visible',
            paddingTop: '70px',
          }}
          w={{ base: '100%', sm: 'auto' }}
          maw={{ base: '100%', sm: '600px' }}
        >
          {/* Back Navigation */}
          <Box px={{ base: 'md', sm: 0 }} py="md">
            <Anchor
              component={Link}
              href="/home"
              style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                '&:hover': {
                  color: 'rgba(255, 255, 255, 1)',
                }
              }}
            >
              <Group gap="xs">
                <IconArrowLeft size={18} />
                <Text size="sm">Back to Home</Text>
              </Group>
            </Anchor>
          </Box>

          {/* Review Card - Matching Home Style */}
          <Card
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
                        onClick={() => router.push(`/review/${review.id}/edit`)}
                        style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                      >
                        Edit Post
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash size={16} />}
                        onClick={handleDeleteReview}
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
                 showInlineComments={false}
               />
                <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  {formatDate(review.review_date)}
                </Text>
              </Group>
            </Box>
          </Card>

          {/* Comments Section */}
          <Card
            padding="md"
            radius="lg"
            mt="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            className="mobile-no-radius"
          >
            <Stack gap="lg">
              <Title order={4} style={{ color: '#fff' }}>
                Comments ({totalComments})
              </Title>
              
              {comments.length === 0 ? (
                <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }} ta="center" py="xl">
                  No comments yet. Be the first to comment!
                </Text>
              ) : (
                <Stack gap="lg">
                  {comments.map((comment) => (
                    <Group key={comment.id} align="flex-start" gap="md">
                      <Avatar
                        src={comment.profiles.avatar_url}
                        size="md"
                        radius="xl"
                        color="brand"
                      >
                        {getInitials(comment.profiles.first_name, comment.profiles.last_name)}
                      </Avatar>
                      <Stack gap="xs" style={{ flex: 1 }}>
                        <Group gap="sm">
                          <Text fw={500} size="sm" style={{ color: '#fff' }}>
                            {comment.profiles.first_name} {comment.profiles.last_name}
                          </Text>
                          <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            {getTimeAgo(comment.created_at)}
                          </Text>
                        </Group>
                        <Text size="sm" style={{ lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.9)' }}>
                          {comment.content}
                        </Text>
                      </Stack>
                    </Group>
                  ))}
                  
                  {/* Load More Button */}
                  {hasMoreComments && (
                    <Center mt="md">
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={handleLoadMoreComments}
                        loading={commentsLoading}
                        style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                        }}
                      >
                        Load More Comments
                      </Button>
                    </Center>
                  )}
                </Stack>
              )}
            </Stack>
                  </Card>
      </Box>
    </Header>
    </>
  );
} 