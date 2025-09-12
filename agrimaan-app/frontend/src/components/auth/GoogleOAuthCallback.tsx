import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Alert,
  Paper,
  Container
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const GoogleOAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setError('Google authentication was cancelled or failed');
        setProcessing(false);
        return;
      }

      if (!code) {
        setError('No authorization code received from Google');
        setProcessing(false);
        return;
      }

      try {
        // Send the authorization code to backend
        const response = await fetch('/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code,
            role: 'farmer', // Default role, can be customized
            communicationPreferences: {
              email: {
                marketing: false,
                notifications: true,
                updates: true
              },
              sms: {
                marketing: false,
                notifications: true,
                updates: true
              }
            }
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Authentication failed');
        }

        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Update auth context
        if (login) {
          login(data.token, data.user);
        }

        // Redirect based on user role and verification status
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.user.verificationStatus === 'verified') {
          navigate('/dashboard');
        } else {
          navigate('/verification-pending');
        }

      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
      } finally {
        setProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  if (processing) {
    return (
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2
            }}
          >
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Completing Google Authentication
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your account...
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2
            }}
          >
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Authentication Failed
              </Typography>
              <Typography variant="body2">
                {error}
              </Typography>
            </Alert>
            <Typography variant="body2" color="text.secondary">
              You can try logging in again or contact support if the problem persists.
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return null;
};

export default GoogleOAuthCallback;