import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';

// Mock cart items
interface CartItem {
  id: number;
  cropName: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  seller: string;
  image: string;
}

const mockCartItems: CartItem[] = [
  {
    id: 1,
    cropName: 'Wheat',
    variety: 'Hard Red Winter',
    quantity: 10,
    unit: 'tons',
    pricePerUnit: 250,
    totalPrice: 2500,
    seller: 'John Smith Farm',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1c5a6ec21?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: 2,
    cropName: 'Corn',
    variety: 'Sweet Corn',
    quantity: 5,
    unit: 'tons',
    pricePerUnit: 180,
    totalPrice: 900,
    seller: 'Green Valley Co-op',
    image: 'https://images.unsplash.com/photo-1601472543578-74691771b8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  }
];

const BuyerCart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  // Calculate cart totals
  const cartTotal = cartItems.reduce((total, item) => total + item.totalPrice, 0);
  const shippingCost = cartItems.length > 0 ? 250 : 0;
  const taxRate = 0.08;
  const taxAmount = cartTotal * taxRate;
  const orderTotal = cartTotal + shippingCost + taxAmount;

  // Handle quantity change
  const handleQuantityChange = (id: number, change: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * item.pricePerUnit
        };
      }
      return item;
    }));
  };

  // Handle remove item
  const handleRemoveItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Handle checkout
  const handleCheckout = () => {
    setCheckoutDialog(true);
  };

  // Handle place order
  const handlePlaceOrder = () => {
    // In a real app, this would make an API call to place the order
    alert('Order placed successfully!');
    setCartItems([]);
    setCheckoutDialog(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Shopping Cart
        </Typography>
        
        <Button
          component={RouterLink}
          to="/buyer/marketplace"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Continue Shopping
        </Button>
      </Box>

      {cartItems.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Looks like you haven't added any products to your cart yet.
          </Typography>
          <Button
            component={RouterLink}
            to="/buyer/marketplace"
            variant="contained"
            startIcon={<ShoppingCartIcon />}
          >
            Browse Marketplace
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            component="img"
                            sx={{ width: 60, height: 60, mr: 2, objectFit: 'cover' }}
                            src={item.image}
                            alt={item.cropName}
                          />
                          <Box>
                            <Typography variant="body1">
                              {item.cropName} - {item.variety}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Seller: {item.seller}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>${item.pricePerUnit}/{item.unit}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuantityChange(item.id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">${item.totalPrice.toLocaleString()}</TableCell>
                      <TableCell>
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Box sx={{ my: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Subtotal</Typography>
                    <Typography variant="body1">${cartTotal.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Shipping</Typography>
                    <Typography variant="body1">${shippingCost.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Tax (8%)</Typography>
                    <Typography variant="body1">${taxAmount.toLocaleString()}</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6">${orderTotal.toLocaleString()}</Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleCheckout}
                  sx={{ mt: 2 }}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Checkout Dialog */}
      <Dialog
        open={checkoutDialog}
        onClose={() => setCheckoutDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Checkout</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Complete your order by providing shipping and payment information.
          </Typography>
          <TextField
            label="Shipping Address"
            multiline
            rows={3}
            fullWidth
            margin="normal"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
          />
          <TextField
            label="Payment Method"
            fullWidth
            margin="normal"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            helperText="For demo purposes only. No real payment will be processed."
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Subtotal</Typography>
              <Typography variant="body1">${cartTotal.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Shipping</Typography>
              <Typography variant="body1">${shippingCost.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Tax (8%)</Typography>
              <Typography variant="body1">${taxAmount.toLocaleString()}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">${orderTotal.toLocaleString()}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handlePlaceOrder}
            disabled={!shippingAddress || !paymentMethod}
          >
            Place Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BuyerCart;