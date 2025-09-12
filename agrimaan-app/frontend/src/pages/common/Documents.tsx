import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Grid,
  FormHelperText,
  Input
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import axios from 'axios';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadUrl: string;
  previewUrl?: string;
  tags: string[];
}

interface DocumentState {
  documents: Document[];
  loading: boolean;
  error: string | null;
  uploadDialog: boolean;
  previewDialog: boolean;
  selectedDocument: Document | null;
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
}

const Documents: React.FC = () => {
  const [state, setState] = useState<DocumentState>({
    documents: [],
    loading: false,
    error: null,
    uploadDialog: false,
    previewDialog: false,
    selectedDocument: null,
    categories: ['Contract', 'Report', 'Invoice', 'Certificate', 'Photo', 'Other'],
    selectedCategory: 'All',
    searchQuery: ''
  });

  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    category: '',
    tags: '',
    description: ''
  });

  const user = useSelector((state: RootState) => state.auth.user);

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await axios.get('/api/documents');
      setState(prev => ({ ...prev, documents: response.data, loading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to fetch documents', loading: false }));
    }
  };

  // Upload document
  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.category) return;

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('category', uploadForm.category);
    formData.append('tags', uploadForm.tags);
    formData.append('description', uploadForm.description);

    try {
      await axios.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setState(prev => ({ ...prev, uploadDialog: false }));
      setUploadForm({ file: null, category: '', tags: '', description: '' });
      fetchDocuments();
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to upload document' }));
    }
  };

  // Download document
  const handleDownload = async (document: Document) => {
    try {
      const response = await axios.get(`/api/documents/${document.id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const downloadLink = window.document.createElement('a');
      downloadLink.href = url;
      downloadLink.setAttribute('download', document.name);
      window.document.body.appendChild(downloadLink);
      downloadLink.click();
      window.document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to download document' }));
    }
  };

  // Delete document
  const handleDelete = async (documentId: string) => {
    try {
      await axios.delete(`/api/documents/${documentId}`);
      fetchDocuments();
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to delete document' }));
    }
  };

  // Filter documents
  const filteredDocuments = state.documents.filter(doc => {
    const matchesCategory = state.selectedCategory === 'All' || doc.category === state.selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (state.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Document Management
        </Typography>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Documents</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => setState(prev => ({ ...prev, uploadDialog: true }))}
        >
          Upload Document
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant={state.selectedCategory === 'All' ? 'contained' : 'outlined'}
                onClick={() => setState(prev => ({ ...prev, selectedCategory: 'All' }))}
                fullWidth
              >
                All ({state.documents.length})
              </Button>
              {state.categories.map(category => (
                <Button
                  key={category}
                  variant={state.selectedCategory === category ? 'contained' : 'outlined'}
                  onClick={() => setState(prev => ({ ...prev, selectedCategory: category }))}
                  fullWidth
                >
                  {category} ({state.documents.filter(doc => doc.category === category).length})
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder="Search documents..."
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              sx={{ mb: 2 }}
            />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Uploaded By</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {document.type.startsWith('image/') ? (
                            <FolderIcon />
                          ) : (
                            <InsertDriveFileIcon />
                          )}
                          <Typography>{document.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{document.type}</TableCell>
                      <TableCell>
                        <Chip label={document.category} size="small" />
                      </TableCell>
                      <TableCell>{(document.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                      <TableCell>{document.uploadedBy}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton onClick={() => handleDownload(document)} title="Download">
                            <DownloadIcon />
                          </IconButton>
                          <IconButton onClick={() => setState(prev => ({ 
                            ...prev, 
                            previewDialog: true, 
                            selectedDocument: document 
                          }))} title="Preview">
                            <VisibilityIcon />
                          </IconButton>
                          {user?.role === 'admin' && (
                            <IconButton onClick={() => handleDelete(document.id)} title="Delete">
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={state.uploadDialog} onClose={() => setState(prev => ({ ...prev, uploadDialog: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={uploadForm.category}
                onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
              >
                {state.categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Tags"
              value={uploadForm.tags}
              onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
              helperText="Comma-separated tags"
              fullWidth
            />
            
            <TextField
              label="Description"
              value={uploadForm.description}
              onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              fullWidth
            />
            
            <FormControl fullWidth>
              <input
                accept="*/*"
                type="file"
                onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                style={{ display: 'none' }}
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  {uploadForm.file ? uploadForm.file.name : 'Choose File'}
                </Button>
              </label>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState(prev => ({ ...prev, uploadDialog: false }))}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!uploadForm.file || !uploadForm.category}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={state.previewDialog} onClose={() => setState(prev => ({ ...prev, previewDialog: false }))} maxWidth="md" fullWidth>
        <DialogTitle>Document Preview</DialogTitle>
        <DialogContent>
          {state.selectedDocument && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {state.selectedDocument.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Type: {state.selectedDocument.type}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Size: {(state.selectedDocument.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Category: {state.selectedDocument.category}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Uploaded: {new Date(state.selectedDocument.uploadedAt).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState(prev => ({ ...prev, previewDialog: false }))}>Close</Button>
          <Button
            onClick={() => state.selectedDocument && handleDownload(state.selectedDocument)}
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {state.error && (
        <Alert severity="error" sx={{ position: 'fixed', top: 20, right: 20 }}>
          {state.error}
        </Alert>
      )}
    </Box>
  );
};

export default Documents;