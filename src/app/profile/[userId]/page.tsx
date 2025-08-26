'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Box,
  Avatar,
  Loader,
  Center,
  Alert,
  Anchor,
  Badge,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconAlertCircle,
  IconUsers,
  IconUserPlus,
  IconUserMinus,
} from '@tabler/icons-react';
import { Profile } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import FeedTimeline from '@/components/FeedTimeline';

interface FollowStats {
  followers: number;
  following: number;
}

interface FollowStatus {
  isFollowing: boolean;
  followId: string | null;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userId = params?.userId as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [followStats, setFollowStats] = useState<FollowStats>({ followers: 0, following: 0 });
  const [followStatus, setFollowStatus] = useState<FollowStatus>({ isFollowing: false, followId: null });
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  const loadProfile = async () => {
    if (!userId) return;

    try {
      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profileData) {
        setError('Profile not found');
        return;
      }

      setProfile(profileData);

      // Load user's review count
      const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      setReviewCount(reviewsCount || 0);

      // Load follow stats
      const response = await fetch(`/api/follow/stats?user_id=${userId}`);
      if (response.ok) {
        const stats = await response.json();
        setFollowStats(stats);
      }

      // Load follow status for current user
      if (currentUser && currentUser.id !== userId) {
        const statusResponse = await fetch(`/api/follow/status?user_id=${userId}`);
        if (statusResponse.ok) {
          const status = await statusResponse.json();
          setFollowStatus(status);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId, currentUser]);

  const handleFollow = async () => {
    if (!currentUser || followLoading) return;

    setFollowLoading(true);
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ following_id: userId }),
      });

      if (response.ok) {
        setFollowStatus({ isFollowing: true, followId: null });
        setFollowStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to follow user');
      }
    } catch (err) {
      console.error('Error following user:', err);
      setError('Failed to follow user');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser || followLoading) return;

    setFollowLoading(true);
    try {
      const response = await fetch('/api/follow', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ following_id: userId }),
      });

      if (response.ok) {
        setFollowStatus({ isFollowing: false, followId: null });
        setFollowStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to unfollow user');
      }
    } catch (err) {
      console.error('Error unfollowing user:', err);
      setError('Failed to unfollow user');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
        }}
      >
        <Center style={{ minHeight: '100vh' }}>
          <Stack align="center" gap="lg">
            <Loader size="lg" color="#ffc144" />
            <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Loading profile...
            </Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  if (error && !profile) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
          padding: '2rem',
        }}
      >
        <Container size="md">
          <Alert
            icon={<IconAlertCircle size={18} />}
            color="red"
            variant="light"
            radius="lg"
          >
            {error}
          </Alert>
          <Group mt="lg">
            <Button variant="light" onClick={() => router.back()}>
              Go Back
            </Button>
          </Group>
        </Container>
      </Box>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Elements */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 25% 25%, rgba(255, 193, 68, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 154, 0, 0.06) 0%, transparent 50%)
          `,
        }}
      />

      <Box py="xl" style={{ position: 'relative', zIndex: 10 }}>
        <Box
          style={{ 
            maxWidth: '600px', 
            margin: '0 auto',
            paddingLeft: '1rem',
            paddingRight: '1rem',
          }}
        >
          {/* Header */}
          <Paper
            mb="xl"
            p="xl"
            radius="xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
          <Group justify="space-between" align="center">
            <Anchor
              component={Link}
              href="/home"
              style={{
                textDecoration: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                transition: 'all 0.2s ease',
              }}
            >
              <Group gap="sm">
                <IconArrowLeft size={20} />
                <Text fw={500}>Back to Home</Text>
              </Group>
            </Anchor>
          </Group>
        </Paper>

          {/* Profile Header */}
          {profile && (
            <Paper
              p="3rem"
              radius="2xl"
              mb="xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
            <Stack gap="xl">
              {/* Profile Info */}
              <Group align="flex-start" gap="xl">
                <Box style={{ position: 'relative' }}>
                  <Box
                    style={{
                      padding: '4px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ffc144 0%, #ff9a00 100%)',
                    }}
                  >
                    <Avatar
                      src={profile.avatar_url}
                      size={120}
                      radius="50%"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '3px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <Text size="3rem" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        👤
                      </Text>
                    </Avatar>
                  </Box>
                </Box>

                <Stack gap="md" style={{ flex: 1 }}>
                  <Group justify="space-between" align="flex-start">
                    <Stack gap="sm">
                      <Title
                        order={1}
                        style={{
                          background: 'linear-gradient(135deg, #ffffff 0%, #ffc144 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontSize: '2rem',
                          fontWeight: 700,
                        }}
                      >
                        {profile.first_name} {profile.last_name}
                      </Title>
                      
                      <Group gap="xl">
                        <Group gap="sm">
                          <IconUsers size={18} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                          <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                            <strong>{followStats.followers}</strong> followers
                          </Text>
                        </Group>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          <strong>{followStats.following}</strong> following
                        </Text>
                        <Badge
                          variant="light"
                          style={{
                            background: 'rgba(255, 193, 68, 0.15)',
                            color: '#ffc144',
                            border: '1px solid rgba(255, 193, 68, 0.3)',
                          }}
                        >
                          <strong>{reviewCount}</strong> reviews
                        </Badge>
                      </Group>
                    </Stack>

                    {/* Follow/Unfollow Button */}
                    {!isOwnProfile && currentUser && (
                      <Button
                        onClick={followStatus.isFollowing ? handleUnfollow : handleFollow}
                        loading={followLoading}
                        leftSection={
                          followStatus.isFollowing ? (
                            <IconUserMinus size={16} />
                          ) : (
                            <IconUserPlus size={16} />
                          )
                        }
                        variant={followStatus.isFollowing ? "light" : "filled"}
                        size="md"
                        radius="lg"
                        style={
                          followStatus.isFollowing
                            ? {
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                              }
                            : {
                                background: 'linear-gradient(135deg, #ffc144 0%, #ff9a00 100%)',
                                border: 'none',
                              }
                        }
                      >
                        {followStatus.isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                    )}
                  </Group>
                  
                  <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </Text>
                </Stack>
              </Group>
            </Stack>
            </Paper>
          )}

          {/* Error Alert */}
          {error && (
            <Alert
              icon={<IconAlertCircle size={18} />}
              color="red"
              variant="light"
              radius="lg"
              mb="lg"
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}
        </Box>

        {/* Timeline Section */}
        <FeedTimeline
          userId={userId}
          showFilters={false}
          showAddButton={isOwnProfile}
        />
      </Box>
    </Box>
  );
}
