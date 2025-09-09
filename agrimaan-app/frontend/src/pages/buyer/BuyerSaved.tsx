import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Rating,
  Paper
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';

// Mock saved items
interface SavedItem {
  id: number;
  cropName: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  seller: string;
  sellerId: number;
  sellerRating: number;
  location: string;
  quality: string;
  description: string;
  image: string;
  status: 'Available' | 'Sold' | 'Reserved';
  category: 'Grains' | 'Vegetables' | 'Fruits' | 'Herbs';
}

const mockSavedItems: SavedItem[] = [
  {
    id: 1,
    cropName: 'Wheat',
    variety: 'Hard Red Winter',
    quantity: 100,
    unit: 'tons',
    pricePerUnit: 250,
    totalPrice: 25000,
    seller: 'John Smith Farm',
    sellerId: 2,
    sellerRating: 4.8,
    location: 'Iowa, USA',
    quality: 'Premium',
    description: 'High-quality wheat, freshly harvested. Perfect for milling.',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1c5a6ec21?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    status: 'Available',
    category: 'Grains'
  },
  {
    id: 5,
    cropName: 'Apples',
    variety: 'Honeycrisp',
    quantity: 15,
    unit: 'tons',
    pricePerUnit: 450,
    totalPrice: 6750,
    seller: 'Orchard Valley',
    sellerId: 6,
    sellerRating: 4.9,
    location: 'Washington, USA',
    quality: 'Premium',
    description: 'Sweet and crisp Honeycrisp apples, freshly harvested.',
    image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    status: 'Available',
    category: 'Fruits'
  }
];

const BuyerSaved: React.FC = () => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>(mockSavedItems);
  const [cart, setCart] = useState<number[]>([]);

  // Handle remove from saved
  const handleRemoveFromSaved = (id: number) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  // Handle add to cart
  const handleAddToCart = (id: number) => {
    if (!cart.includes(id)) {
      setCart(prev => [...prev, id]);
      alert('Item added to cart!');
    } else {
      alert('Item is already in your cart!');
    }
  };

  // Get quality color
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Premium':
      case 'Organic':
        return 'success';
      case 'Grade A':
        return 'primary';
      case 'Grade B':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Saved Items
        </Typography>
        
        <Box>
          <Button
            component={RouterLink}
            to="/buyer/marketplace"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 1 }}
          >
            Back to Marketplace
          </Button>
          <Button
            component={RouterLink}
            to="/buyer/cart"
            variant="contained"
            startIcon={<ShoppingCartIcon />}
          >
            Cart ({cart.length})
          </Button>
        </Box>
      </Box>

      {savedItems.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You haven't saved any items yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Browse the marketplace and save items you're interested in for later.
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
          {savedItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image}
                    alt={item.cropName}
                  />
                  <IconButton 
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      bgcolor: 'white', 
                      '&:hover': { bgcolor: 'white' } 
                    }}
                    onClick={() => handleRemoveFromSaved(item.id)}
                  >
                    <FavoriteIcon color="error" />
                  </IconButton>
                </Box>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {item.cropName} - {item.variety}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={item.quality} 
                      color={getQualityColor(item.quality) as any} 
                      size="small" 
                    />
                    <Chip 
                      label={item.category} 
                      variant="outlined" 
                      size="small" 
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AttachMoneyIcon fontSize="small" />
                    <Typography variant="h6" color="primary">
                      ${item.pricePerUnit}/{item.unit}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total: ${item.totalPrice.toLocaleString()}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {item.seller}
                    </Typography>
                    <Rating value={item.sellerRating} size="small" precision={0.1} readOnly />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {item.location}
                    </Typography>
                  </Box>
                </CardContent>
                
                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    color="error"
                    sx={{ flexGrow: 1 }}
                    onClick={() => handleRemoveFromSaved(item.id)}
                    startIcon={<DeleteIcon />}
                  >
                    Remove
                  </Button>
                  <Button 
                    variant="contained" 
                    sx={{ flexGrow: 1 }}
                    onClick={() => handleAddToCart(item.id)}
                    startIcon={<ShoppingCartIcon />}
                  >
                    Add to Cart
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default BuyerSaved;