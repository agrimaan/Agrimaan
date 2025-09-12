import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Rating,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  FilterList as FilterListIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { RootState } from '../store';

// Define types
interface MarketplaceItem {
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
  harvestDate: string;
  listedDate: string;
  quality: string;
  description: string;
  image: string;
  status: 'Available' | 'Sold' | 'Reserved';
  category: 'Grains' | 'Vegetables' | 'Fruits' | 'Herbs';
}

// Mock marketplace data
const mockMarketplaceItems: MarketplaceItem[] = [
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
    harvestDate: '2024-08-15',
    listedDate: '2024-08-20',
    quality: 'Premium',
    description: 'High-quality wheat, freshly harvested. Perfect for milling.',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1c5a6ec21?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    status: 'Available',
    category: 'Grains'
  },
  {
    id: 2,
    cropName: 'Corn',
    variety: 'Sweet Corn',
    quantity: 50,
    unit: 'tons',
    pricePerUnit: 180,
    totalPrice: 9000,
    seller: 'Green Valley Co-op',
    sellerId: 3,
    sellerRating: 4.6,
    location: 'Nebraska, USA',
    harvestDate: '2024-09-01',
    listedDate: '2024-09-05',
    quality: 'Grade A',
    description: 'Fresh sweet corn, perfect for direct consumption or processing.',
    image: 'https://images.unsplash.com/photo-1601472543578-74691771b8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    status: 'Available',
    category: 'Vegetables'
  },
  {
    id: 3,
    cropName: 'Rice',
    variety: 'Long Grain',
    quantity: 30,
    unit: 'tons',
    pricePerUnit: 400,
    totalPrice: 12000,
    seller: 'Asian Farms Co.',
    sellerId: 4,
    sellerRating: 4.5,
    location: 'California, USA',
    harvestDate: '2024-09-30',
    listedDate: '2024-10-01',
    quality: 'Premium',
    description: 'Premium quality rice, perfect for restaurants and food processing.',
    image: 'https://images.unsplash.com/photo-1568347355280-d83c8fceb0fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    status: 'Available',
    category: 'Grains'
  },
  {
    id: 4,
    cropName: 'Tomatoes',
    variety: 'Roma',
    quantity: 20,
    unit: 'tons',
    pricePerUnit: 300,
    totalPrice: 6000,
    seller: 'Fresh Produce Inc.',
    sellerId: 5,
    sellerRating: 4.7,
    location: 'Florida, USA',
    harvestDate: '2024-10-05',
    listedDate: '2024-10-10',
    quality: 'Organic',
    description: 'Organically grown Roma tomatoes, perfect for sauces and canning.',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    status: 'Available',
    category: 'Vegetables'
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
    harvestDate: '2024-09-20',
    listedDate: '2024-09-25',
    quality: 'Premium',
    description: 'Sweet and crisp Honeycrisp apples, freshly harvested.',
    image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    status: 'Available',
    category: 'Fruits'
  },
  {
    id: 6,
    cropName: 'Soybeans',
    variety: 'Non-GMO',
    quantity: 40,
    unit: 'tons',
    pricePerUnit: 320,
    totalPrice: 12800,
    seller: 'Midwest Farms',
    sellerId: 7,
    sellerRating: 4.4,
    location: 'Illinois, USA',
    harvestDate: '2024-10-10',
    listedDate: '2024-10-15',
    quality: 'Grade A',
    description: 'Non-GMO soybeans, perfect for food production and animal feed.',
    image: 'https://images.unsplash.com/photo-1536054695850-b8f9e8d9fd5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    status: 'Available',
    category: 'Grains'
  }
];

