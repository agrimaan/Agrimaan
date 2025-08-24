import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CardActions,
  Button,
  Chip,
  IconButton,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Badge,
  Rating,
  Skeleton,
  Pagination,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ShoppingCart as ShoppingCartIcon,
  Close as CloseIcon,
  LocationOn as LocationOnIcon,
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  LocalShipping as LocalShippingIcon,
  VerifiedUser as VerifiedUserIcon,
  Share as ShareIcon
} from '@mui/icons-material';

// Mock data for marketplace items
const mockCategories = [
  'Seeds & Plants',
  'Equipment',
  'Fertilizers',
  'Pesticides',
  'Tools',
  'Irrigation',
  'Livestock',
  'Farmland',
  'Services'
];

const mockProducts = Array(24).fill(null).map((_, index) => ({
  id: `product-${index + 1}`,
  title: [
    'Organic Wheat Seeds',
    'Tractor Rental Service',
    'Premium Fertilizer Mix',
    'Pest Control Solution',
    'Irrigation System',
    'Harvesting Equipment',
    'Soil Testing Kit',
    'Farm Management Software',
    'Greenhouse Structure',
    'Livestock Feed',
    'Farming Tools Set',
    'Weather Station'
  ][index % 12],
  price: Math.floor(Math.random() * 900) + 100,
  rating: (Math.random() * 2 + 3).toFixed(1),
  reviews: Math.floor(Math.random() * 100) + 5,
  seller: [
    'AgriSupply Co.',
    'FarmTech Solutions',
    'Green Thumb Nursery',
    'Harvest Helpers',
    'Rural Equipment Inc.',
    'Soil Masters'
  ][index % 6],
  location: [
    'Palo Alto, CA',
    'Sacramento, CA',
    'Fresno, CA',
    'Bakersfield, CA',
    'San Jose, CA',
    'Modesto, CA'
  ][index % 6],
  image: `https://source.unsplash.com/featured/?agriculture,farm,${index}`,
  category: mockCategories[index % mockCategories.length],
  inStock: Math.random() > 0.2,
  isFavorite: Math.random() > 0.7,
  isVerified: Math.random() > 0.3,
  freeShipping: Math.random() > 0.5,
  discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 5 : 0
}));

const Marketplace: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortOption, setSortOption] = useState('relevance');
  const [activeCategory, setActiveCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, boolean>>({
    inStock: false,
    freeShipping: false,
    verifiedSeller: false,
    hasDiscount: false
  });
  const [products, setProducts] = useState(mockProducts);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<string[]>([]);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle filter drawer toggle
  const handleFilterDrawerToggle = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };
  
  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortOption(event.target.value as string);
  };
  
  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };
  
  // Handle price range change
  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };
  
  // Handle rating filter change
  const handleRatingChange = (value: number | null) => {
    setRatingFilter(value);
  };
  
  // Handle filter checkbox change
  const handleFilterChange = (filter: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };
  
  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = (productId: string) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = (productId: string) => {
    if (!cartItems.includes(productId)) {
      setCartItems([...cartItems, productId]);
    }
  };
  
  // Apply filters and sorting
  const filteredProducts = products.filter(product => {
    // Search query filter
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !product.seller.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.category.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (activeCategory !== 'all' && product.category !== activeCategory) {
      return false;
    }
    
    // Price range filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    
    // Rating filter
    if (ratingFilter !== null && parseFloat(product.rating) < ratingFilter) {
      return false;
    }
    
    // Other filters
    if (selectedFilters.inStock && !product.inStock) return false;
    if (selectedFilters.freeShipping && !product.freeShipping) return false;
    if (selectedFilters.verifiedSeller && !product.isVerified) return false;
    if (selectedFilters.hasDiscount && product.discount === 0) return false;
    
    return true;
  });
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'rating':
        return parseFloat(b.rating) - parseFloat(a.rating);
      case 'newest':
        return b.id.localeCompare(a.id);
      default: // relevance
        return 0;
    }
  });
  
  // Pagination
  const productsPerPage = isMobile ? 6 : isTablet ? 8 : 12;
  const pageCount = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );
  
  // Render product card
  const renderProductCard = (product: typeof mockProducts[0]) => {
    const isFavorite = favorites.includes(product.id);
    const isInCart = cartItems.includes(product.id);
    
    return (
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          }
        }}
      >
        <CardActionArea>
          {loading ? (
            <Skeleton variant="rectangular" height={140} animation="wave" />
          ) : (
            <CardMedia
              component="img"
              height={140}
              image={product.image}
              alt={product.title}
              sx={{ objectFit: 'cover' }}
            />
          )}
          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
            {loading ? (
              <>
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="60%" height={20} />
              </>
            ) : (
              <>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                  {product.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating 
                    value={parseFloat(product.rating)} 
                    precision={0.5} 
                    size="small" 
                    readOnly 
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({product.reviews})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {product.location}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    Sold by: {product.seller}
                    {product.isVerified && (
                      <Tooltip title="Verified Seller">
                        <VerifiedUserIcon 
                          fontSize="small" 
                          color="primary" 
                          sx={{ ml: 0.5, width: 16, height: 16 }} 
                        />
                      </Tooltip>
                    )}
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </CardActionArea>
        <Divider />
        <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
          {loading ? (
            <>
              <Skeleton variant="text" width={80} height={32} />
              <Box>
                <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1, display: 'inline-block' }} />
                <Skeleton variant="circular" width={32} height={32} sx={{ display: 'inline-block' }} />
              </Box>
            </>
          ) : (
            <>
              <Box>
                {product.discount > 0 && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ textDecoration: 'line-through' }}
                  >
                    ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                  </Typography>
                )}
                <Typography variant="h6" color="primary" component="div">
                  ${product.price.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <IconButton 
                  size="small" 
                  color={isFavorite ? "error" : "default"}
                  onClick={() => handleFavoriteToggle(product.id)}
                >
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <IconButton 
                  size="small" 
                  color={isInCart ? "primary" : "default"}
                  onClick={() => handleAddToCart(product.id)}
                >
                  <ShoppingCartIcon />
                </IconButton>
              </Box>
            </>
          )}
        </CardActions>
        {!loading && (
          <>
            {product.discount > 0 && (
              <Chip 
                label={`${product.discount}% OFF`} 
                color="error" 
                size="small" 
                sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  left: 10,
                  fontWeight: 'bold'
                }} 
              />
            )}
            {product.freeShipping && (
              <Chip 
                icon={<LocalShippingIcon />} 
                label="Free Shipping" 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }} 
              />
            )}
            {!product.inStock && (
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'white', 
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    px: 2,
                    py: 1,
                    borderRadius: 1
                  }}
                >
                  Out of Stock
                </Typography>
              </Box>
            )}
          </>
        )}
      </Card>
    );
  };
  
  // Render filter drawer content
  const renderFilterDrawerContent = () => (
    <Box sx={{ width: isMobile ? '100%' : 300, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={handleFilterDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      {/* Price Range Filter */}
      <Typography variant="subtitle1" gutterBottom>Price Range</Typography>
      <Box sx={{ px: 1, mb: 3 }}>
        <Slider
          value={priceRange}
          onChange={handlePriceRangeChange}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          step={10}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            ${priceRange[0]}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ${priceRange[1]}
          </Typography>
        </Box>
      </Box>
      
      {/* Rating Filter */}
      <Typography variant="subtitle1" gutterBottom>Minimum Rating</Typography>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        {[5, 4, 3, 2, 1].map((rating) => (
          <Button
            key={rating}
            variant={ratingFilter === rating ? "contained" : "outlined"}
            size="small"
            onClick={() => handleRatingChange(ratingFilter === rating ? null : rating)}
            sx={{ minWidth: 36, mr: 1 }}
          >
            {rating}+
          </Button>
        ))}
      </Box>
      
      {/* Other Filters */}
      <Typography variant="subtitle1" gutterBottom>Other Filters</Typography>
      <List dense>
        <ListItem disablePadding>
          <FormControlLabel
            control={
              <Checkbox 
                checked={selectedFilters.inStock} 
                onChange={() => handleFilterChange('inStock')} 
              />
            }
            label="In Stock Only"
          />
        </ListItem>
        <ListItem disablePadding>
          <FormControlLabel
            control={
              <Checkbox 
                checked={selectedFilters.freeShipping} 
                onChange={() => handleFilterChange('freeShipping')} 
              />
            }
            label="Free Shipping"
          />
        </ListItem>
        <ListItem disablePadding>
          <FormControlLabel
            control={
              <Checkbox 
                checked={selectedFilters.verifiedSeller} 
                onChange={() => handleFilterChange('verifiedSeller')} 
              />
            }
            label="Verified Sellers Only"
          />
        </ListItem>
        <ListItem disablePadding>
          <FormControlLabel
            control={
              <Checkbox 
                checked={selectedFilters.hasDiscount} 
                onChange={() => handleFilterChange('hasDiscount')} 
              />
            }
            label="Discounted Items"
          />
        </ListItem>
      </List>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          onClick={() => {
            setPriceRange([0, 1000]);
            setRatingFilter(null);
            setSelectedFilters({
              inStock: false,
              freeShipping: false,
              verifiedSeller: false,
              hasDiscount: false
            });
          }}
        >
          Reset All
        </Button>
        <Button 
          variant="contained" 
          onClick={handleFilterDrawerToggle}
        >
          Apply Filters
        </Button>
      </Box>
    </Box>
  );
  
  return (
    <Box>
      {/* Marketplace Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom>
          Marketplace
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Buy and sell agricultural products, equipment, and services
        </Typography>
      </Box>
      
      {/* Search and Filter Bar */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search products, sellers, or categories..."
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
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
            <FormControl fullWidth variant="outlined">
              <InputLabel id="sort-select-label">Sort By</InputLabel>
              <Select
                labelId="sort-select-label"
                id="sort-select"
                value={sortOption}
                onChange={handleSortChange as any}
                label="Sort By"
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="price_low">Price: Low to High</MenuItem>
                <MenuItem value="price_high">Price: High to Low</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleFilterDrawerToggle}
              sx={{ height: '56px' }}
            >
              Filters {Object.values(selectedFilters).some(Boolean) || ratingFilter || priceRange[0] > 0 || priceRange[1] < 1000 ? 
                `(${[
                  Object.values(selectedFilters).filter(Boolean).length,
                  ratingFilter ? 1 : 0,
                  (priceRange[0] > 0 || priceRange[1] < 1000) ? 1 : 0
                ].reduce((a, b) => a + b, 0)})` : ''}
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* Category Tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeCategory === 'all' ? 0 : mockCategories.indexOf(activeCategory) + 1}
          onChange={(_, newValue) => handleCategoryChange(newValue === 0 ? 'all' : mockCategories[newValue - 1])}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="All Categories" />
          {mockCategories.map((category, index) => (
            <Tab key={index} label={category} />
          ))}
        </Tabs>
      </Box>
      
      {/* Results Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          {loading ? (
            <Skeleton width={150} />
          ) : (
            `${filteredProducts.length} products found`
          )}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge badgeContent={cartItems.length} color="primary" sx={{ mr: 2 }}>
            <ShoppingCartIcon />
          </Badge>
          <Badge badgeContent={favorites.length} color="error">
            <FavoriteIcon />
          </Badge>
        </Box>
      </Box>
      
      {/* Product Grid */}
      <Grid container spacing={3}>
        {loading ? (
          // Loading skeletons
          Array(productsPerPage).fill(null).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
              {renderProductCard({
                id: `skeleton-${index}`,
                title: '',
                price: 0,
                rating: '0',
                reviews: 0,
                seller: '',
                location: '',
                image: '',
                category: '',
                inStock: true,
                isFavorite: false,
                isVerified: false,
                freeShipping: false,
                discount: 0
              })}
            </Grid>
          ))
        ) : filteredProducts.length === 0 ? (
          // No results
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
              <Button 
                variant="contained" 
                sx={{ mt: 2 }}
                onClick={() => {
                  setSearchQuery('');
                  setPriceRange([0, 1000]);
                  setRatingFilter(null);
                  setSelectedFilters({
                    inStock: false,
                    freeShipping: false,
                    verifiedSeller: false,
                    hasDiscount: false
                  });
                  setActiveCategory('all');
                }}
              >
                Clear All Filters
              </Button>
            </Box>
          </Grid>
        ) : (
          // Product cards
          paginatedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              {renderProductCard(product)}
            </Grid>
          ))
        )}
      </Grid>
      
      {/* Pagination */}
      {!loading && filteredProducts.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={pageCount} 
            page={currentPage} 
            onChange={handlePageChange} 
            color="primary"
            size={isMobile ? "small" : "medium"}
          />
        </Box>
      )}
      
      {/* Filter Drawer */}
      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={filterDrawerOpen}
        onClose={handleFilterDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': isMobile ? {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '90%'
          } : {}
        }}
      >
        {renderFilterDrawerContent()}
      </Drawer>
    </Box>
  );
};

export default Marketplace;