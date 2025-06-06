'use client';

import { useState } from 'react';
import { Group, Text } from '@mantine/core';
import { IconStar, IconStarFilled, IconStarHalfFilled } from '@tabler/icons-react';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

export default function StarRating({ 
  rating, 
  onChange, 
  readonly = false, 
  size = 20 
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  const handleStarClick = (starRating: number) => {
    if (readonly || !onChange) return;
    onChange(starRating);
  };

  const handleStarHover = (starRating: number) => {
    if (readonly) return;
    setHoveredRating(starRating);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoveredRating(null);
  };

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const halfStarValue = index + 0.5;
    
    // Determine if this star should be filled, half-filled, or empty
    const isFull = displayRating >= starValue;
    const isHalf = displayRating >= halfStarValue && displayRating < starValue;
    
    let StarIcon = IconStar;
    if (isFull) {
      StarIcon = IconStarFilled;
    } else if (isHalf) {
      StarIcon = IconStarHalfFilled;
    }
    
    return (
      <div 
        key={index}
        style={{ 
          position: 'relative', 
          cursor: readonly ? 'default' : 'pointer',
          color: (isFull || isHalf) ? '#ffc107' : '#6c757d'
        }}
        onMouseLeave={handleMouseLeave}
      >
        <StarIcon size={size} />

        {/* Interactive areas for half and full stars */}
        {!readonly && (
          <>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '50%',
                height: '100%',
                cursor: 'pointer'
              }}
              onClick={() => handleStarClick(halfStarValue)}
              onMouseEnter={() => handleStarHover(halfStarValue)}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50%',
                height: '100%',
                cursor: 'pointer'
              }}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <Group gap="xs" align="center">
      <Group gap={2}>
        {[0, 1, 2, 3, 4].map(renderStar)}
      </Group>
      {!readonly && (
        <Text size="sm" c="dimmed">
          {displayRating.toFixed(1)}
        </Text>
      )}
    </Group>
  );
} 