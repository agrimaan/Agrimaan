import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';

const AdminTerms: React.FC = () => {
  const [terms, setTerms] = useState([
    {
      id: 1,
      version: '1.0',
      type: 'user_agreement',
      title: 'User Agreement',
      status: 'active',
      createdAt: '2025-09-01',
      updatedAt: '2025-09-01',
      acceptedBy: 1250,
    },
    {
      id: 2,
      version: '2.0',
      type: 'privacy_policy',
      title: 'Privacy Policy',
      status: 'active',
      createdAt: '2025-09-05',
      updatedAt: '2025-09-05',
      acceptedBy: 1180,
    },
    {
      id: 3,
      version: '1.5',
      type: 'token_terms',
      title: 'Token Terms & Conditions',
      status: 'draft',
      createdAt: '2025-09-10',
      updatedAt: '2025-09-10',
      acceptedBy: 0,
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'default';
      case 'archived': return 'error';
      default: return 'default';
    }
  };

  const handleCreateNew = () => {
    setSelectedTerm(null);
    setOpenDialog(true);
  };

  const handleEdit = (term: any) => {
    setSelectedTerm(term);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTerm(null);
  };

  const handleSave = () => {
    // Save logic here
    handleCloseDialog();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Terms & Conditions Management
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Terms
              </Typography>
              <Typography variant="h5">
                {terms.filter(t => t.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Draft Terms
              </Typography>
              <Typography variant="h5">
                {terms.filter(t => t.status === 'draft').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Acceptances
              </Typography>
              <Typography variant="h5">
                {terms.reduce((sum, t) => sum + t.acceptedBy, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Types
              </Typography>
              <Typography variant="h5">
                {new Set(terms.map(t => t.type)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create New Terms
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Accepted By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {terms.map((term) => (
              <TableRow key={term.id}>
                <TableCell>{term.title}</TableCell>
                <TableCell>{term.version}</TableCell>
                <TableCell>
                  <Chip 
                    label={term.type.replace('_', ' ').toUpperCase()} 
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={term.status} 
                    color={getStatusColor(term.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{term.createdAt}</TableCell>
                <TableCell>{term.updatedAt}</TableCell>
                <TableCell align="right">{term.acceptedBy.toLocaleString()}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Content">
                      <IconButton size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small"
                        onClick={() => handleEdit(term)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTerm ? 'Edit Terms & Conditions' : 'Create New Terms & Conditions'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Title"
                fullWidth
                defaultValue={selectedTerm?.title || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Version"
                fullWidth
                defaultValue={selectedTerm?.version || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  defaultValue={selectedTerm?.type || 'user_agreement'}
                  label="Type"
                >
                  <MenuItem value="user_agreement">User Agreement</MenuItem>
                  <MenuItem value="privacy_policy">Privacy Policy</MenuItem>
                  <MenuItem value="token_terms">Token Terms</MenuItem>
                  <MenuItem value="kyc_terms">KYC Terms</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  defaultValue={selectedTerm?.status || 'draft'}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Content"
                fullWidth
                multiline
                rows={8}
                defaultValue={selectedTerm?.content || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedTerm ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTerms;