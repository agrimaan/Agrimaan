import React, { useState } from 'react';
import { 
  Box, Paper, Typography, Grid, Card, CardContent, Chip, 
  CircularProgress, useTheme, Divider, IconButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Tooltip, Button, Avatar, Link
} from '@mui/material';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Legend, ResponsiveContainer, Tooltip as RechartsTooltip, PieChart, Pie, Cell
} from 'recharts';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SendIcon from '@mui/icons-material/Send';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TokenIcon from '@mui/icons-material/Token';
import LandscapeIcon from '@mui/icons-material/Landscape';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';

// Define prop types for the component
interface BlockchainVisualizationProps {
  walletData?: {
    address: string;
    balance: number;
    createdAt: string;
  };
  transactions?: Array<{
    id: string;
    txHash: string;
    from: string;
    to: string;
    amount: number;
    tokenType: string;
    status: string;
    initiatedAt: string;
    completedAt?: string;
    type: 'outgoing' | 'incoming';
  }>;
  tokens?: Array<{
    tokenId: string;
    tokenType: string;
    metadata: {
      name: string;
      description?: string;
      location?: any;
      area?: number;
      coordinates?: number[][][];
      propertyType?: string;
      soilType?: string;
      buildingType?: string;
      facilities?: string[];
      yearBuilt?: number;
      valuation?: number;
    };
    status: string;
    createdAt: string;
  }>;
  investments?: Array<{
    investmentId: string;
    offering: {
      offeringId: string;
      parentToken: {
        tokenId: string;
        tokenType: string;
        metadata: {
          name: string;
        };
      };
      pricePerShare: number;
    };
    shares: number;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  marketData?: {
    activeOfferings: Array<{
      offeringId: string;
      tokenType: string;
      name: string;
      creator: string;
      pricePerShare: number;
      totalShares: number;
      createdAt: string;
    }>;
    recentTransactions: Array<{
      txHash: string;
      amount: number;
      tokenType: string;
      timestamp: string;
      type: string;
      shares?: number;
    }>;
    stats: {
      landTokens: number;
      farmhouseTokens: number;
      fractionalizedTokens: number;
      totalAGM: number;
    };
  };
  loading?: boolean;
  error?: string | null;
  onCopyAddress?: (address: string) => void;
  onViewTransaction?: (txHash: string) => void;
  onViewToken?: (tokenId: string) => void;
  onViewInvestment?: (investmentId: string) => void;
}

const BlockchainVisualization: React.FC<BlockchainVisualizationProps> = ({
  walletData,
  transactions = [],
  tokens = [],
  investments = [],
  marketData,
  loading = false,
  error = null,
  onCopyAddress,
  onViewTransaction,
  onViewToken,
  onViewInvestment
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Format address for display (truncate)
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Handle copy address
  const handleCopyAddress = (address: string) => {
    if (onCopyAddress) {
      onCopyAddress(address);
    } else {
      navigator.clipboard.writeText(address);
    }
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get token icon based on type
  const getTokenIcon = (tokenType: string) => {
    switch (tokenType.toUpperCase()) {
      case 'AGM':
        return <TokenIcon />;
      case 'LAND':
        return <LandscapeIcon />;
      case 'FARMHOUSE':
        return <HomeIcon />;
      default:
        return <TokenIcon />;
    }
  };

  // Get transaction status color
  const getTransactionStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'failed':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  // Prepare transaction data for chart
  const prepareTransactionChartData = () => {
    // Group transactions by date
    const groupedByDate = transactions.reduce((acc: Record<string, { incoming: number, outgoing: number }>, transaction) => {
      const date = new Date(transaction.initiatedAt).toLocaleDateString();
      
      if (!acc[date]) {
        acc[date] = { incoming: 0, outgoing: 0 };
      }
      
      if (transaction.type === 'incoming') {
        acc[date].incoming += transaction.amount;
      } else {
        acc[date].outgoing += transaction.amount;
      }
      
      return acc;
    }, {});
    
    // Convert to array for chart
    return Object.entries(groupedByDate).map(([date, values]) => ({
      date,
      incoming: values.incoming,
      outgoing: values.outgoing
    }));
  };

  // Prepare token distribution data for chart
  const prepareTokenDistributionData = () => {
    // Count tokens by type
    const tokenCounts = tokens.reduce((acc: Record<string, number>, token) => {
      const type = token.tokenType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to array for chart
    return Object.entries(tokenCounts).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };

  // Prepare investment data for chart
  const prepareInvestmentChartData = () => {
    // Group investments by token type
    const groupedByType = investments.reduce((acc: Record<string, number>, investment) => {
      const type = investment.offering.parentToken.tokenType;
      acc[type] = (acc[type] || 0) + investment.amount;
      return acc;
    }, {});
    
    // Convert to array for chart
    return Object.entries(groupedByType).map(([type, amount]) => ({
      name: type,
      value: amount
    }));
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Render wallet card
  const renderWalletCard = () => {
    if (!walletData) return null;
    
    return (
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                  <AccountBalanceWalletIcon />
                </Avatar>
                <Typography variant="h6">My Wallet</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Address:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {formatAddress(walletData.address)}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleCopyAddress(walletData.address)}
                  sx={{ ml: 1 }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                Created: {formatDate(walletData.createdAt)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                  {walletData.balance} AGM
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Balance
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<SendIcon />}
                    size="small"
                  >
                    Send
                  </Button>
                  <Button 
                    variant="outlined"
                    startIcon={<ReceiptLongIcon />}
                    size="small"
                  >
                    History
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Render transaction history
  const renderTransactionHistory = () => {
    if (transactions.length === 0) return null;
    
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Transaction History</Typography>
        
        {transactions.length > 0 && (
          <Box sx={{ height: 250, mb: 3 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepareTransactionChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="incoming" name="Received" fill={theme.palette.success.main} />
                <Bar dataKey="outgoing" name="Sent" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>From/To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((tx) => (
                  <TableRow key={tx.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {tx.type === 'incoming' ? (
                          <Chip 
                            label="Received" 
                            size="small" 
                            color="success"
                            sx={{ mr: 1 }}
                          />
                        ) : (
                          <Chip 
                            label="Sent" 
                            size="small" 
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                        )}
                        {getTokenIcon(tx.tokenType)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {tx.amount} {tx.tokenType}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={tx.type === 'incoming' ? tx.from : tx.to}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {formatAddress(tx.type === 'incoming' ? tx.from : tx.to)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={tx.status} 
                        size="small"
                        sx={{ 
                          backgroundColor: `${getTransactionStatusColor(tx.status)}20`,
                          color: getTransactionStatusColor(tx.status),
                          borderColor: getTransactionStatusColor(tx.status),
                          borderWidth: 1,
                          borderStyle: 'solid'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(tx.initiatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={() => onViewTransaction && onViewTransaction(tx.txHash)}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    );
  };

  // Render tokens section
  const renderTokens = () => {
    if (tokens.length === 0) return null;
    
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>My Assets</Typography>
        
        <Grid container spacing={3}>
          {/* Token distribution chart */}
          <Grid item xs={12} md={4}>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareTokenDistributionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    //label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`
                   // label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}                
                  label={(props: any) => {
                    const { name, percent } = props;
                    if (percent === undefined) return '';
                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  >
                    {prepareTokenDistributionData().map((entry, index) => {
                      const colors = [
                        theme.palette.primary.main,
                        theme.palette.secondary.main,
                        theme.palette.error.main,
                        theme.palette.warning.main,
                        theme.palette.info.main,
                      ];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          
          {/* Token cards */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {tokens.slice(0, 4).map((token) => (
                <Grid item xs={12} sm={6} key={token.tokenId}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      cursor: onViewToken ? 'pointer' : 'default',
                      '&:hover': onViewToken ? { boxShadow: 3 } : {}
                    }}
                    onClick={() => onViewToken && onViewToken(token.tokenId)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 
                              token.tokenType === 'LAND' ? theme.palette.success.light :
                              token.tokenType === 'FARMHOUSE' ? theme.palette.warning.light :
                              theme.palette.primary.light,
                            mr: 1,
                            width: 32,
                            height: 32
                          }}
                        >
                          {getTokenIcon(token.tokenType)}
                        </Avatar>
                        <Typography variant="subtitle1" noWrap>
                          {token.metadata.name}
                        </Typography>
                      </Box>
                      
                      <Chip 
                        label={token.tokenType} 
                        size="small" 
                        sx={{ mb: 1 }}
                      />
                      
                      {token.metadata.description && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {token.metadata.description}
                        </Typography>
                      )}
                      
                      {token.metadata.area && (
                        <Typography variant="body2">
                          Area: {token.metadata.area} ha
                        </Typography>
                      )}
                      
                      {token.metadata.valuation && (
                        <Typography variant="body2">
                          Value: {token.metadata.valuation} AGM
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {tokens.length > 4 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button variant="text">View All {tokens.length} Assets</Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // Render investments section
  const renderInvestments = () => {
    if (investments.length === 0) return null;
    
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>My Investments</Typography>
        
        <Grid container spacing={3}>
          {/* Investment distribution chart */}
          <Grid item xs={12} md={4}>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareInvestmentChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    //label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    label={(props: any) => {
                      const { name, percent } = props;
                      if (percent === undefined) return '';
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }}
                  >
                    {prepareInvestmentChartData().map((entry, index) => {
                      const colors = [
                        theme.palette.success.main,
                        theme.palette.warning.main,
                        theme.palette.info.main,
                      ];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          
          {/* Investment table */}
          <Grid item xs={12} md={8}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Asset</TableCell>
                    <TableCell>Shares</TableCell>
                    <TableCell>Investment</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {investments.map((investment) => (
                    <TableRow key={investment.investmentId} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getTokenIcon(investment.offering.parentToken.tokenType)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {investment.offering.parentToken.metadata.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {investment.shares} shares
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {investment.amount} AGM
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({investment.offering.pricePerShare} AGM/share)
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(investment.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          onClick={() => onViewInvestment && onViewInvestment(investment.investmentId)}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // Render market data section
  const renderMarketData = () => {
    if (!marketData) return null;
    
    return (
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Market Overview</Typography>
        
        <Grid container spacing={3}>
          {/* Market stats */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Market Statistics</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Land Tokens
                    </Typography>
                    <Typography variant="h6">
                      {marketData.stats.landTokens}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Farmhouse Tokens
                    </Typography>
                    <Typography variant="h6">
                      {marketData.stats.farmhouseTokens}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Fractionalized Assets
                    </Typography>
                    <Typography variant="h6">
                      {marketData.stats.fractionalizedTokens}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total AGM Supply
                    </Typography>
                    <Typography variant="h6">
                      {marketData.stats.totalAGM.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Active offerings */}
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle1" gutterBottom>Active Offerings</Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Asset</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Creator</TableCell>
                    <TableCell>Price/Share</TableCell>
                    <TableCell>Total Shares</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {marketData.activeOfferings.slice(0, 5).map((offering) => (
                    <TableRow key={offering.offeringId} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {offering.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getTokenIcon(offering.tokenType)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {offering.tokenType}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {offering.creator}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {offering.pricePerShare} AGM
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {offering.totalShares}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="outlined">
                          Invest
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {marketData.activeOfferings.length > 5 && (
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Link href="#" underline="hover">
                  View All Offerings
                </Link>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {renderWalletCard()}
      {renderTransactionHistory()}
      {renderTokens()}
      {renderInvestments()}
      {renderMarketData()}
    </Box>
  );
};

export default BlockchainVisualization;