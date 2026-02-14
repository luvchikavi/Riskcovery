'use client';

import { Save as SaveIcon } from '@mui/icons-material';
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
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';

import { type CreateClientData } from '@/lib/api';
import { SECTORS } from '@/lib/constants';

interface ClientFormProps {
  initialData?: Partial<CreateClientData>;
  onSubmit: (data: CreateClientData) => Promise<void>;
  loading: boolean;
  submitLabel: string;
  error: string | null;
}

const EMPTY_FORM: CreateClientData = {
  name: '',
  companyId: '',
  sector: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  employeeCount: undefined,
  annualRevenue: undefined,
};

export default function ClientForm({ initialData, onSubmit, loading, submitLabel, error }: ClientFormProps) {
  const [formData, setFormData] = useState<CreateClientData>({
    ...EMPTY_FORM,
    ...initialData,
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
    await onSubmit(formData);
  };

  return (
    <>
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
                  label='דוא"ל'
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
            {loading ? 'שומר...' : submitLabel}
          </Button>
          <Button component={Link} href="/rfq/clients" variant="outlined" size="large">
            ביטול
          </Button>
        </Box>
      </form>
    </>
  );
}
