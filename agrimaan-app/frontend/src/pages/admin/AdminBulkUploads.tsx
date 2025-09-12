import React from 'react';
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
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';

const AdminBulkUploads: React.FC = () => {
  const [uploads, setUploads] = React.useState([
    {
      id: 1,
      filename: 'farmers_batch_001.csv',
      type: 'users',
      status: 'completed',
      records: 150,
      success: 145,
      failed: 5,
      uploadedBy: 'admin@agrimaan.com',
      uploadedAt: '2025-09-11 10:30:00',
    },
    {
      id: 2,
      filename: 'lands_batch_002.xlsx',
      type: 'lands',
      status: 'processing',
      records: 75,
      success: 0,
      failed: 0,
      uploadedBy: 'admin@agrimaan.com',
      uploadedAt: '2025-09-11 11:15:00',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bulk Upload Management
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Uploads
              </Typography>
              <Typography variant="h5">
                {uploads.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h5">
                {uploads.filter(u => u.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Processing
              </Typography>
              <Typography variant="h5">
                {uploads.filter(u => u.status === 'processing').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Failed
              </Typography>
              <Typography variant="h5">
                {uploads.filter(u => u.status === 'failed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" startIcon={<UploadIcon />}>
          Upload New File
        </Button>
        <Button variant="outlined" startIcon={<RefreshIcon />}>
          Refresh
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Records</TableCell>
              <TableCell align="right">Success</TableCell>
              <TableCell align="right">Failed</TableCell>
              <TableCell>Uploaded By</TableCell>
              <TableCell>Uploaded At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uploads.map((upload) => (
              <TableRow key={upload.id}>
                <TableCell>{upload.filename}</TableCell>
                <TableCell>
                  <Chip label={upload.type} size="small" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={upload.status} 
                    color={getStatusColor(upload.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{upload.records}</TableCell>
                <TableCell align="right">{upload.success}</TableCell>
                <TableCell align="right">{upload.failed}</TableCell>
                <TableCell>{upload.uploadedBy}</TableCell>
                <TableCell>{upload.uploadedAt}</TableCell>
                <TableCell>
                  <Tooltip title="Download Report">
                    <IconButton size="small">
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminBulkUploads;