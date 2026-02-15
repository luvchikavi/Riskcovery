'use client';

import { ArrowBack as BackIcon } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { adminApi } from '@/lib/api';

export default function NewTemplatePage() {
  const router = useRouter();
  const [sector, setSector] = useState('');
  const [sectorHe, setSectorHe] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionHe, setDescriptionHe] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await adminApi.templates.create({
        sector: sector.toUpperCase(),
        sectorHe,
        description: description || undefined,
        descriptionHe: descriptionHe || undefined,
        isActive,
      });

      if (response.success && response.data) {
        router.push(`/rfq/admin/templates/${response.data.id}`);
      } else {
        setError('Failed to create template');
      }
    } catch (err: unknown) {
      setError('Failed to create template');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Button component={Link} href="/rfq/admin/templates" startIcon={<BackIcon />}>
          חזרה לרשימה
        </Button>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            תבנית שאלון חדשה
          </Typography>
          <Typography color="text.secondary">Create New Questionnaire Template</Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box display="grid" gap={3}>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
                <TextField
                  label="קוד ענף (באנגלית)"
                  value={sector}
                  onChange={(e) => setSector(e.target.value.toUpperCase())}
                  required
                  fullWidth
                  placeholder="CONSTRUCTION"
                  helperText="מזהה ייחודי לענף באותיות גדולות"
                />
                <TextField
                  label="שם ענף (בעברית)"
                  value={sectorHe}
                  onChange={(e) => setSectorHe(e.target.value)}
                  required
                  fullWidth
                  placeholder="בנייה"
                  helperText="שם הענף כפי שיוצג למשתמשים"
                />
              </Box>

              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
                <TextField
                  label="תיאור (באנגלית)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Questionnaire for construction sector..."
                />
                <TextField
                  label="תיאור (בעברית)"
                  value={descriptionHe}
                  onChange={(e) => setDescriptionHe(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="שאלון לענף הבנייה..."
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                }
                label="הפעל מיד (מומלץ להפעיל רק לאחר הוספת שאלות)"
              />

              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button component={Link} href="/rfq/admin/templates" disabled={loading}>
                  ביטול
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !sector || !sectorHe}
                >
                  {loading ? 'יוצר...' : 'צור תבנית'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
