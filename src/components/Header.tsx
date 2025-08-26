'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AppShell,
  Group,
  ActionIcon,
  Avatar,
  Menu,
  Burger,
  Container,
  Box,
  Stack,
  Text
} from '@mantine/core';
import {
  IconUser,
  IconLogout,
  IconX
} from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  children: React.ReactNode;
}

export default function Header({ children }: HeaderProps) {
  const [opened, setOpened] = useState(false);
  const [profile, setProfile] = useState<{ first_name?: string; last_name?: string; avatar_url?: string } | null>(null);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getProfile = async () => {
      if (user) {
        // Get profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(profile);
      } else {
        setProfile(null);
      }
    };
    getProfile();
  }, [user, supabase]);

  const handleSignOut = async () => {
    try {
      await signOut();
      notifications.show({
        title: 'Signed out',
        message: 'You have been successfully signed out',
        color: 'green',
      });
      router.push('/login');
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to sign out',
        color: 'red',
      });
    }
  };



  return (
    <AppShell
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: true },
      }}
      padding={0}
      style={{
        '--mantine-color-body': 'transparent',
        position: 'relative',
        zIndex: 999,
      }}
    >
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '70px',
          background: 'rgb(18, 18, 23)',
          border: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 1000,
        }}
      >
        <Container size="100%" px="md" h="100%">
          <Group h="100%" justify="space-between" align="center">
            {/* Left side - Logo and Nav */}
            <Group gap="xl">
              <Link href="/home" style={{ textDecoration: 'none' }}>
                <img
                  src="/images/puros-white.png"
                  alt="Puros"
                  style={{
                    height: '40px',
                    width: 'auto',
                  }}
                />
              </Link>


            </Group>

            {/* Right side - Actions and Profile */}
            <Group gap="md">
              {/* Profile Menu */}
              <Menu radius="lg" position="bottom-end" withinPortal>
                <Menu.Target>
                  <ActionIcon
                    variant="subtle"
                    size="lg"
                    radius="xl"
                    style={{
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Avatar
                      src={profile?.avatar_url}
                      size="md"
                      radius="xl"
                    >
                      {profile?.first_name?.charAt(0) || user?.email?.charAt(0)}
                    </Avatar>
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown
                  style={{
                    background: 'rgba(18, 18, 23, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                    zIndex: 10000,
                  }}
                >
                  <Menu.Label style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : user?.email}
                  </Menu.Label>
                  <Menu.Item
                    leftSection={<IconUser size={16} />}
                    onClick={() => router.push('/profile')}
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    Profile
                  </Menu.Item>
                  <Menu.Divider style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }} />
                  <Menu.Item
                    leftSection={<IconLogout size={16} />}
                    onClick={handleSignOut}
                    style={{ 
                      color: 'rgba(255, 100, 100, 0.9)',
                    }}
                  >
                    Sign Out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>

              {/* Mobile Burger Menu */}
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                hiddenFrom="sm"
                size="sm"
                color="rgba(255, 255, 255, 0.8)"
              />
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Mobile Navigation */}
      <AppShell.Navbar
        style={{
          background: 'rgb(18, 18, 23)',
          border: 'none',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 1001,
        }}
        hiddenFrom="sm"
      >
        <Stack gap="xl" p="md" h="100%">
          {/* Close button */}
          <Group justify="flex-end">
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => setOpened(false)}
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              <IconX size={20} />
            </ActionIcon>
          </Group>

          {/* Logo */}
          <Group justify="center" mb="xl">
            <img
              src="/images/puros-white.png"
              alt="Puros"
              style={{
                height: '50px',
                width: 'auto',
              }}
            />
          </Group>

          {/* Content */}
          <Stack gap="lg" align="center" style={{ flex: 1, justifyContent: 'center' }}>
            <Stack gap="md" align="center" ta="center">
              <Text 
                size="lg" 
                fw={600} 
                style={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1.2rem'
                }}
              >
                More coming soon
              </Text>
              <Text 
                size="sm" 
                style={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineHeight: 1.5,
                  maxWidth: '200px'
                }}
              >
                                 We&apos;re working on exciting new features for your cigar journey
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <Box
        style={{
          minHeight: '100vh',
          background: 'rgb(18, 18, 23)',
        }}
      >
        {children}
      </Box>
    </AppShell>
  );
} 