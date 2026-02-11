'use client';

import { Box, Card, CardContent, Grid, Skeleton } from '@mui/material';

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <Box>
      {/* Header row */}
      <Box display="flex" gap={2} mb={1} px={2}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={32} />
        ))}
      </Box>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <Box key={row} display="flex" gap={2} px={2} py={1}>
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton key={col} variant="text" width={`${100 / columns}%`} height={24} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

export function CardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="60%" height={28} />
        <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
      </CardContent>
    </Card>
  );
}

export function StatsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Grid container spacing={2.5}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid item xs={12} sm={6} md={12 / count} key={i}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="30%" height={48} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
