'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Anchor,
  Alert,
  Center,
  Box
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconMail, IconLock, IconAlertCircle } from '@tabler/icons-react';
import RouteGuard from '@/components/RouteGuard';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length > 0 ? null : 'Password is required'),
    },
  });

  const handleLogin = async (values: typeof form.values) => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setError(error.message);
      } else {
        notifications.show({
          title: 'Welcome back!',
          message: 'You have been successfully signed in',
          color: 'green',
        });
        router.push('/home');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteGuard requireAuth={false}>
      <Box
        style={{
          minHeight: '100vh',
          background: 'rgb(18, 18, 23)',
          position: 'relative',
        }}
      >
      <Container size="xs" style={{ position: 'relative', zIndex: 10 }} px={{ base: 'md', sm: 'xl' }}>
        <Center style={{ minHeight: '100vh' }}>
          <Stack w="100%" maw={420} px={{ base: 'sm', sm: 0 }}>
            {/* Header */}
            <Stack align="center" gap="lg" mb="xl">
              <img
                src="/images/puros-white.png"
                alt="Puros"
                style={{
                  height: '60px',
                  width: 'auto',
                }}
              />
              <Stack align="center" gap="sm">
                <Title 
                  order={1} 
                  size="2rem" 
                  ta="center"
                  style={{
                    color: '#fff',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Welcome Back
                </Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} ta="center" size="lg">
                  Continue your cigar journey
                </Text>
              </Stack>
            </Stack>

            {/* Login Form */}
            <Paper
              p={{ base: 'xl', sm: '2rem' }}
              radius="lg"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <form onSubmit={form.onSubmit(handleLogin)}>
                <Stack gap="lg">
                  <TextInput
                    label="Email Address"
                    placeholder="your@email.com"
                    leftSection={<IconMail size={18} />}
                    required
                    size="lg"
                    {...form.getInputProps('email')}
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
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        },
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.5)',
                        }
                      },
                      section: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    }}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    leftSection={<IconLock size={18} />}
                    required
                    size="lg"
                    {...form.getInputProps('password')}
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
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        },
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.5)',
                        }
                      },
                      section: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    }}
                  />

                  {error && (
                    <Alert
                      icon={<IconAlertCircle size={18} />}
                      color="red"
                      variant="light"
                      radius="lg"
                      styles={{
                        root: {
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                        },
                        icon: {
                          color: '#ef4444',
                        },
                        message: {
                          color: 'rgba(255, 255, 255, 0.9)',
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    size="lg"
                    radius="xl"
                    style={{
                      backgroundColor: '#fff',
                      color: '#000',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                    }}
                  >
                    Sign In
                  </Button>
                </Stack>
              </form>
            </Paper>

            {/* Footer Links */}
            <Stack align="center" gap="lg" mt="xl">
              <Text size="md" ta="center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Don&apos;t have an account?{' '}
                <Anchor 
                  component={Link} 
                  href="/signup" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Sign up here
                </Anchor>
              </Text>
            </Stack>
          </Stack>
        </Center>
      </Container>
    </Box>
    </RouteGuard>
  );
}