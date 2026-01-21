'use client';

import {
  Delete as DeleteIcon,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { rfqApi, type Client } from '@/lib/api';

const SECTORS: Record<string, { label: string; labelEn: string }> = {
  CONSTRUCTION: { label: 'בנייה', labelEn: 'Construction' },
  TECHNOLOGY: { label: 'טכנולוגיה', labelEn: 'Technology' },
  MANUFACTURING: { label: 'ייצור', labelEn: 'Manufacturing' },
  RETAIL: { label: 'קמעונאות', labelEn: 'Retail' },
  HEALTHCARE: { label: 'בריאות', labelEn: 'Healthcare' },
  LOGISTICS: { label: 'לוגיסטיקה', labelEn: 'Logistics' },
  CONSULTING: { label: 'ייעוץ', labelEn: 'Consulting' },
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadClient() {
      try {
        const response = await rfqApi.clients.get(id);
        if (response.success && response.data) {
          setClient(response.data);
        } else {
          setError('Client not found');
        }
      } catch (err) {
        setError('Failed to load client');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadClient();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await rfqApi.clients.delete(id);
      if (response.success) {
        router.push('/rfq/clients');
      } else {
        setError('Failed to delete client');
      }
    } catch (err) {
      setError('Failed to delete client');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
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
          {error || 'Client not found'}
        </Alert>
        <Button component={Link} href="/rfq/clients" variant="outlined" startIcon={<ArrowBackIcon />}>
          חזרה לרשימה
        </Button>
      </Box>
    );
  }

  const sector = SECTORS[client.sector] || { label: client.sector, labelEn: client.sector };

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
                  <Typography variant="body2" color="text.secondary">
                    שם החברה
                  </Typography>
                  <Typography>{client.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    ח.פ / ע.מ
                  </Typography>
                  <Typography>{client.companyId || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    ענף
                  </Typography>
                  <Typography>
                    {sector.label} ({sector.labelEn})
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    מספר עובדים
                  </Typography>
                  <Typography>
                    {client.employeeCount?.toLocaleString() || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    מחזור שנתי
                  </Typography>
                  <Typography>
                    {client.annualRevenue
                      ? `₪${client.annualRevenue.toLocaleString()}`
                      : '-'}
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
                  <Typography variant="body2" color="text.secondary">
                    שם איש קשר
                  </Typography>
                  <Typography>{client.contactName || '-'}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      דוא&quot;ל
                    </Typography>
                    <Typography>
                      {client.contactEmail ? (
                        <a href={`mailto:${client.contactEmail}`}>{client.contactEmail}</a>
                      ) : (
                        '-'
                      )}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      טלפון
                    </Typography>
                    <Typography>
                      {client.contactPhone ? (
                        <a href={`tel:${client.contactPhone}`}>{client.contactPhone}</a>
                      ) : (
                        '-'
                      )}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      כתובת
                    </Typography>
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
              <Typography variant="h6" gutterBottom>
                סטטיסטיקה
              </Typography>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>מחיקת לקוח</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הלקוח &quot;{client.name}&quot;?
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            פעולה זו תמחק גם את כל השאלונים והמסמכים המשויכים ללקוח זה.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'מוחק...' : 'מחק'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
