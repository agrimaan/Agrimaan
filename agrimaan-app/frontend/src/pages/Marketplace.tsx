import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Avatar,
  Rating,
  Alert,
  Autocomplete
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SellIcon from '@mui/icons-material/Sell';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningIcon from '@mui/icons-material/Warning';

// Add current user context (in real app, this would come from Redux/Context)
const CURRENT_USER = {
  id: 1,
  name: 'Your Farm',
  location: 'Your Location'
};

// Add interface for user's crops
interface UserCrop {
  id: number;
  name: string;
  variety: string;
  plantedArea: string;
  harvestDate: string;
  status: string;
  estimatedYield: number;
  unit: string;
}

// Mock user crops (from Crops page)
const mockUserCrops: UserCrop[] = [
  {
    id: 1,
    name: 'Wheat',
    variety: 'Hard Red Winter',
    plantedArea: '45 acres',
    harvestDate: '2024-08-10',
    status: 'Harvested',
    estimatedYield: 100,
    unit: 'tons'
  },
  {
    id: 2,
    name: 'Corn',
    variety: 'Sweet Corn',
    plantedArea: '30 acres',
    harvestDate: '2024-09-15',
    status: 'Harvested',
    estimatedYield: 75,
    unit: 'tons'
  },
  {
    id: 3,
    name: 'Soybeans',
    variety: 'Round-Up Ready',
    plantedArea: '25 acres',
    harvestDate: '2024-10-20',
    status: 'Growing',
    estimatedYield: 50,
    unit: 'tons'
  },
  {
    id: 4,
    name: 'Rice',
    variety: 'Long Grain',
    plantedArea: '20 acres',
    harvestDate: '2024-09-30',
    status: 'Harvested',
    estimatedYield: 60,
    unit: 'tons'
  }
];

interface MarketplaceItem {
  id: number;
  cropName: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  seller: string;
  sellerId: number; // Add seller ID
  sellerRating: number;
  location: string;
  harvestDate: string;
  listedDate: string;
  quality: string;
  description: string;
  image: string;
  status: 'Available' | 'Sold' | 'Reserved';
  category: 'Grains' | 'Vegetables' | 'Fruits' | 'Herbs';
  userCropId?: number; // Reference to user's crop
}

interface ListingFormData {
  selectedCrop: UserCrop | null;
  quantity: string;
  pricePerUnit: string;
  quality: string;
  description: string;
  image: string;
}

// Update mock marketplace data with seller IDs
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
    sellerId: 2, // Different from current user
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
    seller: 'Your Farm', // This is the current user's listing
    sellerId: 1, // Same as current user
    sellerRating: 4.5,
    location: 'Your Location',
    harvestDate: '2024-09-30',
    listedDate: '2024-10-01',
    quality: 'Premium',
    description: 'Premium quality rice from our farm.',
    image: 'https://images.unsplash.com/photo-1568347355280-d83c8fceb0fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    status: 'Available',
    category: 'Grains',
    userCropId: 4
  }
];

const Marketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<MarketplaceItem[]>(mockMarketplaceItems);
  const [tabValue, setTabValue] = useState(0);
  const [listingDialog, setListingDialog] = useState(false);
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [userCrops] = useState<UserCrop[]>(mockUserCrops);
  
  const [listingForm, setListingForm] = useState<ListingFormData>({
    selectedCrop: null,
    quantity: '',
    pricePerUnit: '',
    quality: 'Grade A',
    description: '',
    image: ''
  });

  // Filter items based on tab
  const getFilteredItems = () => {
    let filtered = items.filter(item => {
      const matchesSearch = item.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.seller.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });

    switch (tabValue) {
      case 0: // All Listings
        return filtered;
      case 1: // Available (not mine)
        return filtered.filter(item => item.status === 'Available' && item.sellerId !== CURRENT_USER.id);
      case 2: // My Listings
        return filtered.filter(item => item.sellerId === CURRENT_USER.id);
      default:
        return filtered;
    }
  };

  const filteredItems = getFilteredItems();

  // Get available crops for listing (only harvested crops)
  const getAvailableCropsForListing = () => {
    return userCrops.filter(crop => crop.status === 'Harvested');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenListingDialog = () => {
    setListingForm({
      selectedCrop: null,
      quantity: '',
      pricePerUnit: '',
      quality: 'Grade A',
      description: '',
      image: ''
    });
    setListingDialog(true);
  };

  const handleCloseListingDialog = () => {
    setListingDialog(false);
  };

  const handleCropSelection = (crop: UserCrop | null) => {
    setListingForm(prev => ({
      ...prev,
      selectedCrop: crop,
      quantity: crop ? Math.min(crop.estimatedYield, parseFloat(prev.quantity) || crop.estimatedYield).toString() : '',
      image: prev.image || getCropImage(crop?.name || '')
    }));
  };

  const getCropImage = (cropName: string) => {
    const imageMap: { [key: string]: string } = {
      'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1c5a6ec21?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'Corn': 'https://images.unsplash.com/photo-1601472543578-74691771b8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'Soybeans': 'https://images.unsplash.com/photo-1536054695850-b8f9e8d9fd5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'Rice': 'https://images.unsplash.com/photo-1568347355280-d83c8fceb0fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'Tomatoes': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    };
    return imageMap[cropName] || 'https://images.unsplash.com/photo-1574323347407-f5e1c5a6ec21?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  };

  const getCropCategory = (cropName: string): 'Grains' | 'Vegetables' | 'Fruits' | 'Herbs' => {
    const categoryMap: { [key: string]: 'Grains' | 'Vegetables' | 'Fruits' | 'Herbs' } = {
      'Wheat': 'Grains',
      'Corn': 'Vegetables',
      'Soybeans': 'Grains',
      'Rice': 'Grains',
      'Tomatoes': 'Vegetables'
    };
    return categoryMap[cropName] || 'Grains';
  };

  const handleListingInputChange = (field: keyof Omit<ListingFormData, 'selectedCrop'>, value: string) => {
    setListingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitListing = () => {
    if (!listingForm.selectedCrop) return;

    const newListing: MarketplaceItem = {
      id: Math.max(...items.map(i => i.id)) + 1,
      cropName: listingForm.selectedCrop.name,
      variety: listingForm.selectedCrop.variety,
      quantity: parseFloat(listingForm.quantity),
      unit: listingForm.selectedCrop.unit,
      pricePerUnit: parseFloat(listingForm.pricePerUnit),
      totalPrice: parseFloat(listingForm.quantity) * parseFloat(listingForm.pricePerUnit),
      seller: CURRENT_USER.name,
      sellerId: CURRENT_USER.id,
      sellerRating: 4.5,
      location: CURRENT_USER.location,
      harvestDate: listingForm.selectedCrop.harvestDate,
      listedDate: new Date().toISOString().split('T')[0],
      quality: listingForm.quality,
      description: listingForm.description,
      image: listingForm.image || getCropImage(listingForm.selectedCrop.name),
      status: 'Available',
      category: getCropCategory(listingForm.selectedCrop.name),
      userCropId: listingForm.selectedCrop.id
    };

    setItems(prev => [...prev, newListing]);
    handleCloseListingDialog();
    alert('Listing created successfully!');
  };

  const handleOpenPurchaseDialog = (item: MarketplaceItem) => {
    if (item.sellerId === CURRENT_USER.id) {
      alert("You cannot buy your own listing!");
      return;
    }
    setSelectedItem(item);
    setPurchaseDialog(true);
  };

  const handleClosePurchaseDialog = () => {
    setPurchaseDialog(false);
    setSelectedItem(null);
  };

  const handlePurchase = () => {
    if (selectedItem) {
      setItems(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { ...item, status: 'Sold' as const }
          : item
      ));
      handleClosePurchaseDialog();
      alert(`Successfully purchased ${selectedItem.quantity} ${selectedItem.unit} of ${selectedItem.cropName} from ${selectedItem.seller}!`);
    }
  };

  const isListingFormValid = () => {
    return listingForm.selectedCrop !== null &&
           listingForm.quantity.trim() !== '' &&
           listingForm.pricePerUnit.trim() !== '' &&
           parseFloat(listingForm.quantity) > 0 &&
           parseFloat(listingForm.pricePerUnit) > 0 &&
           parseFloat(listingForm.quantity) <= (listingForm.selectedCrop?.estimatedYield || 0);
  };

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

  const isOwnListing = (item: MarketplaceItem) => {
    return item.sellerId === CURRENT_USER.id;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="div">
          Marketplace
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenListingDialog}
          disabled={getAvailableCropsForListing().length === 0}
        >
          List for Sale
        </Button>
      </Box>

      {getAvailableCropsForListing().length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You need harvested crops to create listings. Harvest your crops first!
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label={`All Listings (${items.length})`} />
        <Tab label={`Available (${items.filter(item => item.status === 'Available' && item.sellerId !== CURRENT_USER.id).length})`} />
        <Tab label={`My Listings (${items.filter(item => item.sellerId === CURRENT_USER.id).length})`} />
      </Tabs>

      {/* Search and Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
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
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            label="Category"
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Grains">Grains</MenuItem>
            <MenuItem value="Vegetables">Vegetables</MenuItem>
            <MenuItem value="Fruits">Fruits</MenuItem>
            <MenuItem value="Herbs">Herbs</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Marketplace Items Grid */}
      <Grid container spacing={3}>
        {filteredItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              border: isOwnListing(item) ? '2px solid #1976d2' : 'none',
              position: 'relative'
            }}>
              {isOwnListing(item) && (
                <Chip 
                  label="Your Listing" 
                  color="primary" 
                  size="small" 
                  sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                />
              )}
              
              <CardMedia
                component="img"
                height="140"
                image={item.image}
                alt={item.cropName}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {item.cropName}
                  </Typography>
                  <Chip 
                    label={item.status} 
                    color={item.status === 'Available' ? 'success' : 'default'} 
                    size="small" 
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {item.variety} • {item.quantity} {item.unit}
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
                  <Typography variant="h6" color="primary" sx={{ ml: 0.5 }}>
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
                  {item.description}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Harvested: {item.harvestDate} • Listed: {item.listedDate}
                </Typography>
              </CardContent>
              
              <Box sx={{ p: 2 }}>
                {isOwnListing(item) ? (
                  <Button 
                    variant="outlined" 
                    fullWidth
                    disabled
                    startIcon={<PersonIcon />}
                  >
                    Your Listing
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => handleOpenPurchaseDialog(item)}
                    disabled={item.status !== 'Available'}
                  >
                    {item.status === 'Available' ? 'Buy Now' : 'Sold Out'}
                  </Button>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredItems.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {tabValue === 2 ? "You haven't created any listings yet." : "No items found matching your criteria."}
          </Typography>
        </Box>
      )}

      {/* List for Sale Dialog */}
      <Dialog 
        open={listingDialog} 
        onClose={handleCloseListingDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SellIcon />
              List for Sale
            </Box>
            <IconButton onClick={handleCloseListingDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              options={getAvailableCropsForListing()}
              getOptionLabel={(option) => `${option.name} - ${option.variety} (${option.estimatedYield} ${option.unit} available)`}
              value={listingForm.selectedCrop}
              onChange={(_, value) => handleCropSelection(value)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Select Crop to List" 
                  required 
                  helperText="Only harvested crops can be listed"
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">
                      {option.name} - {option.variety}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Available: {option.estimatedYield} {option.unit} | Harvested: {option.harvestDate}
                    </Typography>
                  </Box>
                </Box>
              )}
            />

            {listingForm.selectedCrop && (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Selected:</strong> {listingForm.selectedCrop.name} - {listingForm.selectedCrop.variety}
                  <br />
                  <strong>Available quantity:</strong> {listingForm.selectedCrop.estimatedYield} {listingForm.selectedCrop.unit}
                  <br />
                  <strong>Harvest date:</strong> {listingForm.selectedCrop.harvestDate}
                </Typography>
              </Alert>
            )}

            <TextField
              label="Quantity to Sell"
              type="number"
              value={listingForm.quantity}
              onChange={(e) => handleListingInputChange('quantity', e.target.value)}
              required
              fullWidth
              inputProps={{ 
                min: 0, 
                max: listingForm.selectedCrop?.estimatedYield || 0,
                step: 0.1 
              }}
              helperText={listingForm.selectedCrop ? 
                `Maximum available: ${listingForm.selectedCrop.estimatedYield} ${listingForm.selectedCrop.unit}` : 
                'Select a crop first'
              }
              disabled={!listingForm.selectedCrop}
              error={Boolean(listingForm.selectedCrop && parseFloat(listingForm.quantity) > listingForm.selectedCrop.estimatedYield)}
            />

            <TextField
              label={`Price per ${listingForm.selectedCrop?.unit || 'unit'}`}
              type="number"
              value={listingForm.pricePerUnit}
              onChange={(e) => handleListingInputChange('pricePerUnit', e.target.value)}
              required
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
              disabled={!listingForm.selectedCrop}
            />

            {listingForm.quantity && listingForm.pricePerUnit && listingForm.selectedCrop && (
              <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, color: 'success.contrastText' }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon />
                  Total Value: ${(parseFloat(listingForm.quantity) * parseFloat(listingForm.pricePerUnit)).toLocaleString()}
                </Typography>
              </Box>
            )}

            <FormControl fullWidth disabled={!listingForm.selectedCrop}>
              <InputLabel>Quality Grade</InputLabel>
              <Select
                value={listingForm.quality}
                onChange={(e) => handleListingInputChange('quality', e.target.value)}
                label="Quality Grade"
              >
                <MenuItem value="Premium">Premium</MenuItem>
                <MenuItem value="Organic">Organic</MenuItem>
                <MenuItem value="Grade A">Grade A</MenuItem>
                <MenuItem value="Grade B">Grade B</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={listingForm.description}
              onChange={(e) => handleListingInputChange('description', e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Describe your crop quality, growing conditions, storage, etc."
              disabled={!listingForm.selectedCrop}
            />

            <TextField
              label="Custom Image URL (optional)"
              value={listingForm.image}
              onChange={(e) => handleListingInputChange('image', e.target.value)}
              fullWidth
              disabled={!listingForm.selectedCrop}
              helperText="Leave empty to use default crop image"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseListingDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitListing}
            variant="contained"
            disabled={!isListingFormValid()}
          >
            Confirm Listing
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default Marketplace;
