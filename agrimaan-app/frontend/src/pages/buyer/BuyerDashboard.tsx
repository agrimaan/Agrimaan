import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  LocalShipping as LocalShippingIcon,
  Notifications as NotificationsIcon,
  Favorite as FavoriteIcon,
  AddShoppingCart as AddShoppingCartIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface BuyerStats {
  totalOrders: number;
  activeOrders: number;
  savedItems: number;
  totalSpent: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  seller: string;
  location: string;
  quality: string;
  category: string;
}

const BuyerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<BuyerStats>({
    totalOrders: 15,
    activeOrders: 3,
    savedItems: 8,
    totalSpent: 25000,
  });

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([
    {
      id: '1',
      name: t('crops.wheat'),
      price: 2200,
      image: '/images/wheat.jpeg',
      seller: 'राम कुमार',
      location: 'हरियाणा',
      quality: 'प्रीमियम',
      category: 'अनाज',
    },
    {
      id: '2',
      name: t('crops.rice'),
      price: 2800,
      image: '/images/rice.jpeg',
      seller: 'सीता देवी',
      location: 'पंजाब',
      quality: 'सुपर',
      category: 'अनाज',
    },
    {
      id: '3',
      name: t('crops.corn'),
      price: 1800,
      image: '/images/corn.jpeg',
      seller: 'श्याम लाल',
      location: 'मध्य प्रदेश',
      quality: 'मध्यम',
      category: 'अनाज',
    },
  ]);

  const quickActions = [
    {
      title: t('roles.buyer.browseMarket'),
      icon: <StoreIcon />,
      action: () => navigate('/buyer/marketplace'),
      color: 'success',
    },
    {
      title: t('roles.buyer.viewOrders'),
      icon: <ShoppingCartIcon />,
      action: () => navigate('/buyer/orders'),
      color: 'primary',
    },
    {
      title: t('roles.buyer.trackDelivery'),
      icon: <LocalShippingIcon />,
      action: () => navigate('/buyer/deliveries'),
      color: 'warning',
    },
    {
      title: t('roles.buyer.qualityCheck'),
      icon: <TrendingUpIcon />,
      action: () => navigate('/buyer/analytics'),
      color: 'info',
    },
  ];

  const dashboardStats = [
    {
      title: t('orders.totalOrders'),
      value: stats.totalOrders,
      icon: <ShoppingCartIcon />,
      color: 'primary',
      description: t('roles.buyer.orders'),
    },
    {
      title: t('orders.activeOrders'),
      value: stats.activeOrders,
      icon: <LocalShippingIcon />,
      color: 'warning',
      description: t('roles.buyer.activeOrders'),
    },
    {
      title: t('profile.savedItems'),
      value: stats.savedItems,
      icon: <FavoriteIcon />,
      color: 'error',
      description: t('roles.buyer.savedItems'),
    },
    {
      title: t('orders.totalSpent'),
      value: `₹${stats.totalSpent}`,
      icon: <TrendingUpIcon />,
      color: 'success',
      description: t('roles.buyer.totalSpent'),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('roles.buyer.title')}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {t('roles.buyer.welcome')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('roles.buyer.description')}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${stat.color}.main`, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color={`${stat.color}.main`}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {stat.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('dashboard.quickActions')}
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Button
                variant="contained"
                fullWidth
                startIcon={action.icon}
                onClick={action.action}
                sx={{
                  bgcolor: `${action.color}.main`,
                  '&:hover': { bgcolor: `${action.color}.dark` },
                  height: 60,
                }}
              >
                {action.title}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Featured Products */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('roles.buyer.featuredProducts')}
        </Typography>
        <Grid container spacing={3}>
          {featuredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card sx={{ maxWidth: 345 }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={product.image}
                  alt={product.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="h5" color="primary">
                    ₹{product.price}/क्विंटल
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.seller')}: {product.seller}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.location')}: {product.location}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label={product.quality} size="small" color="success" />
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AddShoppingCartIcon />}
                      onClick={() => navigate(`/marketplace/product/${product.id}`)}
                    >
                      {t('marketplace.addToCart')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Navigation Cards */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/marketplace')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <StoreIcon sx={{ fontSize: 40, mb: 2, color: 'success.main' }} />
              <Typography variant="h6">{t('marketplace.title')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('roles.buyer.browseMarket')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/orders')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ShoppingCartIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
              <Typography variant="h6">{t('orders.title')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('roles.buyer.viewOrders')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/deliveries')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalShippingIcon sx={{ fontSize: 40, mb: 2, color: 'warning.main' }} />
              <Typography variant="h6">{t('deliveries.title')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('roles.buyer.trackDelivery')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <FavoriteIcon sx={{ fontSize: 40, mb: 2, color: 'error.main' }} />
              <Typography variant="h6">{t('profile.title')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('roles.buyer.savedItems')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BuyerDashboard;