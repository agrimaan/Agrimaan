import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  CardActions,
  IconButton,
  Chip,
  Rating,
  Divider,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { RootState } from '../agronomist/store';

// Define types
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
  harvestDate: string;
  listedDate: string;
  quality: string;
  description: string;
  image: string;
  status: 'Available' | 'Sold' | 'Reserved';
  category: 'Grains' | 'Vegetables' | 'Fruits' | 'Herbs';
  dateSaved: string;
}

// Mock data
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
    harvestDate: '2024-08-15',
    listedDate: '2024-08-20',
    quality: 'Premium',
    description: 'High-quality wheat, freshly harvested. Perfect for milling.',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1c5a6ec21?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    status: 'Available',
    category: 'Grains',
    dateSaved: '2024-09-01'
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
    harvestDate: '2024-09-20',
    listedDate: '2024-09-25',
    description: 'Sweet and crisp Honeycrisp apples, freshly harvested.',
    image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    status: 'Available',
    category: 'Fruits',
    dateSaved: '2024-09-03'
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
    category: 'Grains',
    dateSaved: '2024-09-05'
  },
  {
    id: 8,
    cropName: 'Potatoes',
    variety: 'Russet',
    quantity: 25,
    unit: 'tons',
    pricePerUnit: 200,
    totalPrice: 5000,
    seller: 'Midwest Farms',
    sellerId: 7,
    sellerRating: 4.4,
    location: 'Idaho, USA',
    harvestDate: '2024-10-05',
    listedDate: '2024-10-10',
    quality: 'Grade A',
    description: 'Premium Russet potatoes, perfect for baking and frying.',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    status: 'Available',
    category: 'Vegetables',
    dateSaved: '2024-09-07'
  }
];

const BuyerSavedItems: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [savedItems, setSavedItems] = useState<SavedItem[]>(mockSavedItems);
  const [filteredItems, setFilteredItems] = useState<SavedItem[]>(mockSavedItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterQuality, setFilterQuality] = useState('All');
  const [sortBy, setSortBy] = useState('dateSaved');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<number[]>([]);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Apply filters and sorting
  useEffect(() => {
    let result = [...savedItems];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(item => 
        item.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filterCategory !== 'All') {
      result = result.filter(item => item.category === filterCategory);
    }
    
    // Apply quality filter
    if (filterQuality !== 'All') {
      result = result.filter(item => item.quality === filterQuality);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'dateSaved') {
        return sortOrder === 'asc' 
          ? new Date(a.dateSaved).getTime() - new Date(b.dateSaved).getTime()
          : new Date(b.dateSaved).getTime() - new Date(a.dateSaved).getTime();
      } else if (sortBy === 'price') {
        return sortOrder === 'asc' 
          ? a.pricePerUnit - b.pricePerUnit
          : b.pricePerUnit - a.pricePerUnit;
      } else if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.cropName.localeCompare(b.cropName)
          : b.cropName.localeCompare(a.cropName);
      }
      return 0;
    });
    
    setFilteredItems(result);
  }, [savedItems, searchTerm, filterCategory, filterQuality, sortBy, sortOrder]);

  // Handle remove from saved
  const handleRemoveFromSaved = (id: number) => {
    setItemToRemove(id);
    setConfirmDialog(true);
  };

  // Confirm remove from saved
  const confirmRemoveFromSaved = () => {
    if (itemToRemove !== null) {
      const removedItem = savedItems.find(item => item.id === itemToRemove);
      setSavedItems(prev => prev.filter(item => item.id !== itemToRemove));
      setConfirmDialog(false);
      setItemToRemove(null);
      
      // Show notification
      setNotification({
        show: true,
        message: `${removedItem?.cropName} removed from saved items`,
        type: 'info'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  // Handle add to cart
  const handleAddToCart = (id: number) => {
    if (!cartItems.includes(id)) {
      setCartItems(prev => [...prev, id]);
      const addedItem = savedItems.find(item => item.id === id);
      
      // Show notification
      setNotification({
        show: true,
        message: `${addedItem?.cropName} added to cart`,
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
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
            Cart ({cartItems.length})
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search saved items..."
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
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="dateSaved">Date Saved</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={sortOrder === 'asc' ? <SortIcon /> : <SortIcon sx={{ transform: 'rotate(180deg)' }} />}
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Notification */}
      {notification.show && (
        <Alert 
          severity={notification.type} 
          sx={{ mb: 3 }}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        >
          {notification.message}
        </Alert>
      )}

      {/* Saved Items */}
      {filteredItems.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FavoriteBorderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No saved items found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {savedItems.length === 0 
              ? "You haven't saved any items yet. Browse the marketplace and save items you're interested in."
              : "No items match your current filters. Try adjusting your search criteria."}
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
                    onClick={() => handleRemoveFromSaved(item.id)}
                  >
                    <FavoriteIcon color="error" />
                  </IconButton>
                  <Chip 
                    label={`Saved on ${new Date(item.dateSaved).toLocaleDateString()}`}
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      bottom: 8, 
                      left: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.8)'
                    }}
                  />
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
                    <Chip 
                      label={item.status} 
                      color={item.status === 'Available' ? 'success' : 'default'} 
                      size="small" 
                      variant="outlined"
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
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
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
                    disabled={cartItems.includes(item.id) || item.status !== 'Available'}
                  >
                    {cartItems.includes(item.id) ? 'In Cart' : 'Add to Cart'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
      >
        <DialogTitle>Remove from Saved Items</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this item from your saved list?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={confirmRemoveFromSaved} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BuyerSavedItems;