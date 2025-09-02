import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

import Layout from './components/layout/Layout';
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
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import { loadUser } from './features/auth/authSlice';
import { RootState } from './store';
import Marketplace from './pages/Marketplace';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashborad';
//import FarmerDashboard from './pages/Dashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import LogisticsDashboard from './pages/LogisticsDashboard';


const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
          <Route path="/logistics-dashboard" element={<LogisticsDashboard />} />
          
          <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
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
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
            <Route path="/dashboard/logistics" element={<LogisticsDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />  

            
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;