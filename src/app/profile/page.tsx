'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Group,
  Box,
  Avatar,
  FileInput,
  Loader,
  Center,
  Alert,
  Anchor
} from '@mantine/core';
import { IconArrowLeft, IconCamera, IconAlertCircle, IconCheck } from '@tabler/icons-react';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setProfile(profile);
        setFirstName(profile.first_name || '');
        setLastName(profile.last_name || '');
        setProfilePictureUrl(profile.avatar_url || '');
      }
      setLoading(false);
    };
    getProfile();
  }, [router, supabase]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setProfilePictureUrl(url);
    }
  };

  const uploadProfilePicture = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let avatarUrl = profilePictureUrl;
      
      if (profilePicture) {
        avatarUrl = await uploadProfilePicture(profilePicture, user.id);
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Profile updated successfully!');
        setProfilePicture(null);
        // Refresh profile data
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (updatedProfile) {
          setProfile(updatedProfile);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
              radial-gradient(circle at 30% 30%, rgba(255, 193, 68, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(255, 154, 0, 0.06) 0%, transparent 50%)
            `,
          }}
        />
        
        <Center style={{ minHeight: '100vh', position: 'relative', zIndex: 10 }}>
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
              Loading profile...
            </Text>
          </Stack>
        </Center>
      </Box>
    );
  }

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
            radial-gradient(circle at 25% 25%, rgba(255, 193, 68, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 154, 0, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 193, 68, 0.04) 0%, transparent 40%)
          `,
        }}
      />

      {/* Floating Orbs */}
      <Box
        style={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255, 193, 68, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255, 154, 0, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 10s ease-in-out infinite reverse',
        }}
      />

      <Container size="md" py="xl" style={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <Paper
          shadow="0 20px 40px rgba(0, 0, 0, 0.3)"
          mb="xl"
          p={{ base: 'lg', sm: 'xl' }}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffc144';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              }}
            >
              <Group gap="sm">
                <IconArrowLeft size={20} />
                <Text fw={500}>Back to Home</Text>
              </Group>
            </Anchor>
            <Title 
              order={1} 
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #ffc144 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.8rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              My Profile
            </Title>
          </Group>
        </Paper>

        {/* Main Content */}
        <Paper
          shadow="0 25px 50px rgba(0, 0, 0, 0.3)"
          p={{ base: 'xl', sm: '3rem' }}
          radius="2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Form Background Glow */}
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120%',
              height: '120%',
              background: 'radial-gradient(circle, rgba(255, 193, 68, 0.05) 0%, transparent 70%)',
              filter: 'blur(60px)',
              zIndex: 0,
            }}
          />

          <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
            <Stack gap="2rem">
              {/* Profile Picture Section */}
              <Stack align="center" gap="lg">
                <Box style={{ position: 'relative' }}>
                  <Box
                    style={{
                      padding: '4px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ffc144 0%, #ff9a00 100%)',
                    }}
                  >
                    <Avatar
                      src={profilePictureUrl}
                      size={140}
                      radius="50%"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '3px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      {!profilePictureUrl && (
                        <Text size="3rem" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          👤
                        </Text>
                      )}
                    </Avatar>
                  </Box>
                  <FileInput
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="profile-picture-input"
                  />
                  <Box
                    component="label"
                    htmlFor="profile-picture-input"
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      width: 44,
                      height: 44,
                      background: 'linear-gradient(135deg, #ffc144 0%, #ff9a00 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 15px rgba(255, 193, 68, 0.4)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 193, 68, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 193, 68, 0.4)';
                    }}
                  >
                    <IconCamera size={20} color="rgba(0, 0, 0, 0.8)" />
                  </Box>
                </Box>
                <Text 
                  size="md" 
                  ta="center" 
                  maw={300}
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: 1.5,
                  }}
                >
                  Click the camera icon to update your profile picture
                </Text>
              </Stack>

              {/* Form Fields */}
              <Stack gap="xl">
                <Group grow>
                  <TextInput
                    label="First Name"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    size="lg"
                    radius="lg"
                    styles={{
                      label: {
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 500,
                        marginBottom: '0.5rem',
                        fontSize: '1rem',
                      },
                      input: {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '1rem',
                        padding: '1rem',
                        transition: 'all 0.2s ease',
                        '&:focus': {
                          borderColor: 'rgba(255, 193, 68, 0.6)',
                          backgroundColor: 'rgba(255, 255, 255, 0.12)',
                          boxShadow: '0 0 0 3px rgba(255, 193, 68, 0.1)',
                        },
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.4)',
                        }
                      }
                    }}
                  />
                  <TextInput
                    label="Last Name"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    size="lg"
                    radius="lg"
                    styles={{
                      label: {
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 500,
                        marginBottom: '0.5rem',
                        fontSize: '1rem',
                      },
                      input: {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '1rem',
                        padding: '1rem',
                        transition: 'all 0.2s ease',
                        '&:focus': {
                          borderColor: 'rgba(255, 193, 68, 0.6)',
                          backgroundColor: 'rgba(255, 255, 255, 0.12)',
                          boxShadow: '0 0 0 3px rgba(255, 193, 68, 0.1)',
                        },
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.4)',
                        }
                      }
                    }}
                  />
                </Group>

                <TextInput
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                  size="lg"
                  radius="lg"
                  description="Email address cannot be changed"
                  styles={{
                    label: {
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 500,
                      marginBottom: '0.5rem',
                      fontSize: '1rem',
                    },
                    input: {
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '1rem',
                      padding: '1rem',
                      cursor: 'not-allowed',
                    },
                    description: {
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.9rem',
                      marginTop: '0.5rem',
                    }
                  }}
                />
              </Stack>

              {/* Status Messages */}
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
                      fontSize: '1rem',
                    }
                  }}
                >
                  {error}
                </Alert>
              )}

              {success && (
                <Alert
                  icon={<IconCheck size={18} />}
                  color="green"
                  variant="light"
                  radius="lg"
                  styles={{
                    root: {
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      backdropFilter: 'blur(10px)',
                    },
                    icon: {
                      color: '#10b981',
                    },
                    message: {
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1rem',
                    }
                  }}
                >
                  {success}
                </Alert>
              )}

              {/* Save Button */}
              <Button
                type="submit"
                fullWidth
                loading={saving}
                disabled={!firstName.trim() || !lastName.trim()}
                size="xl"
                radius="xl"
                style={{
                  background: 'linear-gradient(135deg, #ffc144 0%, #ff9a00 100%)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  padding: '1.2rem',
                  boxShadow: '0 12px 40px rgba(255, 193, 68, 0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 16px 50px rgba(255, 193, 68, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 193, 68, 0.4)';
                }}
              >
                Save Changes
              </Button>

              {/* Profile Info */}
              {profile && (
                <Paper
                  p="xl"
                  radius="xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Title 
                    order={4} 
                    mb="lg"
                    style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                    }}
                  >
                    Account Information
                  </Title>
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Text 
                        size="md" 
                        style={{ 
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 500,
                        }}
                      >
                        Member since:
                      </Text>
                      <Text 
                        size="md" 
                        style={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: 600,
                        }}
                      >
                        {new Date(profile.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text 
                        size="md" 
                        style={{ 
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 500,
                        }}
                      >
                        Last updated:
                      </Text>
                      <Text 
                        size="md" 
                        style={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: 600,
                        }}
                      >
                        {new Date(profile.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </Group>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
} 