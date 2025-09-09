import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Divider,
  Chip,
  Button,
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
  IconButton,
  LinearProgress,
  Tabs,
  Tab,
  TablePagination
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Reply as ReplyIcon,
  Star as StarIcon,
  Close as CloseIcon,
  LocalShipping as LocalShippingIcon,
  AccessTime as AccessTimeIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import { RootState } from '../../store';
import { format, parseISO } from 'date-fns';

// Define types
interface Review {
  id: string;
  orderId: string;
  customerName: string;
  customerType: 'Farmer' | 'Buyer';
  rating: number;
  comment: string;
  date: string;
  deliveryType: string;
  responseStatus: 'Responded' | 'Pending' | null;
  response?: string;
  responseDate?: string;
  tags: string[];
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  responseRate: number;
  positiveReviews: number;
  negativeReviews: number;
}

// Mock data
const mockReviews: Review[] = [
  {
    id: 'REV-001',
    orderId: 'ORD-1234',
    customerName: 'Farmer Singh',
    customerType: 'Farmer',
    rating: 5,
    comment: 'Excellent service! The delivery was on time and the driver was very professional. My crops were handled with care and arrived in perfect condition.',
    date: '2025-09-05',
    deliveryType: 'Crop Delivery',
    responseStatus: 'Responded',
    response: 'Thank you for your positive feedback! We strive to provide the best service for our farmers.',
    responseDate: '2025-09-06',
    tags: ['On Time', 'Professional', 'Careful Handling']
  },
  {
    id: 'REV-002',
    orderId: 'ORD-1235',
    customerName: 'Green Valley Co-op',
    customerType: 'Farmer',
    rating: 4,
    comment: 'Good service overall. The delivery was slightly delayed but the driver communicated well and kept us updated. Products arrived in good condition.',
    date: '2025-09-04',
    deliveryType: 'Warehouse Transport',
    responseStatus: 'Responded',
    response: 'Thank you for your feedback. We apologize for the slight delay and appreciate your understanding. We\'ll work on improving our timing.',
    responseDate: '2025-09-05',
    tags: ['Good Communication', 'Minor Delay']
  },
  {
    id: 'REV-003',
    orderId: 'ORD-1236',
    customerName: 'Buyer Kumar',
    customerType: 'Buyer',
    rating: 3,
    comment: 'Average service. The delivery was on time but some items were not properly secured during transport, resulting in minor damage.',
    date: '2025-09-03',
    deliveryType: 'Express Delivery',
    responseStatus: 'Pending',
    tags: ['On Time', 'Packaging Issues']
  },
  {
    id: 'REV-004',
    orderId: 'ORD-1237',
    customerName: 'Orchard Valley',
    customerType: 'Farmer',
    rating: 5,
    comment: 'Outstanding service! The cold storage transport was perfect for our sensitive produce. Driver was punctual and very helpful.',
    date: '2025-09-02',
    deliveryType: 'Cold Storage Transport',
    responseStatus: 'Responded',
    response: 'We\'re delighted to hear about your positive experience. Thank you for choosing our logistics services!',
    responseDate: '2025-09-03',
    tags: ['On Time', 'Temperature Control', 'Helpful']
  },
  {
    id: 'REV-005',
    orderId: 'ORD-1238',
    customerName: 'Asian Farms Co.',
    customerType: 'Farmer',
    rating: 2,
    comment: 'Disappointing experience. The delivery was significantly delayed without proper communication. Some of our produce was damaged due to improper handling.',
    date: '2025-09-01',
    deliveryType: 'Bulk Transport',
    responseStatus: 'Responded',
    response: 'We sincerely apologize for the issues with your delivery. We\'ve addressed these concerns with our team and are implementing better training and communication protocols. Please contact our customer service for compensation.',
    responseDate: '2025-09-02',
    tags: ['Delayed', 'Poor Communication', 'Damaged Goods']
  },
  {
    id: 'REV-006',
    orderId: 'ORD-1239',
    customerName: 'Midwest Farms',
    customerType: 'Farmer',
    rating: 4,
    comment: 'Very good service. Driver arrived on time and was helpful with loading. Would use again.',
    date: '2025-08-31',
    deliveryType: 'Standard Delivery',
    responseStatus: 'Responded',
    response: 'Thank you for your positive review! We look forward to serving you again.',
    responseDate: '2025-09-01',
    tags: ['On Time', 'Helpful']
  },
  {
    id: 'REV-007',
    orderId: 'ORD-1240',
    customerName: 'John Smith Farm',
    customerType: 'Farmer',
    rating: 5,
    comment: 'Fantastic service! The express delivery was even faster than expected. Driver was courteous and professional.',
    date: '2025-08-30',
    deliveryType: 'Express Delivery',
    responseStatus: null,
    tags: ['Fast Delivery', 'Professional']
  },
  {
    id: 'REV-008',
    orderId: 'ORD-1241',
    customerName: 'Fresh Produce Inc.',
    customerType: 'Buyer',
    rating: 1,
    comment: 'Terrible experience. Delivery was a full day late with no updates. Some products were spoiled due to the delay.',
    date: '2025-08-29',
    deliveryType: 'Cold Storage Transport',
    responseStatus: 'Responded',
    response: 'We deeply apologize for this unacceptable experience. We\'ve initiated an investigation into what went wrong and will be contacting you directly to discuss compensation for the spoiled products.',
    responseDate: '2025-08-30',
    tags: ['Very Delayed', 'Spoiled Products', 'No Communication']
  }
];

