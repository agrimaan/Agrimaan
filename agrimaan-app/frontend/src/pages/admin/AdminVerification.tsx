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
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';

const AdminVerification: React.FC = () => {
  const [verifications, setVerifications] = React.useState([
    {
      id: 1,
      userId: 'user-001',
      userEmail: 'farmer@example.com',
      userName: 'John Farmer',
      verificationType: 'email',
      status: 'pending',
      createdAt: '2025-09-11 09:00:00',
      documents: ['id_proof.jpg', 'address_proof.pdf'],
    },
    {
      id: 2,
      userId: 'user-002',
      userEmail: 'investor@example.com',
      userName: 'Jane Investor',
      verificationType: 'kyc',
      status: 'pending',
      createdAt: '2025-09-11 10:30:00',
      documents: ['passport.jpg', 'utility_bill.pdf'],
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const handleApprove = (id: number) => {
    // Handle approval logic
    console.log('Approving verification:', id);
  };

  const handleReject = (id: number) => {
    // Handle rejection logic
    console.log('Rejecting verification:', id);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Verification Queue
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Pending
              </Typography>
              <Typography variant="h5">
                {verifications.filter(v => v.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Email Verifications
              </Typography>
              <Typography variant="h5">
                {verifications.filter(v => v.verificationType === 'email' && v.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                KYC Verifications
              </Typography>
              <Typography variant="h5">
                {verifications.filter(v => v.verificationType === 'kyc' && v.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Documents</TableCell>
              <TableCell>Requested</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {verifications.map((verification) => (
              <TableRow key={verification.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {verification.userName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {verification.userEmail}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={verification.verificationType.toUpperCase()} 
                    size="small"
                    color={verification.verificationType === 'email' ? 'primary' : 'secondary'}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={verification.status} 
                    color={getStatusColor(verification.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {verification.documents.map((doc, index) => (
                    <Chip key={index} label={doc} size="small" variant="outlined" sx={{ mr: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>{verification.createdAt}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Approve">
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handleApprove(verification.id)}
                      >
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleReject(verification.id)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminVerification;