'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Box, Center, Stack, Loader, Text } from '@mantine/core';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const publicRoutes = ['/', '/login', '/signup'];

export default function RouteGuard({ children, requireAuth = true }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/auth');

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    // If route requires auth and user is not logged in, redirect to login
    if (requireAuth && !user && !isPublicRoute) {
      router.push('/login');
      return;
    }

    // If user is logged in and trying to access login/signup, redirect to home
    if (user && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
      router.push('/home');
      return;
    }
  }, [user, loading, requireAuth, isPublicRoute, pathname, router]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          background: 'rgb(18, 18, 23)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Center>
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
              Loading...
            </Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  // If route requires auth and user is not logged in, don't render children
  if (requireAuth && !user && !isPublicRoute) {
    return null;
  }

  // If user is logged in and on public route, don't render children (redirect will happen)
  if (user && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
    return null;
  }

  return <>{children}</>;
} 