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
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkIcon from '@mui/icons-material/Link';

const AdminTokens: React.FC = () => {
  const [tokens, setTokens] = React.useState([
    {
      id: 1,
      tokenId: 'TOKEN-001',
      landId: 'LAND-001',
      owner: 'farmer@example.com',
      totalSupply: 1000,
      availableSupply: 750,
      price: 10.5,
      status: 'active',
      createdAt: '2025-09-10',
    },
    {
      id: 2,
      tokenId: 'TOKEN-002',
      landId: 'LAND-002',
      owner: 'investor@example.com',
      totalSupply: 500,
      availableSupply: 500,
      price: 15.75,
      status: 'pending',
      createdAt: '2025-09-11',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Token Management
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tokens
              </Typography>
              <Typography variant="h5">
                {tokens.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Tokens
              </Typography>
              <Typography variant="h5">
                {tokens.filter(t => t.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Tokens
              </Typography>
              <Typography variant="h5">
                {tokens.filter(t => t.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Value
              </Typography>
              <Typography variant="h5">
                ${tokens.reduce((sum, t) => sum + (t.totalSupply * t.price), 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Token ID</TableCell>
              <TableCell>Land ID</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell align="right">Total Supply</TableCell>
              <TableCell align="right">Available</TableCell>
              <TableCell align="right">Price ($)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.id}>
                <TableCell>{token.tokenId}</TableCell>
                <TableCell>{token.landId}</TableCell>
                <TableCell>{token.owner}</TableCell>
                <TableCell align="right">{token.totalSupply}</TableCell>
                <TableCell align="right">{token.availableSupply}</TableCell>
                <TableCell align="right">${token.price}</TableCell>
                <TableCell>
                  <Chip 
                    label={token.status} 
                    color={getStatusColor(token.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{token.createdAt}</TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton size="small">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View on Blockchain">
                    <IconButton size="small">
                      <LinkIcon />
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

export default AdminTokens;