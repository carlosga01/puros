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
  Group,
  Progress
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconMail, IconLock, IconAlertCircle, IconCheck } from '@tabler/icons-react';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => {
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      },
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
    },
  });

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleSignup = async (values: typeof form.values) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for a confirmation link!');
        notifications.show({
          title: 'Account Created!',
          message: 'Please check your email to verify your account',
          color: 'green',
        });
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(form.values.password);

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'rgb(18, 18, 23)',
        position: 'relative',
      }}
    >
      <Container size="xs" style={{ position: 'relative', zIndex: 10 }} px={{ base: 'md', sm: 'xl' }}>
        <Center style={{ minHeight: '100vh' }}>
          <Stack w="100%" maw={440} px={{ base: 'sm', sm: 0 }}>
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
                  Join the Club
                </Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} ta="center" size="lg">
                  Start your premium cigar journey
                </Text>
              </Stack>
            </Stack>

            {/* Signup Form */}
            <Paper
              p={{ base: 'xl', sm: '2rem' }}
              radius="lg"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <form onSubmit={form.onSubmit(handleSignup)}>
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

                  <Stack gap="md">
                    <PasswordInput
                      label="Password"
                      placeholder="Create a strong password"
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
                    
                    {form.values.password.length > 0 && (
                      <Stack gap="sm">
                        <Group justify="space-between">
                          <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Password strength
                          </Text>
                          <Text 
                            size="sm" 
                            fw={600}
                            style={{ 
                              color: passwordStrength < 50 ? '#ef4444' : passwordStrength < 100 ? '#f59e0b' : '#10b981'
                            }}
                          >
                            {passwordStrength < 50 ? 'Weak' : passwordStrength < 100 ? 'Good' : 'Strong'}
                          </Text>
                        </Group>
                        <Progress
                          value={passwordStrength}
                          color={passwordStrength < 50 ? 'red' : passwordStrength < 100 ? 'yellow' : 'green'}
                          size="md"
                          radius="xl"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          }}
                        />
                      </Stack>
                    )}
                  </Stack>

                  <PasswordInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    leftSection={<IconLock size={18} />}
                    required
                    size="lg"
                    {...form.getInputProps('confirmPassword')}
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

                  {message && (
                    <Alert
                      icon={<IconCheck size={18} />}
                      color="green"
                      variant="light"
                      radius="lg"
                      styles={{
                        root: {
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        },
                        icon: {
                          color: '#10b981',
                        },
                        message: {
                          color: 'rgba(255, 255, 255, 0.9)',
                        }
                      }}
                    >
                      {message}
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
                    Create Account
                  </Button>
                </Stack>
              </form>
            </Paper>

            {/* Footer Links */}
            <Stack align="center" gap="lg" mt="xl">
              <Text size="md" ta="center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Already have an account?{' '}
                <Anchor 
                  component={Link} 
                  href="/login" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Sign in here
                </Anchor>
              </Text>
            </Stack>
          </Stack>
        </Center>
      </Container>
    </Box>
  );
} 