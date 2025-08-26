'use client';

import { Paper, Stack, Box, Title, Text, Group } from '@mantine/core';
import Link from 'next/link';
import { ReactNode } from 'react';

interface DashboardCardProps {
  href?: string;
  icon: ReactNode;
  title: string;
  description: string;
  actionText: string;
  isComingSoon?: boolean;
}

export default function DashboardCard({ 
  href, 
  icon, 
  title, 
  description, 
  actionText, 
  isComingSoon = false 
}: DashboardCardProps) {
  const cardContent = (
    <Paper

      p="xl"
      radius="xl"
      className="card-hover"
      style={{
        background: isComingSoon ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: href ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        opacity: isComingSoon ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (href) {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.borderColor = 'rgba(255, 193, 68, 0.4)';
          e.currentTarget.style.background = 'rgba(255, 193, 68, 0.08)';
          e.currentTarget.style.boxShadow = '0 25px 50px rgba(255, 193, 68, 0.2)';
        } else {
          e.currentTarget.style.opacity = '0.9';
          e.currentTarget.style.transform = 'translateY(-4px)';
        }
      }}
      onMouseLeave={(e) => {
        if (href) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
        } else {
          e.currentTarget.style.opacity = '0.7';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <Stack gap="lg">
        <Box
          style={{
            width: 64,
            height: 64,
            borderRadius: '20px',
            background: isComingSoon 
              ? 'linear-gradient(135deg, rgba(255, 193, 68, 0.15) 0%, rgba(255, 154, 0, 0.08) 100%)'
              : 'linear-gradient(135deg, rgba(255, 193, 68, 0.2) 0%, rgba(255, 154, 0, 0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid rgba(255, 193, 68, ${isComingSoon ? '0.2' : '0.3'})`,
            boxShadow: `0 8px 25px rgba(255, 193, 68, ${isComingSoon ? '0.1' : '0.2'})`,
          }}
        >
          {icon}
        </Box>
        <div>
          <Title 
            order={3} 
            mb="sm" 
            style={{ 
              color: isComingSoon ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.95)', 
              fontSize: '1.4rem' 
            }}
          >
            {title}
          </Title>
          <Text 
            style={{ 
              color: isComingSoon ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.7)' 
            }} 
            size="md" 
            mb="lg" 
            lineClamp={2}
          >
            {description}
          </Text>
          <Group gap="sm" style={{ color: isComingSoon ? 'rgba(255, 193, 68, 0.8)' : '#ffc144' }}>
            <Text fw={600} size="md">
              {actionText}
            </Text>
            {href && <Text size="lg">→</Text>}
          </Group>
        </div>
      </Stack>
    </Paper>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
} 