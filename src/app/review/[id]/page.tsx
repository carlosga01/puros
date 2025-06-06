import { createClient } from '@/utils/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  Group, 
  Stack,
  Box,
  Avatar,
  Divider,
  Anchor
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import StarRating from '../../../components/StarRating';
import ImageCarousel from '../../../components/ImageCarousel';
import SocialActions from '../../../components/SocialActions';
import { Profile, ReviewWithProfile } from '@/types/database';

interface ReviewDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch the specific review
  const { data: review, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles!inner(first_name, last_name, avatar_url)
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (error || !review) {
    notFound();
  }

  // Type the review data
  const typedReview = review as ReviewWithProfile;

  // Fetch all comments for this review
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      user_id,
      review_id,
      profiles!comments_user_id_fkey(first_name, last_name, avatar_url)
    `)
    .eq('review_id', resolvedParams.id)
    .order('created_at', { ascending: true });

  // Fetch likes and comments count
  const { count: likesCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('review_id', resolvedParams.id);

  const { count: commentsCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('review_id', resolvedParams.id);

  const safeComments = comments || [];
  const safeLikesCount = likesCount || 0;
  const safeCommentsCount = commentsCount || 0;

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

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(18, 18, 23, 0.95) 0%, rgba(30, 30, 40, 0.9) 100%)',
      }}
    >
      <Container size="md" py="xl">
        {/* Header */}
        <Paper
          shadow="sm"
          mb="xl"
          p={{ base: 'md', sm: 'lg' }}
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Group justify="space-between" align="center">
            <Anchor
              component={Link}
              href="/feed"
              c="dimmed"
              style={{ textDecoration: 'none' }}
            >
              <Group gap="xs">
                <IconArrowLeft size={18} />
                <Text size="sm">Back to Feed</Text>
              </Group>
            </Anchor>
            <Title order={1} size="h3" ta={{ base: 'right', sm: 'center' }}>
              Review Details
            </Title>
          </Group>
        </Paper>

        {/* Review Card */}
        <Paper
          shadow="xl"
          p="xl"
          radius="lg"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Stack gap="xl">
            {/* Post Header */}
            <Group justify="space-between">
              <Group gap="md">
                <Avatar
                  src={typedReview.profiles.avatar_url}
                  size="lg"
                  radius="xl"
                  color="brand"
                >
                  {getInitials(typedReview.profiles.first_name, typedReview.profiles.last_name)}
                </Avatar>
                <Stack gap={4}>
                  <Text fw={600} size="md">
                    {typedReview.profiles.first_name} {typedReview.profiles.last_name}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {getTimeAgo(typedReview.created_at)}
                  </Text>
                </Stack>
              </Group>
              <Text size="sm" c="dimmed">
                {formatDate(typedReview.review_date)}
              </Text>
            </Group>

            {/* Images */}
            {typedReview.images && typedReview.images.length > 0 && (
              <Box>
                <ImageCarousel 
                  images={typedReview.images} 
                  height={500}
                  radius="md"
                  fullWidth={true}
                />
              </Box>
            )}

            {/* Content */}
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Title order={3} c="brand.3">
                  {typedReview.cigar_name}
                </Title>
                <StarRating rating={typedReview.rating} readonly size={20} />
              </Group>
              
              {typedReview.notes && (
                <Text size="md" style={{ lineHeight: 1.7 }}>
                  {typedReview.notes}
                </Text>
              )}
            </Stack>

            <Divider />

            {/* Social Actions */}
            <Box>
              <SocialActions 
                reviewId={typedReview.id}
                userId={user?.id || null}
                initialLikesCount={safeLikesCount}
                initialCommentsCount={safeCommentsCount}
                showInlineComments={false}
              />
            </Box>
          </Stack>
        </Paper>

        {/* Comments Section */}
        <Paper
          shadow="xl"
          p="xl"
          radius="lg"
          mt="lg"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Stack gap="lg">
            <Title order={4}>
              Comments ({safeCommentsCount})
            </Title>
            
            {safeComments.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No comments yet. Be the first to comment!
              </Text>
            ) : (
              <Stack gap="lg">
                {safeComments.map((comment) => (
                  <Group key={comment.id} align="flex-start" gap="md">
                    <Avatar
                      src={(comment.profiles as unknown as Profile[])?.[0]?.avatar_url || (comment.profiles as unknown as Profile)?.avatar_url}
                      size="md"
                      radius="xl"
                      color="brand"
                    >
                      {getInitials(
                        (comment.profiles as Profile[])?.[0]?.first_name || (comment.profiles as unknown as Profile)?.first_name || '', 
                        (comment.profiles as Profile[])?.[0]?.last_name || (comment.profiles as unknown as Profile)?.last_name || ''
                      )}
                    </Avatar>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Group gap="sm">
                        <Text fw={500} size="sm">
                          {(comment.profiles as unknown as Profile[])?.[0]?.first_name || (comment.profiles as unknown as Profile)?.first_name} {(comment.profiles as unknown as Profile[])?.[0]?.last_name || (comment.profiles as unknown as Profile)?.last_name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDate(comment.created_at)}
                        </Text>
                      </Group>
                      <Text size="sm" style={{ lineHeight: 1.6 }}>
                        {comment.content}
                      </Text>
                    </Stack>
                  </Group>
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
} 