'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, ActionIcon, Group } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Image from 'next/image';

interface OptimizedImageCarouselProps {
  images: string[];
  height?: number;
  radius?: string;
  fullWidth?: boolean;
}

export default function OptimizedImageCarousel({ 
  images, 
  height = 400, 
  radius = 'md',
  fullWidth = false
}: OptimizedImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px', // Start loading when 50px away from viewport
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!images || images.length === 0) return null;

  // Single image - no carousel needed
  if (images.length === 1) {
    return (
      <Box 
        ref={containerRef}
        style={{ position: 'relative', maxWidth: fullWidth ? '100%' : '500px' }}
      >
        <Box
          style={{
            width: '100%',
            height: height,
            borderRadius: radius === 'md' ? '8px' : radius,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {isVisible ? (
            <>
              {/* Blurred background */}
              <Image
                src={images[0]}
                alt="Background"
                fill
                style={{ 
                  objectFit: 'cover',
                  filter: 'blur(20px)',
                  transform: 'scale(1.1)', // Slight scale to avoid blur edge artifacts
                  zIndex: 1,
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
                loading="lazy"
              />
              
              {/* Main image on top */}
              <Image
                src={images[0]}
                alt="Review image"
                fill
                style={{ 
                  objectFit: 'contain',
                  zIndex: 2,
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
                loading="lazy"
              />
            </>
          ) : (
            <Box
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '14px',
              }}
            >
              Loading image...
            </Box>
          )}
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
      ref={containerRef}
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {isVisible ? (
          <>
            {/* Blurred background */}
            <Image
              src={images[currentIndex]}
              alt="Background"
              fill
              style={{ 
                objectFit: 'cover',
                filter: 'blur(20px)',
                transform: 'scale(1.1)', // Slight scale to avoid blur edge artifacts
                zIndex: 1,
                transition: 'opacity 0.3s ease',
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={currentIndex === 0}
              loading={currentIndex === 0 ? "eager" : "lazy"}
            />
            
            {/* Main image on top */}
            <Image
              src={images[currentIndex]}
              alt={`Review image ${currentIndex + 1}`}
              fill
              style={{ 
                objectFit: 'contain',
                transition: 'opacity 0.3s ease',
                zIndex: 2,
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={currentIndex === 0} // Prioritize first image
              loading={currentIndex === 0 ? "eager" : "lazy"}
            />
          </>
        ) : (
          <Box
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
            }}
          >
            Loading images...
          </Box>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && isVisible && (
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
                zIndex: 20,
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
                zIndex: 20,
                opacity: currentIndex === images.length - 1 ? 0.5 : 1,
              }}
              onClick={goToNext}
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </>
        )}

        {/* Image Counter (top right) */}
        {images.length > 1 && isVisible && (
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
              zIndex: 20,
            }}
          >
            {currentIndex + 1}/{images.length}
          </Box>
        )}
      </Box>

      {/* Dot Indicators */}
      {images.length > 1 && isVisible && (
        <Group
          justify="center"
          gap="xs"
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
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

      {/* Preload next/previous images for better UX */}
      {isVisible && images.length > 1 && (
        <>
          {currentIndex > 0 && (
            <Box style={{ display: 'none' }}>
              <Image
                src={images[currentIndex - 1]}
                alt="Preloaded previous image"
                width={1}
                height={1}
                loading="lazy"
              />
            </Box>
          )}
          {currentIndex < images.length - 1 && (
            <Box style={{ display: 'none' }}>
              <Image
                src={images[currentIndex + 1]}
                alt="Preloaded next image"
                width={1}
                height={1}
                loading="lazy"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
} 