'use client';

import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  PlayArrow as ProcessIcon,
  CheckCircle as CompliantIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { comparisonApi, type ComparisonDocument } from '@/lib/api';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useSnackbar } from '@/components/SnackbarProvider';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<ComparisonDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<ComparisonDocument | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ComparisonDocument | null>(null);
  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await comparisonApi.documents.list();
      setDocuments(response.data || []);
    } catch (err) {
      setError('Failed to load documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setError(null);

    for (const file of acceptedFiles) {
      try {
        const base64 = await fileToBase64(file);
        await comparisonApi.documents.upload({
          fileName: file.name.replace(/[^a-zA-Z0-9.-]/g, '_'),
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          content: base64,
        });
      } catch (err) {
        setError(`Failed to upload ${file.name}`);
        console.error(err);
      }
    }

    setUploading(false);
    showSuccess('הקבצים הועלו בהצלחה');
    loadDocuments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    multiple: true,
  });

  const handleProcess = async (docId: string) => {
    try {
      await comparisonApi.documents.process(docId);
      loadDocuments();
    } catch (err) {
      setError('Failed to process document');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await comparisonApi.documents.delete(deleteTarget.id);
      setDocuments(documents.filter((d) => d.id !== deleteTarget.id));
      showSuccess('המסמך נמחק בהצלחה');
    } catch (err) {
      showError('שגיאה במחיקת המסמך');
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CompliantIcon sx={{ color: 'success.main' }} />;
      case 'processing':
        return <WarningIcon sx={{ color: 'info.main' }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <PendingIcon sx={{ color: 'text.secondary' }} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'processed':
        return 'עובד';
      case 'processing':
        return 'מעבד...';
      case 'failed':
        return 'נכשל';
      default:
        return 'ממתין';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          מסמכים
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Upload and manage insurance certificates
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Upload Area */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? 'primary.light' : 'transparent',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            <input {...getInputProps()} />
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            {uploading ? (
              <Box>
                <Typography>מעלה קבצים...</Typography>
                <LinearProgress sx={{ mt: 2 }} />
              </Box>
            ) : isDragActive ? (
              <Typography>שחרר כאן להעלאה</Typography>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  גרור קבצים לכאן או לחץ לבחירה
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drag & drop PDF or image files here, or click to select
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  PDF, PNG, JPG supported
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            מסמכים שהועלו ({documents.length})
          </Typography>

          {documents.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              אין מסמכים עדיין. העלה אישור ביטוח להתחיל.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>סטטוס</TableCell>
                    <TableCell>שם קובץ</TableCell>
                    <TableCell>גודל</TableCell>
                    <TableCell>תאריך העלאה</TableCell>
                    <TableCell align="right">פעולות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow
                      key={doc.id}
                      hover
                      onClick={() => setSelectedDoc(doc)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(doc.status)}
                          <Typography variant="body2">{getStatusLabel(doc.status)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {doc.originalName}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatFileSize(doc.size)}</TableCell>
                      <TableCell>
                        {new Date(doc.uploadedAt).toLocaleDateString('he-IL')}
                      </TableCell>
                      <TableCell align="right">
                        {doc.status === 'uploaded' && (
                          <IconButton
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProcess(doc.id);
                            }}
                            title="Process document"
                          >
                            <ProcessIcon />
                          </IconButton>
                        )}
                        <IconButton
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(doc);
                          }}
                          title="Delete document"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Document Details Dialog */}
      <Dialog open={!!selectedDoc} onClose={() => setSelectedDoc(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            פרטי מסמך
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDoc && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>שם קובץ:</strong> {selectedDoc.originalName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>גודל:</strong> {formatFileSize(selectedDoc.size)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>סטטוס:</strong> {getStatusLabel(selectedDoc.status)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>תאריך העלאה:</strong>{' '}
                {new Date(selectedDoc.uploadedAt).toLocaleString('he-IL')}
              </Typography>

              {selectedDoc.extractedData && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    נתונים שחולצו
                  </Typography>
                  <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1 }}>
                    {selectedDoc.extractedData.insuredName && (
                      <Typography variant="body2">
                        <strong>שם המבוטח:</strong> {selectedDoc.extractedData.insuredName}
                      </Typography>
                    )}
                    {selectedDoc.extractedData.insurerName && (
                      <Typography variant="body2">
                        <strong>חברת ביטוח:</strong> {selectedDoc.extractedData.insurerName}
                      </Typography>
                    )}
                    {selectedDoc.extractedData.certificateNumber && (
                      <Typography variant="body2">
                        <strong>מספר אישור:</strong> {selectedDoc.extractedData.certificateNumber}
                      </Typography>
                    )}
                    {selectedDoc.extractedData.expiryDate && (
                      <Typography variant="body2">
                        <strong>תוקף עד:</strong> {selectedDoc.extractedData.expiryDate}
                      </Typography>
                    )}
                    {selectedDoc.extractedData.policies && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="bold">
                          פוליסות ({selectedDoc.extractedData.policies.length}):
                        </Typography>
                        {selectedDoc.extractedData.policies.map((policy, idx) => (
                          <Typography key={idx} variant="body2" sx={{ ml: 2 }}>
                            - {policy.policyTypeHe}: ₪
                            {policy.coverageLimit?.toLocaleString() || 'N/A'}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDoc(null)}>סגור</Button>
          {selectedDoc?.status === 'uploaded' && (
            <Button
              variant="contained"
              onClick={() => {
                handleProcess(selectedDoc.id);
                setSelectedDoc(null);
              }}
            >
              עבד מסמך
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="מחיקת מסמך"
        message={`האם למחוק את "${deleteTarget?.originalName}"? פעולה זו אינה הפיכה.`}
        confirmLabel="מחק"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
