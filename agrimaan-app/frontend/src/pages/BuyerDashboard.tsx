import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, Divider, Button, TextField, MenuItem,
  Card, CardContent, Avatar, Chip
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import StarIcon from '@mui/icons-material/Star';
import StatCard from '../components/StatCard';
import { RootState } from '../store';

type Produce = {
  id: string;
  name: string;
  tag?: string;
  price: string;
  qty: string;
  loc: string;
  harvest: string;
  farmer: { name: string; rating: number; avatar?: string };
};

type Order = {
  id: string;
  produce: string;
  supplier: string;
  qty: string;
  total: string;
  status: string;
};

type BuyerState = {
  stats?: { activeOrders: number; suppliers: number; inTransit: number; monthlySpend: string };
  listings?: Produce[];
  orders?: Order[];
};

export default function BuyerDashboard() {
  // Cast to any so this file works even if RootState doesn't have `buyer` yet
  const buyer = useSelector((s: RootState) => (s as any).buyer as BuyerState | undefined);

  const stats = buyer?.stats ?? { activeOrders: 12, suppliers: 28, inTransit: 5, monthlySpend: '₹3.2L' };
  const listings: Produce[] = buyer?.listings ?? [
    { id: 'wheat1', name: 'Premium Wheat (HD-2967)', tag: 'Organic', price: '₹2,250/quintal', qty: '50 quintals', loc: 'Karnal, Haryana', harvest: 'Recent', farmer: { name: 'Rajesh Kumar', rating: 4.8 } },
    { id: 'rice1', name: 'Basmati Rice (PB-1121)', tag: 'Premium', price: '₹3,800/quintal', qty: '30 quintals', loc: 'Amritsar, Punjab', harvest: '1 week ago', farmer: { name: 'Gurpreet Singh', rating: 4.9 } },
    { id: 'potato1', name: 'Fresh Potatoes (Kufri Jyoti)', price: '₹1,200/quintal', qty: '100 quintals', loc: 'Agra, UP', harvest: '3 days ago', farmer: { name: 'Sunita Verma', rating: 4.7 } },
  ];
  const orders: Order[] = buyer?.orders ?? [
    { id: '#ORD-2024-156', produce: 'Basmati Rice', supplier: 'Gurpreet Singh', qty: '20 quintals', total: '₹76,000', status: 'Pending' },
    { id: '#ORD-2024-155', produce: 'Wheat', supplier: 'Rajesh Kumar', qty: '10 quintals', total: '₹22,500', status: 'Confirmed' },
  ];

  const filters = useMemo(
    () => [
      { label: 'All Categories', value: 'all' },
      { label: 'Grains', value: 'grains' },
      { label: 'Vegetables', value: 'vegetables' },
      { label: 'Fruits', value: 'fruits' },
      { label: 'Pulses', value: 'pulses' },
      { label: 'Oilseeds', value: 'oilseeds' },
    ],
    []
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Welcome, Priya!</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<i className="fas fa-bell" /> as any}>Notifications</Button>
          <Button variant="contained" startIcon={<i className="fas fa-plus" /> as any}>New Order</Button>
        </Box>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Orders" value={stats.activeOrders} Icon={<ShoppingCartIcon color="primary" sx={{ fontSize: 40 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Verified Suppliers" value={stats.suppliers} Icon={<GroupsIcon color="success" sx={{ fontSize: 40 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Shipments in Transit" value={stats.inTransit} Icon={<LocalShippingIcon color="warning" sx={{ fontSize: 40 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Monthly Procurement" value={stats.monthlySpend} Icon={<ShowChartIcon color="primary" sx={{ fontSize: 40 }} />} />
        </Grid>
      </Grid>

      {/* Source Produce */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Source Produce</Typography>
          <Button size="small" variant="outlined">View All</Button>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <TextField fullWidth placeholder="Search for crops, varieties, or locations..." />
          <TextField select label="Category" sx={{ minWidth: 200 }}>
            {filters.map((f) => (
              <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Sort By" sx={{ minWidth: 220 }}>
            {['Relevance', 'Price: Low to High', 'Price: High to Low', 'Distance: Nearest', 'Rating: Highest'].map((o) => (
              <MenuItem key={o} value={o}>{o}</MenuItem>
            ))}
          </TextField>
        </Box>

        <Grid container spacing={2}>
          {listings.map((p: Produce) => (
            <Grid item xs={12} md={4} key={p.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">{p.name}</Typography>
                    {p.tag && <Chip label={p.tag} size="small" color="success" />}
                  </Box>
                  <Typography variant="body2" color="text.secondary">Price: {p.price}</Typography>
                  <Typography variant="body2" color="text.secondary">Quantity: {p.qty}</Typography>
                  <Typography variant="body2" color="text.secondary">Location: {p.loc}</Typography>
                  <Typography variant="body2" color="text.secondary">Harvest: {p.harvest}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                    <Avatar sx={{ width: 28, height: 28 }}>{p.farmer.name[0]}</Avatar>
                    <Typography variant="body2">{p.farmer.name}</Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 'auto', color: 'warning.main' }}>
                      <StarIcon fontSize="small" sx={{ mr: 0.5 }} /> {p.farmer.rating}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button size="small" variant="outlined">View Details</Button>
                    <Button size="small" variant="contained">Contact Farmer</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Recent Orders */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Recent Orders</Typography>
          <Button size="small" variant="outlined">View All Orders</Button>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
          <Box component="thead" sx={{ bgcolor: 'primary.50' }}>
            <Box component="tr">
              {['Order ID', 'Produce', 'Supplier', 'Quantity', 'Total', 'Status', 'Actions'].map((h) => (
                <Box key={h} component="th" sx={{ textAlign: 'left', p: 1.5 }}>{h}</Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {orders.map((o: Order) => (
              <Box key={o.id} component="tr" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box component="td" sx={{ p: 1.5 }}>{o.id}</Box>
                <Box component="td" sx={{ p: 1.5 }}>{o.produce}</Box>
                <Box component="td" sx={{ p: 1.5 }}>{o.supplier}</Box>
                <Box component="td" sx={{ p: 1.5 }}>{o.qty}</Box>
                <Box component="td" sx={{ p: 1.5 }}>{o.total}</Box>
                <Box component="td" sx={{ p: 1.5 }}>
                  <Chip
                    size="small"
                    label={o.status}
                    color={
                      /delivered|confirmed/i.test(o.status)
                        ? 'success'
                        : /shipped|transit/i.test(o.status)
                        ? 'info'
                        : 'warning'
                    }
                  />
                </Box>
                <Box component="td" sx={{ p: 1.5 }}>
                  <Button size="small" variant="outlined">Details</Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

