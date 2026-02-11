'use client';

import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  QuestionAnswer as QuestionnaireIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

import { rfqApi, type Client } from '@/lib/api';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useSnackbar } from '@/components/SnackbarProvider';

const SECTORS = [
  { value: '', label: 'הכל', labelEn: 'All' },
  { value: 'CONSTRUCTION', label: 'בנייה', labelEn: 'Construction' },
  { value: 'TECHNOLOGY', label: 'טכנולוגיה', labelEn: 'Technology' },
  { value: 'MANUFACTURING', label: 'ייצור', labelEn: 'Manufacturing' },
  { value: 'RETAIL', label: 'קמעונאות', labelEn: 'Retail' },
  { value: 'HEALTHCARE', label: 'בריאות', labelEn: 'Healthcare' },
  { value: 'LOGISTICS', label: 'לוגיסטיקה', labelEn: 'Logistics' },
  { value: 'CONSULTING', label: 'ייעוץ', labelEn: 'Consulting' },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const { showSuccess, showError } = useSnackbar();

  const handleDeleteClient = async () => {
    if (!deleteTarget) return;
    try {
      await rfqApi.clients.delete(deleteTarget.id);
      showSuccess(`הלקוח ${deleteTarget.name} נמחק בהצלחה`);
      setDeleteTarget(null);
      loadClients();
    } catch {
      showError('שגיאה במחיקת הלקוח');
    }
  };

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await rfqApi.clients.list({
        page: page + 1,
        pageSize: rowsPerPage,
        sector: sector || undefined,
        search: search || undefined,
      });
      if (response.success && response.data) {
        setClients(response.data.data);
        setTotalItems(response.data.pagination.totalItems);
      }
    } catch (err) {
      setError('Failed to load clients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sector, search]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      loadClients();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getSectorLabel = (sectorValue: string) => {
    return SECTORS.find((s) => s.value === sectorValue)?.label || sectorValue;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            ניהול לקוחות
          </Typography>
          <Typography color="text.secondary">Client Management</Typography>
        </Box>
        <Button
          component={Link}
          href="/rfq/clients/new"
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          לקוח חדש
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              placeholder="חיפוש לקוחות..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>ענף</InputLabel>
              <Select
                value={sector}
                label="ענף"
                onChange={(e) => {
                  setSector(e.target.value);
                  setPage(0);
                }}
              >
                {SECTORS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Clients Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>שם הלקוח</TableCell>
                <TableCell>ח.פ/ע.מ</TableCell>
                <TableCell>ענף</TableCell>
                <TableCell>איש קשר</TableCell>
                <TableCell>שאלונים</TableCell>
                <TableCell>מסמכים</TableCell>
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
                    <TableSkeleton rows={5} columns={7} />
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">לא נמצאו לקוחות</Typography>
                    <Button
                      component={Link}
                      href="/rfq/clients/new"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      sx={{ mt: 2 }}
                    >
                      הוסף לקוח ראשון
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{client.name}</Typography>
                    </TableCell>
                    <TableCell>{client.companyId || '-'}</TableCell>
                    <TableCell>
                      <Chip label={getSectorLabel(client.sector)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{client.contactName || '-'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {client.contactEmail || ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={client._count?.questionnaires || 0}
                        size="small"
                        color={client._count?.questionnaires ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={client._count?.documents || 0}
                        size="small"
                        color={client._count?.documents ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Link href={`/rfq/clients/${client.id}`} passHref legacyBehavior>
                          <IconButton size="small" title="צפייה">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Link>
                        <Link href={`/rfq/questionnaire/${client.id}`} passHref legacyBehavior>
                          <IconButton size="small" color="primary" title="שאלון">
                            <QuestionnaireIcon fontSize="small" />
                          </IconButton>
                        </Link>
                        <IconButton
                          size="small"
                          color="error"
                          title="מחק"
                          onClick={() => setDeleteTarget(client)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="שורות בעמוד:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} מתוך ${count !== -1 ? count : `יותר מ-${to}`}`
          }
        />
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title="מחיקת לקוח"
        message={`האם למחוק את הלקוח "${deleteTarget?.name}"? פעולה זו אינה הפיכה.`}
        confirmLabel="מחק"
        destructive
        onConfirm={handleDeleteClient}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
