'use client';

import { Box, Button, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      px={3}
      textAlign="center"
    >
      {icon && (
        <Box sx={{ mb: 2, color: '#86868B', fontSize: 48 }}>{icon}</Box>
      )}
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1D1D1F', mb: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ color: '#86868B', mb: 3, maxWidth: 360 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="outlined" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