const mockReviewStats: ReviewStats = {
  averageRating: 3.6,
  totalReviews: 8,
  ratingDistribution: {
    5: 3,
    4: 2,
    3: 1,
    2: 1,
    1: 1
  },
  responseRate: 75,
  positiveReviews: 62.5,
  negativeReviews: 25
};

const Reviews: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [reviewStats, setReviewStats] = useState<ReviewStats>(mockReviewStats);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterCustomerType, setFilterCustomerType] = useState('All');
  const [filterResponseStatus, setFilterResponseStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  // Open response dialog
  const handleOpenResponseDialog = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.response || '');
    setResponseDialogOpen(true);
  };

  // Close response dialog
  const handleCloseResponseDialog = () => {
    setResponseDialogOpen(false);
    setSelectedReview(null);
    setResponseText('');
  };

  // Submit response
  const handleSubmitResponse = () => {
    if (selectedReview && responseText.trim()) {
      const updatedReviews = reviews.map(review => 
        review.id === selectedReview.id 
          ? {
              ...review,
              responseStatus: 'Responded' as const,
              response: responseText,
              responseDate: format(new Date(), 'yyyy-MM-dd')
            }
          : review
      );
      setReviews(updatedReviews);
      handleCloseResponseDialog();
      
      // Update response rate in stats
      const respondedReviews = updatedReviews.filter(r => r.responseStatus === 'Responded').length;
      setReviewStats(prev => ({
        ...prev,
        responseRate: (respondedReviews / updatedReviews.length) * 100
      }));
    }
  };

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter(review => {
      // Filter by tab
      if (tabValue === 1 && review.responseStatus !== 'Pending') return false;
      if (tabValue === 2 && review.responseStatus !== 'Responded') return false;
      
      // Filter by rating
      if (filterRating !== null && review.rating !== filterRating) return false;
      
      // Filter by customer type
      if (filterCustomerType !== 'All' && review.customerType !== filterCustomerType) return false;
      
      // Filter by response status
      if (filterResponseStatus !== 'All') {
        if (filterResponseStatus === 'Responded' && review.responseStatus !== 'Responded') return false;
        if (filterResponseStatus === 'Pending' && review.responseStatus !== 'Pending') return false;
        if (filterResponseStatus === 'No Response' && review.responseStatus !== null) return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          review.customerName.toLowerCase().includes(searchLower) ||
          review.orderId.toLowerCase().includes(searchLower) ||
          review.comment.toLowerCase().includes(searchLower) ||
          review.deliveryType.toLowerCase().includes(searchLower) ||
          review.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'rating') {
        return sortOrder === 'asc'
          ? a.rating - b.rating
          : b.rating - a.rating;
      } else if (sortBy === 'customerName') {
        return sortOrder === 'asc'
          ? a.customerName.localeCompare(b.customerName)
          : b.customerName.localeCompare(a.customerName);
      }
      return 0;
    });

  // Get customer type color
  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'Farmer':
        return 'primary';
      case 'Buyer':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get response status color
  const getResponseStatusColor = (status: string | null) => {
    switch (status) {
      case 'Responded':
        return 'success';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'info';
    if (rating >= 2) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Customer Reviews
        </Typography>
      </Box>

      {/* Review Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Overall Rating</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h4" color="primary" sx={{ mr: 1 }}>
                    {reviewStats.averageRating.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    / 5
                  </Typography>
                </Box>
              </Box>
              <Rating 
                value={reviewStats.averageRating} 
                precision={0.1} 
                readOnly 
                size="large"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Based on {reviewStats.totalReviews} reviews
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Rating Distribution */}
              <Typography variant="subtitle2" gutterBottom>
                Rating Distribution
              </Typography>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ minWidth: 40 }}>
                    <Typography variant="body2">{rating} ★</Typography>
                  </Box>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution] / reviewStats.totalReviews) * 100}
                      sx={{ 
                        height: 8, 
                        borderRadius: 5,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getRatingColor(rating)
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">
                      {reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution]}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <ThumbUpIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5">{reviewStats.positiveReviews}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Positive Reviews
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <ThumbDownIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5">{reviewStats.negativeReviews}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Negative Reviews
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <ReplyIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5">{reviewStats.responseRate}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Response Rate
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Common Tags in Reviews
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                <Chip label="On Time" color="success" size="small" />
                <Chip label="Professional" color="success" size="small" />
                <Chip label="Helpful" color="success" size="small" />
                <Chip label="Good Communication" color="success" size="small" />
                <Chip label="Delayed" color="error" size="small" />
                <Chip label="Poor Communication" color="error" size="small" />
                <Chip label="Damaged Goods" color="error" size="small" />
                <Chip label="Temperature Control" color="primary" size="small" />
                <Chip label="Careful Handling" color="primary" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Paper sx={{ mb: 4 }}>
        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={`All Reviews (${reviews.length})`} />
          <Tab label={`Pending Response (${reviews.filter(r => r.responseStatus === 'Pending').length})`} />
          <Tab label={`Responded (${reviews.filter(r => r.responseStatus === 'Responded').length})`} />
        </Tabs>
        
        {/* Filters */}
        <Box p={3}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search reviews..."
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
                <InputLabel>Rating</InputLabel>
                <Select
                  value={filterRating === null ? 'All' : filterRating}
                  onChange={(e) => setFilterRating(e.target.value === 'All' ? null : Number(e.target.value))}
                  label="Rating"
                >
                  <MenuItem value="All">All Ratings</MenuItem>
                  <MenuItem value={5}>5 Stars</MenuItem>
                  <MenuItem value={4}>4 Stars</MenuItem>
                  <MenuItem value={3}>3 Stars</MenuItem>
                  <MenuItem value={2}>2 Stars</MenuItem>
                  <MenuItem value={1}>1 Star</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  value={filterCustomerType}
                  onChange={(e) => setFilterCustomerType(e.target.value)}
                  label="Customer Type"
                >
                  <MenuItem value="All">All Types</MenuItem>
                  <MenuItem value="Farmer">Farmer</MenuItem>
                  <MenuItem value="Buyer">Buyer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Response Status</InputLabel>
                <Select
                  value={filterResponseStatus}
                  onChange={(e) => setFilterResponseStatus(e.target.value)}
                  label="Response Status"
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Responded">Responded</MenuItem>
                  <MenuItem value="Pending">Pending Response</MenuItem>
                  <MenuItem value="No Response">No Response</MenuItem>
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
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                  <MenuItem value="customerName">Customer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {/* Reviews List */}
          {filteredAndSortedReviews.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No reviews found matching your criteria.
              </Typography>
            </Box>
          ) : (
            filteredAndSortedReviews
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((review) => (
                <Paper key={review.id} elevation={2} sx={{ mb: 3, p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: review.rating >= 4 ? 'success.main' : review.rating >= 3 ? 'primary.main' : 'error.main', mr: 2 }}>
                            {review.customerName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6">{review.customerName}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={review.customerType} 
                                color={getCustomerTypeColor(review.customerType) as any}
                                size="small"
                              />
                              <Typography variant="body2" color="text.secondary">
                                {review.orderId}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Rating value={review.rating} readOnly />
                            <Typography variant="h6" sx={{ ml: 1 }} color={getRatingColor(review.rating)}>
                              {review.rating}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {review.date}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocalShippingIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {review.deliveryType}
                        </Typography>
                      </Box>
                      <Typography variant="body1" paragraph>
                        {review.comment}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {review.tags.map((tag, index) => (
                          <Chip 
                            key={index} 
                            label={tag} 
                            size="small" 
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Grid>
                    
                    {/* Response Section */}
                    {review.responseStatus === 'Responded' && review.response && (
                      <Grid item xs={12}>
                        <Box sx={{ pl: 2, borderLeft: '3px solid #1976d2', mt: 1 }}>
                          <Typography variant="subtitle2" color="primary">
                            Your Response - {review.responseDate}
                          </Typography>
                          <Typography variant="body2">
                            {review.response}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label={review.responseStatus || 'No Response'} 
                            color={getResponseStatusColor(review.responseStatus) as any}
                            size="small"
                          />
                        </Box>
                        <Button
                          variant="outlined"
                          startIcon={<ReplyIcon />}
                          onClick={() => handleOpenResponseDialog(review)}
                          disabled={review.responseStatus === 'Responded'}
                        >
                          {review.responseStatus === 'Responded' ? 'View Response' : 'Respond'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              ))
          )}
          
          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredAndSortedReviews.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Paper>
      
      {/* Response Dialog */}
      <Dialog
        open={responseDialogOpen}
        onClose={handleCloseResponseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {selectedReview?.responseStatus === 'Responded' ? 'View Response' : 'Respond to Review'}
            <IconButton onClick={handleCloseResponseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Review from {selectedReview.customerName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={selectedReview.rating} readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {selectedReview.date}
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  {selectedReview.comment}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <TextField
                label="Your Response"
                multiline
                rows={4}
                fullWidth
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                disabled={selectedReview.responseStatus === 'Responded'}
                placeholder="Write your response to the customer's review..."
              />
              
              {selectedReview.responseStatus === 'Responded' && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Response submitted on {selectedReview.responseDate}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResponseDialog}>
            {selectedReview?.responseStatus === 'Responded' ? 'Close' : 'Cancel'}
          </Button>
          {selectedReview?.responseStatus !== 'Responded' && (
            <Button 
              onClick={handleSubmitResponse} 
              variant="contained" 
              disabled={!responseText.trim()}
            >
              Submit Response
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reviews;