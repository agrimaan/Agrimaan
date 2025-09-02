import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Grid, Paper, Typography, Divider, Button, Chip } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import StarIcon from '@mui/icons-material/Star';
import StatCard from '../components/StatCard';
import { RootState } from '../store';
import type { LogisticsState, Shipment, Job } from '../features/logistics/logisticsSlice';

export default function LogisticsDashboard() {
  // Typed selector now that 'logistics' exists in RootState
  const logistics: LogisticsState = useSelector((s: RootState) => s.logistics);

  const stats = logistics?.stats ?? { active: 8, completed: 124, earnings: '₹32,450', rating: 4.8 };
  const shipments: Shipment[] = logistics?.shipments ?? [];
  const jobs: Job[] = logistics?.jobs ?? [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Welcome, Amit!</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<i className="fas fa-bell" /> as any}>Notifications</Button>
          <Button variant="contained" startIcon={<i className="fas fa-search" /> as any}>Find Jobs</Button>
        </Box>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Shipments" value={stats.active} Icon={<LocalShippingIcon color="primary" sx={{ fontSize: 40 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Completed Deliveries" value={stats.completed} Icon={<CheckCircleIcon color="success" sx={{ fontSize: 40 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="This Month's Earnings" value={stats.earnings} Icon={<CurrencyRupeeIcon color="warning" sx={{ fontSize: 40 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Average Rating" value={stats.rating} Icon={<StarIcon color="primary" sx={{ fontSize: 40 }} />} />
        </Grid>
      </Grid>

      {/* Today's Shipments */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Today's Shipments</Typography>
          <Button size="small" variant="outlined">View All</Button>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
          <Box component="thead" sx={{ bgcolor: 'primary.50' }}>
            <Box component="tr">
              {['Shipment ID', 'Pickup', 'Delivery', 'Cargo', 'Distance', 'Status', 'Actions'].map((h) => (
                <Box key={h} component="th" sx={{ textAlign: 'left', p: 1.5 }}>{h}</Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {shipments.map((s: Shipment) => (
              <Box key={s.id} component="tr" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box component="td" sx={{ p: 1.5 }}>{s.id}</Box>
                <Box component="td" sx={{ p: 1.5 }}>{s.pickup}</Box>
                <Box component="td" sx={{ p: 1.5 }}>{s.drop}</Box>
                <Box component="td" sx={{ p: 1.5 }}>{s.cargo}</Box>
                <Box component="td" sx={{ p: 1.5 }}>{s.distance}</Box>
                <Box component="td" sx={{ p: 1.5 }}>
                  <Chip
                    size="small"
                    label={s.status}
                    color={
                      /delivered/i.test(s.status) ? 'success'
                        : /in\s*transit/i.test(s.status) ? 'info'
                        : /scheduled/i.test(s.status) ? 'secondary'
                        : 'warning'
                    }
                  />
                </Box>
                <Box component="td" sx={{ p: 1.5 }}>
                  {/delivered/i.test(s.status)
                    ? <Button size="small" variant="outlined">Details</Button>
                    : <Button size="small" variant="contained">{/in\s*transit/i.test(s.status) ? 'Update' : 'Start'}</Button>}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Route Map */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Route Map</Typography>
          <Button size="small" variant="outlined">Today's Routes</Button>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ position: 'relative', height: 360, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
          <Box component="img" alt="Route Map" src="https://i.imgur.com/JfkXjYQ.jpg" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <Box sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'background.paper', p: 1.5, borderRadius: 1, boxShadow: 1 }}>
            <Typography variant="body2">3 Active Routes</Typography>
            <Typography variant="body2">385 km Total Distance</Typography>
            <Typography variant="body2">Est. 7.5 Hours Driving</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Available Jobs */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Available Jobs</Typography>
          <Button size="small" variant="outlined">View All</Button>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          {jobs.map((j: Job) => (
            <Grid item xs={12} md={6} key={j.title}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">{j.title}</Typography>
                  <Typography variant="subtitle1" color="primary">{j.price}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">Pickup: {j.pickup}</Typography>
                <Typography variant="body2" color="text.secondary">Delivery: {j.delivery}</Typography>
                <Typography variant="body2" color="text.secondary">Cargo: {j.weight}</Typography>
                <Typography variant="body2" color="text.secondary">Distance: {j.distance}</Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined">Details</Button>
                  <Button size="small" variant="contained">Accept</Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
