'use client';

import { Card } from '@mantine/core';
import { ReactNode } from 'react';

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  shadow?: string;
  padding?: string;
  radius?: string;
  style?: React.CSSProperties;
}

export default function InteractiveCard({ 
  children, 
  className,
  shadow = "0 20px 40px rgba(0, 0, 0, 0.2)",
  padding = "xl",
  radius = "xl",
  style = {}
}: InteractiveCardProps) {
  const defaultStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    transition: 'all 0.3s ease',
    ...style
  };

  return (
    <Card
      shadow={shadow}
      padding={padding}
      radius={radius}
      className={className}
      style={defaultStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.3)';
        e.currentTarget.style.borderColor = 'rgba(255, 193, 68, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      }}
    >
      {children}
    </Card>
  );
} 