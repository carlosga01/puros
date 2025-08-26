'use client';

import { useState, useEffect } from 'react';
import { Button } from '@mantine/core';
import { IconUserPlus, IconUserMinus } from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';

interface FollowButtonProps {
  userId: string;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'light' | 'outline' | 'subtle';
}

export function FollowButton({ 
  userId, 
  onFollowChange, 
  size = 'sm',
  variant = 'filled'
}: FollowButtonProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const response = await fetch(`/api/follow/status?user_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (err) {
        console.error('Error checking follow status:', err);
      }
    };

    if (user && user.id !== userId) {
      checkFollowStatus();
    }
  }, [userId, user]);

  // Don't show button if not authenticated or trying to follow self
  if (!user || user.id === userId) {
    return null;
  }

  const handleToggleFollow = async () => {
    setLoading(true);
    setError('');

    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch('/api/follow', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ following_id: userId }),
      });

      if (response.ok) {
        const newFollowingState = !isFollowing;
        setIsFollowing(newFollowingState);
        onFollowChange?.(newFollowingState);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update follow status');
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleFollow}
      loading={loading}
      leftSection={
        isFollowing ? (
          <IconUserMinus size={14} />
        ) : (
          <IconUserPlus size={14} />
        )
      }
      variant={isFollowing ? "light" : variant}
      size={size}
      radius="md"
      style={
        isFollowing
          ? {
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }
          : variant === 'filled' 
          ? {
              background: 'linear-gradient(135deg, #ffc144 0%, #ff9a00 100%)',
              border: 'none',
              color: 'rgba(0, 0, 0, 0.8)',
            }
          : {}
      }
      title={error || undefined}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
}
