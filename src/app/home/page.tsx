import { Container, Title, Text, Grid, GridCol, Stack, Group, Badge, Avatar, Box } from '@mantine/core';
import { IconStar, IconEye, IconUsers, IconTrendingUp, IconPlus, IconCalendar, IconHeart, IconMessageCircle, IconShare } from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import ImageCarousel from '@/components/ImageCarousel';
import DashboardCard from '@/components/DashboardCard';
import InteractiveCard from '@/components/InteractiveCard';

export default async function HomePage() {
  const supabase = await createClient();
  
  // Get recent reviews
  const { data: recentReviews } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles!inner (
        id,
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(4);

  // Get user stats
  const { count: totalReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

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
          top: '10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255, 193, 68, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      <Box
        style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255, 154, 0, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse',
          zIndex: 0,
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(255, 193, 68, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 10s ease-in-out infinite',
          zIndex: 0,
        }}
      />

      <Container size="xl" py="xl" style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Stack gap="xl" mb="xl">
          <Box ta="center" py={{ base: 'xl', md: '4rem' }}>
            <Title
              order={1}
              size="4rem"
              fw={800}
              mb="lg"
              style={{
                background: 'linear-gradient(135deg, #ffc144 0%, #ff9a00 50%, #ffc144 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                textShadow: '0 0 40px rgba(255, 193, 68, 0.3)',
              }}
            >
              Welcome to Puros
            </Title>
            <Text
              size="xl"
              style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.6,
                fontSize: 'clamp(1.1rem, 3vw, 1.25rem)',
              }}
              visibleFrom="sm"
            >
              Discover, review, and share your passion for premium cigars with a community of enthusiasts
            </Text>
          </Box>

          {/* Quick Stats */}
          <Group justify="center" gap="xl" mb="xl">
            <Stack align="center" gap="xs">
              <Text
                size="2rem"
                fw={700}
                style={{
                  background: 'linear-gradient(135deg, #ffc144 0%, #ff9a00 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {totalReviews || 0}
              </Text>
              <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Reviews
              </Text>
            </Stack>
            <Stack align="center" gap="xs">
              <Text
                size="2rem"
                fw={700}
                style={{
                  background: 'linear-gradient(135deg, #ffc144 0%, #ff9a00 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {totalUsers || 0}
              </Text>
              <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Members
              </Text>
            </Stack>
          </Group>
        </Stack>

        {/* Dashboard Cards */}
        <Grid mb="xl">
          <GridCol span={{ base: 12, sm: 6, md: 3 }}>
            <DashboardCard
              href="/feed"
              icon={<IconEye size={32} style={{ color: '#ffc144' }} />}
              title="Browse Reviews"
              description="Explore the latest cigar reviews from our community"
              actionText="View Feed"
            />
          </GridCol>
          <GridCol span={{ base: 12, sm: 6, md: 3 }}>
            <DashboardCard
              href="/review/new"
              icon={<IconPlus size={32} style={{ color: '#ffc144' }} />}
              title="Write Review"
              description="Share your thoughts on your latest cigar experience"
              actionText="New Review"
            />
          </GridCol>
          <GridCol span={{ base: 12, sm: 6, md: 3 }}>
            <DashboardCard
              icon={<IconUsers size={32} style={{ color: 'rgba(255, 193, 68, 0.8)' }} />}
              title="Community"
              description="Connect with fellow cigar enthusiasts"
              actionText="Coming Soon"
              isComingSoon={true}
            />
          </GridCol>
          <GridCol span={{ base: 12, sm: 6, md: 3 }}>
            <DashboardCard
              icon={<IconTrendingUp size={32} style={{ color: 'rgba(255, 193, 68, 0.8)' }} />}
              title="Trending"
              description="Discover the most popular cigars this month"
              actionText="Coming Soon"
              isComingSoon={true}
            />
          </GridCol>
        </Grid>

        {/* Recent Reviews */}
        {recentReviews && recentReviews.length > 0 && (
          <Stack gap="xl">
            <Group justify="space-between" align="center">
              <Title
                order={2}
                style={{
                  background: 'linear-gradient(135deg, #ffc144 0%, #ff9a00 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontSize: '2rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                Recent Reviews
              </Title>
              <Link 
                href="/feed" 
                style={{ 
                  color: '#ffc144', 
                  textDecoration: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                }}
              >
                View All →
              </Link>
            </Group>

            <Grid>
              {recentReviews.map((review) => (
                <GridCol key={review.id} span={{ base: 12, sm: 6, lg: 3 }}>
                  <InteractiveCard>
                    <Stack gap="md">
                      {/* Review Images */}
                      {review.image_urls && review.image_urls.length > 0 && (
                        <ImageCarousel 
                          images={review.image_urls} 
                          height={250}
                          fullWidth={true}
                        />
                      )}

                      {/* Review Content */}
                      <Stack gap="sm">
                        <Group justify="space-between" align="flex-start">
                          <Stack gap={4} style={{ flex: 1 }}>
                            <Text 
                              fw={600} 
                              size="lg" 
                              lineClamp={1}
                              style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                            >
                              {review.cigar_name}
                            </Text>
                            <Text 
                              size="sm" 
                              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            >
                              {review.brand}
                            </Text>
                          </Stack>
                          <Badge
                            variant="light"
                            color="orange"
                            size="sm"
                            leftSection={<IconStar size={12} />}
                            style={{
                              background: 'rgba(255, 193, 68, 0.15)',
                              color: '#ffc144',
                              border: '1px solid rgba(255, 193, 68, 0.3)',
                            }}
                          >
                            {review.rating}
                          </Badge>
                        </Group>

                        <Text 
                          size="sm" 
                          lineClamp={3}
                          style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                        >
                          {review.notes}
                        </Text>

                        {/* User Info */}
                        <Group gap="sm" mt="sm">
                          <Avatar
                            src={review.profiles?.avatar_url}
                            size="sm"
                            radius="xl"
                            style={{
                              border: '2px solid rgba(255, 193, 68, 0.3)',
                            }}
                          />
                          <Stack gap={2}>
                            <Text 
                              size="sm" 
                              fw={500}
                              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                            >
                              {review.profiles?.username}
                            </Text>
                            <Group gap="xs">
                              <IconCalendar size={12} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                              <Text 
                                size="xs" 
                                style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                              >
                                {new Date(review.created_at).toLocaleDateString()}
                              </Text>
                            </Group>
                          </Stack>
                        </Group>

                        {/* Social Actions */}
                        <Group gap="lg" mt="sm" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px' }}>
                          <Group gap="xs" style={{ cursor: 'pointer', color: 'rgba(255, 255, 255, 0.6)' }}>
                            <IconHeart size={16} />
                            <Text size="sm">0</Text>
                          </Group>
                          <Group gap="xs" style={{ cursor: 'pointer', color: 'rgba(255, 255, 255, 0.6)' }}>
                            <IconMessageCircle size={16} />
                            <Text size="sm">0</Text>
                          </Group>
                          <Group gap="xs" style={{ cursor: 'pointer', color: 'rgba(255, 255, 255, 0.6)' }}>
                            <IconShare size={16} />
                          </Group>
                        </Group>
                      </Stack>
                    </Stack>
                  </InteractiveCard>
                </GridCol>
              ))}
            </Grid>
          </Stack>
        )}

        {/* CTA Section */}
        <Box
          ta="center"
          py="4rem"
          mt="4rem"
          style={{
            background: 'rgba(255, 193, 68, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 193, 68, 0.2)',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(255, 193, 68, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              zIndex: 0,
            }}
          />
          <Stack gap="lg" style={{ position: 'relative', zIndex: 1 }}>
            <Title
              order={2}
              size="2.5rem"
              fw={700}
              style={{
                background: 'linear-gradient(135deg, #ffc144 0%, #ff9a00 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              Ready to Share Your Experience?
            </Title>
            <Text
              size="lg"
              style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                maxWidth: '500px',
                margin: '0 auto',
              }}
            >
              Join our community and start reviewing your favorite cigars today
            </Text>
            <Group justify="center" gap="md" mt="lg">
              <Link href="/review/new" style={{ textDecoration: 'none' }}>
                <Box
                  component="button"
                  style={{
                    background: 'linear-gradient(135deg, #ffc144 0%, #ff9a00 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 32px',
                    color: '#000',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 25px rgba(255, 193, 68, 0.3)',
                  }}
                  className="button-hover"
                >
                  Write Your First Review
                </Box>
              </Link>
              <Link href="/feed" style={{ textDecoration: 'none' }}>
                <Box
                  component="button"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 193, 68, 0.5)',
                    borderRadius: '12px',
                    padding: '14px 30px',
                    color: '#ffc144',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                  }}
                  className="button-hover-secondary"
                >
                  Explore Reviews
                </Box>
              </Link>
            </Group>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}