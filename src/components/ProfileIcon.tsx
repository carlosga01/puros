'use client';

import { useRouter } from 'next/navigation';
import { Avatar } from '@mantine/core';

interface Profile {
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

interface ProfileIconProps {
  profile: Profile;
  size?: string | number;
}

export default function ProfileIcon({ profile, size = 'md' }: ProfileIconProps) {
  const router = useRouter();

  const getInitials = () => {
    const firstInitial = profile.first_name?.charAt(0) || '';
    const lastInitial = profile.last_name?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const handleClick = () => {
    router.push('/profile');
  };

  return (
    <Avatar
      src={profile.avatar_url}
      alt={`${profile.first_name} ${profile.last_name}`}
      size={size}
      radius="xl"
      color="brand"
      style={{ cursor: 'pointer' }}
      onClick={handleClick}
    >
      {getInitials()}
    </Avatar>
  );
} 