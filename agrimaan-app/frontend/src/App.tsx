import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

// Layout and Common Components
import Layout from './components/layout/Layout';
import NotFound from './pages/common/NotFound';

// Authentication Components
import Login from './pages/common/Login';
import Register from './pages/common/Register';
import AlertsPage from './pages/common/AletrsPage';
import { loadUser } from './features/auth/authSlice';
import { RootState } from './store';
import Help from './pages/Help';

// Farmer Components
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerFields from './pages/farmer/Fields';
import FieldDetail from './pages/farmer/FieldDetail';
import AddField from './pages/farmer/AddField';
import EditField from './pages/farmer/EditField';
import Crops from './pages/farmer/Crops';
import CropDetail from './pages/farmer/CropDetail';
import Sensors from './pages/farmer/Sensors';
import SensorDetail from './pages/farmer/SensorDetail';
import Analytics from './pages/farmer/Analytics';
import Weather from './pages/farmer/Weather';
import Settings from './pages/common/Settings';
import Profile from './pages/common/Profile';
import Marketplace from './pages/common/Marketplace';

// Test Components
import TestPage from './pages/common/TestPage';

// Buyer Components
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyerMarketplace from './pages/buyer/BuyerMarketplace';
import BuyerCart from './pages/buyer/BuyerCart';
import BuyerSavedItems from './pages/buyer/BuyerSavedItems';
import Orders from './pages/buyer/Orders';
import OrderHistory from './pages/buyer/OrderHistory';
import Payments from './pages/buyer/Payments';
import Notifications from './pages/buyer/Notifications';

// Admin Components
import Users from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminUserEdit from './pages/admin/AdminUserEdit';
import AdminUserCreate from './pages/admin/AdminUserCreate';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFields from './pages/admin/AdminFields';
import AdminFieldDetail from './pages/admin/AdminFieldDetail';
import AdminCrops from './pages/admin/AdminCrops';
import AdminCropDetail from './pages/admin/AdminCropDetail';
import AdminSensors from './pages/admin/AdminSensors';
import AdminSensorDetail from './pages/admin/AdminSensorDetail';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminSettings from './pages/admin/AdminSettings';
import AdminBulkUploads from './pages/admin/AdminBulkUploads';
import AdminTokens from './pages/admin/AdminTokens';
import AdminVerification from './pages/admin/AdminVerification';
import AdminTerms from './pages/admin/AdminTerms';

// Logistics Components
import LogisticsDashboard from './pages/logistics/LogisticsDashboard';
import Deliveries from './pages/logistics/Deliveries';
import AvailableRequests from './pages/logistics/AvailableRequests';
import Earnings from './pages/logistics/Earnings';
import Reviews from './pages/logistics/Reviews';
import DeliveryDetail from './pages/logistics/DeliveryDetail';

// Agronomist Components
import AgronomistDashboard from './pages/agronomist/AgronomistDashboard';
import FieldAnalysis from './pages/agronomist/FieldAnalysis';
import Recommendations from './pages/agronomist/Recommendations';
import Consultations from './pages/agronomist/Consultations';
import CropIssues from './pages/agronomist/CropIssues';
import AgronomistFields from './pages/agronomist/Fields';
import AgronomistAnalytics from './pages/agronomist/AgronomistAnalytics';

// Investor Components
import InvestorDashboard from './pages/investor/InvestorDashboard';
import FarmProjects from './pages/investor/FarmProjects';
import ProjectDetail from './pages/investor/ProjectDetail';
import InvestorPortfolio from './pages/investor/InvestorPortfolio';
import InvestorReturns from './pages/investor/InvestorReturns';

// New Features
import Messages from './pages/common/Messages';
import Documents from './pages/common/Documents';
import AdminReports from './pages/admin/AdminReports';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadUser() as any);
    }
  }, [dispatch, isAuthenticated]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={`/${user?.role}`} />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={`/${user?.role}`} />} />

          {/* Protected Routes */}
          <Route path="/farmer" element={isAuthenticated && user?.role === 'farmer' ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<FarmerDashboard />} />
            <Route path="fields" element={<FarmerFields />} />
            <Route path="fields/new" element={<AddField />} />
            <Route path="fields/:id" element={<FieldDetail />} />
            <Route path="fields/:id/edit" element={<EditField />} />
            <Route path="crops" element={<Crops />} />
            <Route path="crops/:id" element={<CropDetail />} />
            <Route path="sensors" element={<Sensors />} />
            <Route path="sensors/:id" element={<SensorDetail />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="weather" element={<Weather />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="help" element={<Help />} />
          </Route>
          
          {/* Buyer Routes */}
          <Route path="/buyer" element={isAuthenticated && user?.role === 'buyer' ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<BuyerDashboard />} />
            <Route path="marketplace" element={<BuyerMarketplace />} />
            <Route path="cart" element={<BuyerCart />} />
            <Route path="saved" element={<BuyerSavedItems />} />
            <Route path="orders" element={<Orders />} />
            <Route path="history" element={<OrderHistory />} />
            <Route path="payments" element={<Payments />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
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
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="bulk-uploads" element={<AdminBulkUploads />} />
            <Route path="tokens" element={<AdminTokens />} />
            <Route path="verification" element={<AdminVerification />} />
            <Route path="terms" element={<AdminTerms />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="profile" element={<Profile />} />
            <Route path="help" element={<Help />} />
          </Route>
          
          {/* Logistics Routes */}
          <Route path="/logistics" element={isAuthenticated && user?.role === 'logistics' ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<LogisticsDashboard />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="deliveries/:id" element={<DeliveryDetail />} />
            <Route path="available-requests" element={<AvailableRequests />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
          </Route>
          
    {/* Agronomist Routes */}
    <Route path="/agronomist" element={isAuthenticated && user?.role === 'agronomist' ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<AgronomistDashboard />} />
            <Route path="fields" element={<AgronomistFields />} />
            <Route path="fields/:id" element={<FieldAnalysis />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="consultations" element={<Consultations />} />
            <Route path="crop-issues" element={<CropIssues />} />
            <Route path="analytics" element={<AgronomistAnalytics />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
          </Route>

          {/* Investor Routes */}
          <Route path="/investor" element={isAuthenticated && user?.role === 'investor' ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<InvestorDashboard />} />
            <Route path="investments" element={<InvestorDashboard />} />
            <Route path="projects" element={<FarmProjects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="portfolio" element={<InvestorPortfolio />} />
            <Route path="profile" element={<Profile />} />
            <Route path="returns" element={<InvestorReturns />} />
            <Route path="trends" element={<InvestorDashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
          </Route>
          
          {/* Messaging Routes */}
          <Route path="/messages" element={isAuthenticated ? <Messages /> : <Navigate to="/login" />} />
          
          {/* Document Management Routes */}
          <Route path="/documents" element={isAuthenticated ? <Documents /> : <Navigate to="/login" />} />
          
          {/* Reports Routes */}
          <Route path="/admin/reports" element={isAuthenticated && user?.role === 'admin' ? <AdminReports /> : <Navigate to="/login" />} />
          
          {/* Test Route - accessible to all authenticated users */}
          <Route path="/test" element={isAuthenticated ? <TestPage /> : <Navigate to="/login" />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;