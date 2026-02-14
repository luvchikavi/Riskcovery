'use client';

import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
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
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { rfqApi, type Client } from '@/lib/api';
import { SECTORS_WITH_ALL } from '@/lib/constants';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useSnackbar } from '@/components/SnackbarProvider';

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sector, setSector] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const { showSuccess, showError } = useSnackbar();

  // Debounce search input
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
    }, 300));
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['rfq', 'clients', { page, rowsPerPage, sector, search: debouncedSearch }],
    queryFn: async () => {
      const res = await rfqApi.clients.list({
        page: page + 1,
        pageSize: rowsPerPage,
        sector: sector || undefined,
        search: debouncedSearch || undefined,
      });
      if (!res.success || !res.data) throw new Error('Failed to load clients');
      return res.data;
    },
  });

  const clients = data?.data ?? [];
  const totalItems = data?.pagination.totalItems ?? 0;

  const handleDeleteClient = async () => {
    if (!deleteTarget) return;
    try {
      await rfqApi.clients.delete(deleteTarget.id);
      showSuccess(`הלקוח ${deleteTarget.name} נמחק בהצלחה`);
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['rfq', 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['rfq', 'stats'] });
    } catch {
      showError('שגיאה במחיקת הלקוח');
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getSectorLabel = (sectorValue: string) => {
    return SECTORS_WITH_ALL.find((s) => s.value === sectorValue)?.label || sectorValue;
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
              onChange={(e) => handleSearchChange(e.target.value)}
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
                {SECTORS_WITH_ALL.map((s) => (
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
          Failed to load clients
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
              {isLoading ? (
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
                        <Link href={`/rfq/clients/${client.id}/edit`} passHref legacyBehavior>
                          <IconButton size="small" color="info" title="עריכה">
                            <EditIcon fontSize="small" />
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
