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
  Box,
  Group
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconMail, IconLock, IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';

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
            radial-gradient(circle at 20% 20%, rgba(255, 193, 68, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(255, 154, 0, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 40% 60%, rgba(255, 193, 68, 0.05) 0%, transparent 30%)
          `,
        }}
      />
      
      {/* Floating Orbs */}
      <Box
        style={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255, 193, 68, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255, 154, 0, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      <Container size="xs" style={{ position: 'relative', zIndex: 10 }} px={{ base: 'md', sm: 'xl' }}>
        <Center style={{ minHeight: '100vh' }}>
          <Stack w="100%" maw={420} px={{ base: 'sm', sm: 0 }}>
            {/* Header */}
            <Stack align="center" gap="xl" mb="xl">
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(255, 193, 68, 0.2) 0%, rgba(255, 154, 0, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 193, 68, 0.3)',
                  boxShadow: '0 8px 32px rgba(255, 193, 68, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Text size="2rem" fw={700} c="brand.4" style={{ fontFamily: 'serif' }}>
                  P
                </Text>
              </Box>
              <Stack align="center" gap="sm">
                <Title 
                  order={1} 
                  size="2.5rem" 
                  ta="center"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 193, 68, 0.8) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Welcome Back
                </Title>
                <Text c="dimmed" ta="center" size="lg" style={{ opacity: 0.8 }}>
                  Continue your cigar journey
                </Text>
              </Stack>
            </Stack>

            {/* Login Form */}
            <Paper
              shadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              p={{ base: 'xl', sm: '2rem' }}
              radius="xl"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              <form onSubmit={form.onSubmit(handleLogin)}>
                <Stack gap="xl">
                  <TextInput
                    label="Email Address"
                    placeholder="your@email.com"
                    leftSection={<IconMail size={18} />}
                    required
                    size="lg"
                    {...form.getInputProps('email')}
                    styles={{
                      label: {
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        marginBottom: '0.5rem',
                        color: 'rgba(255, 255, 255, 0.9)',
                      },
                      input: {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        padding: '1rem 1rem 1rem 3rem',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        '&:focus': {
                          borderColor: 'rgba(255, 193, 68, 0.6)',
                          backgroundColor: 'rgba(255, 255, 255, 0.12)',
                          boxShadow: '0 0 0 3px rgba(255, 193, 68, 0.1)',
                        },
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.4)',
                        }
                      },
                      section: {
                        color: 'rgba(255, 193, 68, 0.7)',
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
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        marginBottom: '0.5rem',
                        color: 'rgba(255, 255, 255, 0.9)',
                      },
                      input: {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        padding: '1rem 1rem 1rem 3rem',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        '&:focus': {
                          borderColor: 'rgba(255, 193, 68, 0.6)',
                          backgroundColor: 'rgba(255, 255, 255, 0.12)',
                          boxShadow: '0 0 0 3px rgba(255, 193, 68, 0.1)',
                        },
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.4)',
                        }
                      },
                      section: {
                        color: 'rgba(255, 193, 68, 0.7)',
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
                          backdropFilter: 'blur(10px)',
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
                      background: 'linear-gradient(135deg, #ffc144 0%, #ff9a00 100%)',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      padding: '1rem',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 8px 25px rgba(255, 193, 68, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 35px rgba(255, 193, 68, 0.4)',
                      }
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
                    color: '#ffc144',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ff9a00';
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#ffc144';
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  Sign up here
                </Anchor>
              </Text>
              
              <Anchor
                component={Link}
                href="/"
                style={{ 
                  textDecoration: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                }}
              >
                <Group gap="xs" justify="center">
                  <IconArrowLeft size={16} />
                  <Text size="sm" fw={500}>Back to home</Text>
                </Group>
              </Anchor>
            </Stack>
          </Stack>
        </Center>
      </Container>
    </Box>
  );
}