const BuyerMarketplace: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterQuality, setFilterQuality] = useState('All');
  const [items, setItems] = useState<MarketplaceItem[]>(mockMarketplaceItems);
  const [savedItems, setSavedItems] = useState<number[]>([]);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [cart, setCart] = useState<MarketplaceItem[]>([]);

  // Filter items based on search term and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesQuality = filterQuality === 'All' || item.quality === filterQuality;
    
    return matchesSearch && matchesCategory && matchesQuality && item.status === 'Available';
  });

  // Handle purchase dialog
  const handleOpenPurchaseDialog = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setPurchaseDialog(true);
  };

  const handleClosePurchaseDialog = () => {
    setPurchaseDialog(false);
    setSelectedItem(null);
  };

  // Handle purchase
  const handlePurchase = () => {
    if (selectedItem) {
      // In a real app, this would make an API call to purchase the item
      alert(`Successfully purchased ${selectedItem.quantity} ${selectedItem.unit} of ${selectedItem.cropName} from ${selectedItem.seller}!`);
      
      // Update item status
      setItems(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { ...item, status: 'Sold' as const }
          : item
      ));
      
      handleClosePurchaseDialog();
    }
  };

  // Handle save/unsave item
  const handleToggleSaveItem = (id: number) => {
    if (savedItems.includes(id)) {
      setSavedItems(prev => prev.filter(itemId => itemId !== id));
    } else {
      setSavedItems(prev => [...prev, id]);
    }
  };

  // Handle add to cart
  const handleAddToCart = (item: MarketplaceItem) => {
    if (!cart.some(cartItem => cartItem.id === item.id)) {
      setCart(prev => [...prev, item]);
      alert(`Added ${item.cropName} to your cart!`);
    } else {
      alert(`${item.cropName} is already in your cart!`);
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
          Marketplace
        </Typography>
        
        <Box>
          <Button
            component={RouterLink}
            to="/buyer/cart"
            variant="outlined"
            startIcon={<ShoppingCartIcon />}
            sx={{ mr: 1 }}
          >
            Cart ({cart.length})
          </Button>
          <Button
            component={RouterLink}
            to="/buyer/saved"
            variant="outlined"
            startIcon={<FavoriteIcon />}
          >
            Saved ({savedItems.length})
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search crops, varieties, or sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="All">All Categories</MenuItem>
                <MenuItem value="Grains">Grains</MenuItem>
                <MenuItem value="Vegetables">Vegetables</MenuItem>
                <MenuItem value="Fruits">Fruits</MenuItem>
                <MenuItem value="Herbs">Herbs</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Quality</InputLabel>
              <Select
                value={filterQuality}
                onChange={(e) => setFilterQuality(e.target.value)}
                label="Quality"
              >
                <MenuItem value="All">All Qualities</MenuItem>
                <MenuItem value="Premium">Premium</MenuItem>
                <MenuItem value="Organic">Organic</MenuItem>
                <MenuItem value="Grade A">Grade A</MenuItem>
                <MenuItem value="Grade B">Grade B</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {filteredItems.map((item) => (
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
                  onClick={() => handleToggleSaveItem(item.id)}
                >
                  {savedItems.includes(item.id) ? (
                    <FavoriteIcon color="error" />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
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

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.description.length > 100 
                    ? `${item.description.substring(0, 100)}...` 
                    : item.description}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Harvested: {item.harvestDate} • Listed: {item.listedDate}
                </Typography>
              </CardContent>
              
              <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  sx={{ flexGrow: 1 }}
                  onClick={() => handleAddToCart(item)}
                  startIcon={<ShoppingCartIcon />}
                >
                  Add to Cart
                </Button>
                <Button 
                  variant="contained" 
                  sx={{ flexGrow: 1 }}
                  onClick={() => handleOpenPurchaseDialog(item)}
                >
                  Buy Now
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredItems.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No products found matching your criteria.
          </Typography>
        </Box>
      )}

      {/* Purchase Dialog */}
      <Dialog
        open={purchaseDialog}
        onClose={handleClosePurchaseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Confirm Purchase
            <IconButton onClick={handleClosePurchaseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedItem.cropName} - {selectedItem.variety}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Quantity: {selectedItem.quantity} {selectedItem.unit}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Price: ${selectedItem.pricePerUnit}/{selectedItem.unit}
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                Total: ${selectedItem.totalPrice.toLocaleString()}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Seller: {selectedItem.seller}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Location: {selectedItem.location}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quality: {selectedItem.quality}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Harvest Date: {selectedItem.harvestDate}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePurchaseDialog}>Cancel</Button>
          <Button 
            onClick={handlePurchase}
            variant="contained"
            color="success"
            startIcon={<ShoppingCartIcon />}
          >
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BuyerMarketplace;