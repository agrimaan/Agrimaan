import React, { useState } from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface GoogleOAuthButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
  variant = 'outlined',
  size = 'medium',
  fullWidth = false
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    try {
      // Get Google OAuth URL from backend
      const response = await fetch('/api/auth/google');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get Google OAuth URL');
      }

      // Redirect to Google OAuth
      window.location.href = data.authUrl;
      
    } catch (error) {
      console.error('Google OAuth failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      
      if (onError) {
        onError(errorMessage);
      }
      
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={handleGoogleLogin}
      startIcon={
        loading ? (
          <CircularProgress size={20} />
        ) : (
          <GoogleIcon />
        )
      }
      sx={{
        textTransform: 'none',
        borderColor: '#dadce0',
        color: '#3c4043',
        '&:hover': {
          backgroundColor: '#f8f9fa',
          borderColor: '#dadce0'
        },
        '&.MuiButton-contained': {
          backgroundColor: '#4285f4',
          color: 'white',
          '&:hover': {
            backgroundColor: '#357ae8'
          }
        }
      }}
    >
      {loading ? 'Connecting...' : 'Continue with Google'}
    </Button>
  );
};

export default GoogleOAuthButton;