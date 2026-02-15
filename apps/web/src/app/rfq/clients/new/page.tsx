'use client';

import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Box, Typography, Button, Breadcrumbs } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { rfqApi, type CreateClientData } from '@/lib/api';
import ClientForm from '@/components/rfq/ClientForm';

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (formData: CreateClientData) => {
    setLoading(true);
    setError(null);

    try {
      if (!formData.name || !formData.sector) {
        setError('שם לקוח וענף הם שדות חובה');
        setLoading(false);
        return;
      }

      const response = await rfqApi.clients.create(formData);
      if (response.success && response.data) {
        router.push(`/rfq/clients/${response.data.id}`);
      } else {
        setError('Failed to create client');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/rfq" style={{ textDecoration: 'none', color: 'inherit' }}>
          לוח בקרה
        </Link>
        <Link href="/rfq/clients" style={{ textDecoration: 'none', color: 'inherit' }}>
          לקוחות
        </Link>
        <Typography color="text.primary">לקוח חדש</Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            הוספת לקוח חדש
          </Typography>
          <Typography color="text.secondary">Add New Client</Typography>
        </Box>
        <Button
          component={Link}
          href="/rfq/clients"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          חזרה לרשימה
        </Button>
      </Box>

      <ClientForm onSubmit={handleCreate} loading={loading} submitLabel="שמור לקוח" error={error} />
    </Box>
  );
}
