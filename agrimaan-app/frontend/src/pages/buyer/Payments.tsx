
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  PhoneAndroid as PhoneIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

// Mock data for payment methods
const mockPaymentMethods = [
  {
    id: 1,
    type: 'Credit Card',
    name: 'HDFC Bank Credit Card',
    number: '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 4567',
    expiry: '05/27',
    isDefault: true,
    icon: <CreditCardIcon />
  },
  {
    id: 2,
    type: 'Bank Account',
    name: 'SBI Savings Account',
    number: '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 7890',
    ifsc: 'SBIN0001234',
    isDefault: false,
    icon: <BankIcon />
  },
  {
    id: 3,
    type: 'UPI',
    name: 'Google Pay',
    number: 'user@okicici',
    isDefault: false,
    icon: <PhoneIcon />
  }
];

// Mock data for recent transactions
const mockTransactions = [
  {
    id: 'TXN-2025-001',
    date: '2025-08-15',
    amount: 5300,
    paymentMethod: 'HDFC Bank Credit Card',
    orderId: 'ORD-2025-001',
    status: 'Completed'
  },
  {
    id: 'TXN-2025-002',
    date: '2025-07-22',
    amount: 2750,
    paymentMethod: 'Google Pay',
    orderId: 'ORD-2025-002',
    status: 'Completed'
  },
  {
    id: 'TXN-2025-003',
    date: '2025-06-10',
    amount: 4350,
    paymentMethod: 'SBI Savings Account',
    orderId: 'ORD-2025-003',
    status: 'Completed'
  }
];

const Payments: React.FC = () => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);
  const [paymentType, setPaymentType] = useState('Credit Card');
  
  const handleAddDialogOpen = () => {
    setOpenAddDialog(true);
  };
  
  const handleAddDialogClose = () => {
    setOpenAddDialog(false);
  };
  
  const handleDeleteDialogOpen = (id: number) => {
    setSelectedPaymentMethod(id);
    setOpenDeleteDialog(true);
  };
  
  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setSelectedPaymentMethod(null);
  };
  
  const handleAddPaymentMethod = () => {
    // In a real app, this would call an API to add the payment method
    handleAddDialogClose();
  };
  
  const handleDeletePaymentMethod = () => {
    // In a real app, this would call an API to delete the payment method
    handleDeleteDialogClose();
  };
  
  const handleSetDefault = (id: number) => {
    // In a real app, this would call an API to set the default payment method
    console.log(`Setting payment method ${id} as default`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              Payment Methods
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAddDialogOpen}
            >
              Add Payment Method
            </Button>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Manage your payment methods and view transaction history
          </Typography>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Payment Methods
            </Typography>
            
            {mockPaymentMethods.map((method) => (
              <Card key={method.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container alignItems="center">
                    <Grid item xs={1}>
                      <Box sx={{ color: 'primary.main' }}>
                        {method.icon}
                      </Box>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body1" fontWeight="medium">
                        {method.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {method.number}
                      </Typography>
                      {method.expiry && (
                        <Typography variant="body2" color="text.secondary">
                          Expires: {method.expiry}
                        </Typography>
                      )}
                      {method.ifsc && (
                        <Typography variant="body2" color="text.secondary">
                          IFSC: {method.ifsc}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={2} textAlign="center">
                      {method.isDefault ? (
                        <Box display="flex" alignItems="center">
                          <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="success.main">
                            Default
                          </Typography>
                        </Box>
                      ) : (
                        <Button 
                          size="small" 
                          variant="text"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Set Default
                        </Button>
                      )}
                    </Grid>
                    <Grid item xs={2} textAlign="right">
                      <IconButton size="small" sx={{ mr: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteDialogOpen(method.id)}
                        disabled={method.isDefault}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            
            {mockPaymentMethods.length === 0 && (
              <Box textAlign="center" py={4}>
                <PaymentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No payment methods added yet
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleAddDialogOpen}
                  sx={{ mt: 2 }}
                >
                  Add Payment Method
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Payment Security */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Payment Security
              </Typography>
            </Box>
            
            <Typography variant="body2" paragraph>
              Your payment information is securely stored and encrypted. We use industry-standard security measures to protect your data.
            </Typography>
            
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                Security Features:
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                  <li>End-to-end encryption</li>
                  <li>PCI DSS compliance</li>
                  <li>Two-factor authentication</li>
                  <li>Fraud detection systems</li>
                </ul>
              </Typography>
            </Box>
            
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable payment notifications"
            />
          </Paper>
        </Grid>
        
        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            
            {mockTransactions.map((transaction) => (
              <Box key={transaction.id} sx={{ py: 2 }}>
                <Grid container alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(transaction.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {transaction.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Order ID
                    </Typography>
                    <Typography variant="body1">
                      {transaction.orderId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Method
                    </Typography>
                    <Typography variant="body1">
                      {transaction.paymentMethod}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3} textAlign={{ sm: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      \u20b9{transaction.amount.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
                {mockTransactions.indexOf(transaction) < mockTransactions.length - 1 && (
                  <Divider sx={{ mt: 2 }} />
                )}
              </Box>
            ))}
            
            {mockTransactions.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary">
                  No recent transactions
                </Typography>
              </Box>
            )}
            
            {mockTransactions.length > 0 && (
              <Box textAlign="center" mt={2}>
                <Button variant="outlined">
                  View All Transactions
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Add Payment Method Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Payment Type"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            margin="normal"
          >
            <MenuItem value="Credit Card">Credit Card</MenuItem>
            <MenuItem value="Bank Account">Bank Account</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
          </TextField>
          
          {paymentType === 'Credit Card' && (
            <>
              <TextField
                fullWidth
                label="Card Holder Name"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Card Number"
                margin="normal"
                placeholder="1234 5678 9012 3456"
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    margin="normal"
                    placeholder="MM/YY"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    margin="normal"
                    type="password"
                  />
                </Grid>
              </Grid>
            </>
          )}
          
          {paymentType === 'Bank Account' && (
            <>
              <TextField
                fullWidth
                label="Account Holder Name"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Account Number"
                margin="normal"
              />
              <TextField
                fullWidth
                label="IFSC Code"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Bank Name"
                margin="normal"
              />
            </>
          )}
          
          {paymentType === 'UPI' && (
            <>
              <TextField
                fullWidth
                label="UPI ID"
                margin="normal"
                placeholder="username@upi"
                helperText="Enter your UPI ID (e.g., username@okicici, username@ybl)"
              />
            </>
          )}
          
          <FormControlLabel
            control={<Switch />}
            label="Set as default payment method"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button onClick={handleAddPaymentMethod} variant="contained">
            Add Payment Method
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Payment Method Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Payment Method</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this payment method? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeletePaymentMethod} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Payments;
