'use client';

import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
  Breadcrumbs,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { rfqApi, type CreateClientData } from '@/lib/api';

const SECTORS = [
  { value: 'CONSTRUCTION', label: 'בנייה', labelEn: 'Construction' },
  { value: 'TECHNOLOGY', label: 'טכנולוגיה', labelEn: 'Technology' },
  { value: 'MANUFACTURING', label: 'ייצור', labelEn: 'Manufacturing' },
  { value: 'RETAIL', label: 'קמעונאות', labelEn: 'Retail' },
  { value: 'HEALTHCARE', label: 'בריאות', labelEn: 'Healthcare' },
  { value: 'LOGISTICS', label: 'לוגיסטיקה', labelEn: 'Logistics' },
  { value: 'CONSULTING', label: 'ייעוץ', labelEn: 'Consulting' },
];

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateClientData>({
    name: '',
    companyId: '',
    sector: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    employeeCount: undefined,
    annualRevenue: undefined,
  });

  const handleChange = (field: keyof CreateClientData) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'employeeCount' || field === 'annualRevenue'
        ? (value ? Number(value) : undefined)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

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
        <Typography color="text.primary">לקוח חדש</Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            הוספת לקוח חדש
          </Typography>
          <Typography color="text.secondary">Add New Client</Typography>
        </Box>
        <Button component={Link} href="/rfq/clients" variant="outlined" startIcon={<ArrowBackIcon />}>
          חזרה לרשימה
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              פרטי חברה
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="שם החברה"
                  placeholder="Company Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ח.פ / ע.מ"
                  placeholder="Company ID"
                  value={formData.companyId}
                  onChange={handleChange('companyId')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>ענף</InputLabel>
                  <Select
                    value={formData.sector}
                    label="ענף"
                    onChange={(e) => setFormData((prev) => ({ ...prev, sector: e.target.value }))}
                  >
                    {SECTORS.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label} ({s.labelEn})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="כתובת"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange('address')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="מספר עובדים"
                  placeholder="Employee Count"
                  value={formData.employeeCount || ''}
                  onChange={handleChange('employeeCount')}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="מחזור שנתי"
                  placeholder="Annual Revenue"
                  value={formData.annualRevenue || ''}
                  onChange={handleChange('annualRevenue')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₪</InputAdornment>,
                  }}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              פרטי איש קשר
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="שם איש קשר"
                  placeholder="Contact Name"
                  value={formData.contactName}
                  onChange={handleChange('contactName')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="דוא&quot;ל"
                  placeholder="Email"
                  value={formData.contactEmail}
                  onChange={handleChange('contactEmail')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="טלפון"
                  placeholder="Phone"
                  value={formData.contactPhone}
                  onChange={handleChange('contactPhone')}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box display="flex" gap={2} justifyContent="flex-start">
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? 'שומר...' : 'שמור לקוח'}
          </Button>
          <Button component={Link} href="/rfq/clients" variant="outlined" size="large">
            ביטול
          </Button>
        </Box>
      </form>
    </Box>
  );
}
