'use client';

import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Box, Typography, Button, Breadcrumbs, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { rfqApi, type Client, type CreateClientData } from '@/lib/api';
import ClientForm from '@/components/rfq/ClientForm';
import { useSnackbar } from '@/components/SnackbarProvider';

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { showSuccess } = useSnackbar();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClient() {
      try {
        const response = await rfqApi.clients.get(id);
        if (response.success && response.data) {
          setClient(response.data);
        } else {
          setFetchError('Client not found');
        }
      } catch (err) {
        setFetchError('Failed to load client');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadClient();
  }, [id]);

  const handleUpdate = async (formData: CreateClientData) => {
    setSaving(true);
    setSaveError(null);

    try {
      if (!formData.name || !formData.sector) {
        setSaveError('שם לקוח וענף הם שדות חובה');
        setSaving(false);
        return;
      }

      const response = await rfqApi.clients.update(id, formData);
      if (response.success) {
        showSuccess('הלקוח עודכן בהצלחה');
        router.push(`/rfq/clients/${id}`);
      } else {
        setSaveError('Failed to update client');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update client');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (fetchError || !client) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {fetchError || 'Client not found'}
        </Alert>
        <Button component={Link} href="/rfq/clients" variant="outlined" startIcon={<ArrowBackIcon />}>
          חזרה לרשימה
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/rfq" style={{ textDecoration: 'none', color: 'inherit' }}>
          לוח בקרה
        </Link>
        <Link href="/rfq/clients" style={{ textDecoration: 'none', color: 'inherit' }}>
          לקוחות
        </Link>
        <Link href={`/rfq/clients/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {client.name}
        </Link>
        <Typography color="text.primary">עריכה</Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            עריכת לקוח
          </Typography>
          <Typography color="text.secondary">Edit Client — {client.name}</Typography>
        </Box>
        <Button component={Link} href={`/rfq/clients/${id}`} variant="outlined" startIcon={<ArrowBackIcon />}>
          חזרה לפרטי לקוח
        </Button>
      </Box>

      <ClientForm
        initialData={{
          name: client.name,
          companyId: client.companyId,
          sector: client.sector,
          contactName: client.contactName,
          contactEmail: client.contactEmail,
          contactPhone: client.contactPhone,
          address: client.address,
          employeeCount: client.employeeCount,
          annualRevenue: client.annualRevenue,
        }}
        onSubmit={handleUpdate}
        loading={saving}
        submitLabel="עדכן לקוח"
        error={saveError}
      />
    </Box>
  );
}
