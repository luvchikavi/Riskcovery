'use client';

import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  QuestionAnswer as QuestionnaireIcon,
  Description as DocumentIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { rfqApi } from '@/lib/api';
import { SECTORS_MAP } from '@/lib/constants';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useSnackbar } from '@/components/SnackbarProvider';
import { useState } from 'react';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const id = params.id as string;
  const { showSuccess, showError } = useSnackbar();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['rfq', 'clients', id],
    queryFn: async () => {
      const res = await rfqApi.clients.get(id);
      if (!res.success || !res.data) throw new Error('Client not found');
      return res.data;
    },
  });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await rfqApi.clients.delete(id);
      if (response.success) {
        showSuccess('הלקוח נמחק בהצלחה');
        qc.invalidateQueries({ queryKey: ['rfq', 'clients'] });
        qc.invalidateQueries({ queryKey: ['rfq', 'stats'] });
        router.push('/rfq/clients');
      } else {
        showError('Failed to delete client');
      }
    } catch {
      showError('Failed to delete client');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !client) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error?.message || 'Client not found'}
        </Alert>
        <Button component={Link} href="/rfq/clients" variant="outlined" startIcon={<ArrowBackIcon />}>
          חזרה לרשימה
        </Button>
      </Box>
    );
  }

  const sector = SECTORS_MAP[client.sector] || { label: client.sector, labelEn: client.sector };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/rfq" style={{ textDecoration: 'none', color: 'inherit' }}>
          לוח בקרה
        </Link>
        <Link href="/rfq/clients" style={{ textDecoration: 'none', color: 'inherit' }}>
          לקוחות
        </Link>
        <Typography color="text.primary">{client.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {client.name}
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            <Chip label={sector.label} variant="outlined" />
            {client.companyId && (
              <Typography color="text.secondary">ח.פ: {client.companyId}</Typography>
            )}
          </Box>
        </Box>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            component={Link}
            href={`/rfq/questionnaire/${client.id}`}
            variant="contained"
            startIcon={<QuestionnaireIcon />}
          >
            מילוי שאלון
          </Button>
          <Button
            component={Link}
            href={`/rfq/documents/${client.id}`}
            variant="outlined"
            startIcon={<DocumentIcon />}
          >
            יצירת מסמך
          </Button>
          <Button
            component={Link}
            href={`/rfq/clients/${client.id}/edit`}
            variant="outlined"
            startIcon={<EditIcon />}
          >
            עריכה
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            מחיקה
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Company Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                פרטי חברה
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">שם החברה</Typography>
                  <Typography>{client.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">ח.פ / ע.מ</Typography>
                  <Typography>{client.companyId || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">ענף</Typography>
                  <Typography>{sector.label} ({sector.labelEn})</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">מספר עובדים</Typography>
                  <Typography>{client.employeeCount?.toLocaleString() || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">מחזור שנתי</Typography>
                  <Typography>
                    {client.annualRevenue ? `₪${client.annualRevenue.toLocaleString()}` : '-'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                פרטי איש קשר
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">שם איש קשר</Typography>
                  <Typography>{client.contactName || '-'}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">דוא&quot;ל</Typography>
                    <Typography>
                      {client.contactEmail ? (
                        <a href={`mailto:${client.contactEmail}`}>{client.contactEmail}</a>
                      ) : '-'}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">טלפון</Typography>
                    <Typography>
                      {client.contactPhone ? (
                        <a href={`tel:${client.contactPhone}`}>{client.contactPhone}</a>
                      ) : '-'}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">כתובת</Typography>
                    <Typography>{client.address || '-'}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>סטטיסטיקה</Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {client._count?.questionnaires || 0}
                    </Typography>
                    <Typography color="text.secondary">שאלונים</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {client._count?.documents || 0}
                    </Typography>
                    <Typography color="text.secondary">מסמכים</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4">
                      {new Date(client.createdAt).toLocaleDateString('he-IL')}
                    </Typography>
                    <Typography color="text.secondary">תאריך יצירה</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4">
                      {new Date(client.updatedAt).toLocaleDateString('he-IL')}
                    </Typography>
                    <Typography color="text.secondary">עדכון אחרון</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="מחיקת לקוח"
        message={`האם למחוק את הלקוח "${client.name}"? פעולה זו תמחק גם את כל השאלונים והמסמכים המשויכים.`}
        confirmLabel={deleting ? 'מוחק...' : 'מחק'}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
}
