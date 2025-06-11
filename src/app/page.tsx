import Link from 'next/link';
import {
  Container,
  Text,
  Button,
  Stack,
  Group,
  Box,
  Center
} from '@mantine/core';
import { IconStar } from '@tabler/icons-react';

export default function LandingPage() {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'rgb(18, 18, 23)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Container size="md" style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
        {/* Header */}
        <Group justify="space-between" align="center" py="lg">
          <img
            src="/images/puros-white.png"
            alt="Puros"
            style={{
              height: '32px',
              width: 'auto',
            }}
          />
          
          <Group>
            <Button
              component={Link}
              href="/login"
              variant="subtle"
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
              size="sm"
            >
              Sign In
            </Button>
          </Group>
        </Group>

        {/* Main Content */}
        <Center style={{ minHeight: 'calc(100vh - 140px)' }}>
          <Stack align="center" gap="xl" ta="center" maw={600}>
            {/* Hero Title */}
            <Stack gap="lg" align="center">
              <img
                src="/images/puros-white.png"
                alt="Puros"
                style={{
                  height: 'clamp(100px, 20vw, 240px)',
                  width: 'auto',
                }}
              />
              
              <Text
                size="xl"
                style={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  letterSpacing: '0.02em',
                  fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
                }}
              >
                Premium Cigar Community
              </Text>
            </Stack>

            {/* Description */}
            <Text
              size="lg"
              style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.6,
                maxWidth: '500px',
                fontSize: 'clamp(1rem, 3vw, 1.125rem)',
              }}
            >
              Discover exceptional cigars, share detailed reviews, and connect with fellow aficionados.
            </Text>

            {/* CTA Buttons */}
            <Stack gap="md" align="center" mt="xl">
              <Button
                component={Link}
                href="/signup"
                size="xl"
                radius="xl"
                style={{
                  backgroundColor: '#fff',
                  color: '#000',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  minWidth: '200px',
                  border: 'none',
                }}
                leftSection={<IconStar size={18} />}
              >
                Join the Community
              </Button>
              
              <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Already a member?{' '}
                <Text
                  component={Link}
                  href="/login"
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                  inherit
                >
                  Sign in here
                </Text>
              </Text>
            </Stack>
          </Stack>
        </Center>
      </Container>
    </Box>
  );
}
