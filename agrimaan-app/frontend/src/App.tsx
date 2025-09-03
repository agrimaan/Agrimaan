
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

// Layout and Common Components
import Layout from './components/layout/Layout';
import NotFound from './pages/NotFound';

// Authentication Components
import Login from './pages/Login';
import Register from './pages/Register';
import { loadUser } from './features/auth/authSlice';
import { RootState } from './store';

// Farmer Components
import Dashboard from './pages/Dashboard';
import Fields from './pages/Fields';
import FieldDetail from './pages/FieldDetail';
import AddField from './pages/AddField';
import EditField from './pages/EditField';
import Crops from './pages/Crops';
import CropDetail from './pages/CropDetail';
import Sensors from './pages/Sensors';
import SensorDetail from './pages/SensorDetail';
import Analytics from './pages/Analytics';
import Weather from './pages/Weather';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';

// Buyer Components
import BuyerDashboard from './pages/BuyerDashboard';
import Orders from './pages/Orders';

// Admin Components
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/admin/Users';
import AdminUserDetail from './pages/admin/UserDetail';
import AdminUserEdit from './pages/admin/UserEdit';
import AdminUserCreate from './pages/admin/UserCreate';
import AdminFields from './pages/admin/Fields';
import AdminFieldDetail from './pages/admin/FieldDetail';
import AdminCrops from './pages/admin/Crops';
import AdminCropDetail from './pages/admin/CropDetail';
import AdminSensors from './pages/admin/Sensors';
import AdminSensorDetail from './pages/admin/SensorDetail';
import AdminOrders from './pages/admin/Orders';
import AdminOrderDetail from './pages/admin/OrderDetail';
import AdminSettings from './pages/admin/Settings';

// Logistics Components
import LogisticsDashboard from './pages/LogisticsDashboard';
import Deliveries from './pages/logistics/Deliveries';
import AvailableRequests from './pages/logistics/AvailableRequests';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(loadUser() as any);
  }, [dispatch]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Function to determine the home route based on user role
  const getHomeRoute = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'farmer':
        return '/';
      case 'buyer':
        return '/buyer';
      case 'admin':
        return '/admin';
      case 'logistics':
        return '/logistics';
      case 'agronomist':
        return '/';
      case 'investor':
        return '/';
      default:
        return '/';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getHomeRoute()} />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={getHomeRoute()} />} />
          
          {/* Farmer Routes */}
          <Route path="/" element={isAuthenticated && user?.role === 'farmer' ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard />} />
            <Route path="fields" element={<Fields />} />
            <Route path="fields/new" element={<AddField />} />
            <Route path="fields/:id/edit" element={<EditField />} />
            <Route path="fields/:id" element={<FieldDetail />} />
            <Route path="crops" element={<Crops />} />
            <Route path="crops/:id" element={<CropDetail />} />
            <Route path="sensors" element={<Sensors />} />
            <Route path="sensors/:id" element={<SensorDetail />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="weather" element={<Weather />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="marketplace" element={<Marketplace />} />
          </Route>
          
          {/* Buyer Routes */}
          <Route path="/buyer" element={isAuthenticated && user?.role === 'buyer' ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<BuyerDashboard />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="orders" element={<Orders />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<AdminUserDetail />} />
            <Route path="users/:id/edit" element={<AdminUserEdit />} />
            <Route path="users/new" element={<AdminUserCreate />} />
            <Route path="fields" element={<AdminFields />} />
            <Route path="fields/:id" element={<AdminFieldDetail />} />
            <Route path="crops" element={<AdminCrops />} />
            <Route path="crops/:id" element={<AdminCropDetail />} />
            <Route path="sensors" element={<AdminSensors />} />
            <Route path="sensors/:id" element={<AdminSensorDetail />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Logistics Routes */}
          <Route path="/logistics" element={isAuthenticated && user?.role === 'logistics' ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<LogisticsDashboard />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="available-requests" element={<AvailableRequests />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
