'use client';

import { useState } from 'react';
import { Box, Image, ActionIcon, Group } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface ImageCarouselProps {
  images: string[];
  height?: number;
  radius?: string;
  fullWidth?: boolean;
}

export default function ImageCarousel({ 
  images, 
  height = 400, 
  radius = 'md',
  fullWidth = false
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  // Single image - no carousel needed
  if (images.length === 1) {
    return (
      <Box style={{ position: 'relative', maxWidth: fullWidth ? '100%' : '500px' }}>
        <Box
          style={{
            width: '100%',
            height: height,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: radius === 'md' ? '8px' : radius,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            src={images[0]}
            alt="Review image"
            fit="contain"
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Box>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <Box 
      style={{ 
        position: 'relative', 
        maxWidth: fullWidth ? '100%' : '500px',
        overflow: 'hidden',
        borderRadius: radius === 'md' ? '8px' : radius,
      }}
    >
      {/* Main Image */}
      <Box 
        style={{ 
          position: 'relative', 
          height,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          src={images[currentIndex]}
          alt={`Review image ${currentIndex + 1}`}
          fit="contain"
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <ActionIcon
              variant="filled"
              color="dark"
              size="lg"
              radius="xl"
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                zIndex: 10,
                opacity: currentIndex === 0 ? 0.5 : 1,
              }}
              onClick={goToPrevious}
            >
              <IconChevronLeft size={18} />
            </ActionIcon>

            <ActionIcon
              variant="filled"
              color="dark"
              size="lg"
              radius="xl"
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                zIndex: 10,
                opacity: currentIndex === images.length - 1 ? 0.5 : 1,
              }}
              onClick={goToNext}
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </>
        )}

        {/* Image Counter (top right) */}
        {images.length > 1 && (
          <Box
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 500,
              zIndex: 10,
            }}
          >
            {currentIndex + 1}/{images.length}
          </Box>
        )}
      </Box>

      {/* Dot Indicators */}
      {images.length > 1 && (
        <Group
          justify="center"
          gap="xs"
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          {images.map((_, index) => (
            <Box
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: index === currentIndex 
                  ? 'rgba(255, 255, 255, 0.9)' 
                  : 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </Group>
      )}
    </Box>
  );
} 