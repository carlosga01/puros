'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
      notifications.show({
        title: 'Logged out',
        message: 'You have been successfully logged out',
        color: 'green',
      });
    } catch (error) {
      console.error('Error logging out:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to log out',
        color: 'red',
      });
    }
  };

  return (
    <Button
      variant="subtle"
      color="red"
      leftSection={<IconLogout size={16} />}
      onClick={handleLogout}
      size="sm"
    >
      Logout
    </Button>
  );
} 