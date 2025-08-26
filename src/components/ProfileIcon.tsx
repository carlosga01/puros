'use client';

import { useRouter } from 'next/navigation';
import { Avatar } from '@mantine/core';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

interface ProfileIconProps {
  profile: Profile;
  size?: string | number;
  clickable?: boolean;
}

export default function ProfileIcon({ profile, size = 'md', clickable = true }: ProfileIconProps) {
  const router = useRouter();

  const getInitials = () => {
    const firstInitial = profile.first_name?.charAt(0) || '';
    const lastInitial = profile.last_name?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const handleClick = () => {
    if (clickable) {
      router.push(`/profile/${profile.id}`);
    }
  };

  return (
    <Avatar
      src={profile.avatar_url}
      alt={`${profile.first_name} ${profile.last_name}`}
      size={size}
      radius="xl"
      color="brand"
      style={{ cursor: clickable ? 'pointer' : 'default' }}
      onClick={handleClick}
    >
      {getInitials()}
    </Avatar>
  );
} 