import Link from 'next/link';
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Box,
  Center
} from '@mantine/core';
import { IconArrowRight, IconUsers } from '@tabler/icons-react';

export default function LandingPage() {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(18, 18, 23, 0.95) 0%, rgba(30, 30, 40, 0.9) 100%)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background Effects */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 25% 25%, rgba(255, 193, 68, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 154, 0, 0.1) 0%, transparent 50%)',
        }}
      />

      <Container size="xl" style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
        {/* Header */}
        <Group justify="space-between" align="center" py="lg">
          <Title
            order={1}
            size="h3"
            c="brand.6"
            style={{ fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            Puros
          </Title>
          
          <Group>
            <Button
              component={Link}
              href="/login"
              variant="subtle"
              color="gray"
              size="sm"
            >
              Sign In
            </Button>
          </Group>
        </Group>

        {/* Main Content */}
        <Center style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Stack align="center" gap="xl" ta="center" maw={800}>
            {/* Hero Title */}
            <Stack gap="md" align="center">
              <Title
                order={1}
                c="brand.6"
                style={{
                  fontSize: 'clamp(3rem, 12vw, 8rem)',
                  fontWeight: 900,
                  lineHeight: 0.9,
                  letterSpacing: '-0.05em',
                  textShadow: '0 0 40px rgba(255, 193, 68, 0.3)',
                }}
              >
                PUROS
              </Title>
              
              <Text
                size="xl"
                c="white"
                fw={300}
                style={{ letterSpacing: '0.02em' }}
              >
                Premium Cigar Community
              </Text>
            </Stack>

            {/* Description */}
            <Text
              size="lg"
              c="dimmed"
              fw={300}
              style={{ 
                lineHeight: 1.6,
                maxWidth: '600px',
              }}
            >
              Discover exceptional cigars, share detailed reviews, and connect with fellow aficionados 
              in the ultimate premium tobacco experience.
            </Text>

            {/* Features */}
            <Group justify="center" gap="xl" mt="md">
              <Stack align="center" gap="xs">
                <Box
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'rgba(255, 193, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconUsers size={24} color="var(--mantine-color-brand-6)" />
                </Box>
                <Text size="sm" c="dimmed" fw={500}>
                  Community
                </Text>
              </Stack>

              <Stack align="center" gap="xs">
                <Box
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'rgba(255, 193, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text size="xl" c="brand.6">⭐</Text>
                </Box>
                <Text size="sm" c="dimmed" fw={500}>
                  Reviews
                </Text>
              </Stack>

              <Stack align="center" gap="xs">
                <Box
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'rgba(255, 193, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text size="xl" c="brand.6">🔍</Text>
                </Box>
                <Text size="sm" c="dimmed" fw={500}>
                  Discovery
                </Text>
              </Stack>
            </Group>

            {/* CTA Buttons */}
            <Stack gap="md" align="center" mt="xl">
              <Button
                component={Link}
                href="/signup"
                size="xl"
                variant="gradient"
                gradient={{ from: 'brand.6', to: 'brand.8' }}
                rightSection={<IconArrowRight size={18} />}
                radius="xl"
                style={{
                  minWidth: 200,
                  boxShadow: '0 8px 32px rgba(255, 193, 68, 0.3)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                Join the Community
              </Button>
              
              <Text size="xs" c="dimmed">
                Already a member?{' '}
                <Text
                  component={Link}
                  href="/login"
                  c="brand.4"
                  style={{ textDecoration: 'none' }}
                  inherit
                >
                  Sign in here
                </Text>
              </Text>
            </Stack>
          </Stack>
        </Center>

        {/* Bottom accent */}
        <Box
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, transparent, var(--mantine-color-brand-6), transparent)',
          }}
        />
      </Container>
    </Box>
  );
}
