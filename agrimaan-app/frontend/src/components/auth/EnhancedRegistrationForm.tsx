import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Paper,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import GoogleOAuthButton from './GoogleOAuthButton';

interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  phone: {
    number: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  termsAccepted: boolean;
  communicationPreferences: {
    email: {
      marketing: boolean;
      notifications: boolean;
      updates: boolean;
    };
    sms: {
      marketing: boolean;
      notifications: boolean;
      updates: boolean;
    };
  };
}

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: Yup.string()
    .required('Please select a role'),
  phone: Yup.object({
    number: Yup.string()
      .matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number')
      .required('Phone number is required')
  }),
  address: Yup.object({
    street: Yup.string().required('Street address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    country: Yup.string().required('Country is required'),
    zipCode: Yup.string().required('ZIP code is required')
  }),
  termsAccepted: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
});

const EnhancedRegistrationForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [termsContent, setTermsContent] = useState('');
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const steps = ['Basic Information', 'Contact Details', 'Preferences & Terms'];

  const formik = useFormik<RegistrationFormData>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      phone: {
        number: ''
      },
      address: {
        street: '',
        city: '',
        state: '',
        country: 'India',
        zipCode: ''
      },
      termsAccepted: false,
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
    },
    validationSchema,
    onSubmit: async (values: RegistrationFormData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        setSuccess(true);
        // Store token and redirect or show success message
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Registration failed');
      } finally {
        setLoading(false);
      }
    },
  });

  // Load terms and conditions
  useEffect(() => {
    const loadTerms = async () => {
      try {
        const response = await fetch('/api/auth/terms');
        const data = await response.json();
        setTermsContent(data.content || 'Terms and conditions not available');
      } catch (error) {
        console.error('Failed to load terms:', error);
      }
    };
    loadTerms();
  }, []);

  const handleNext = () => {
    const currentStepFields = getStepFields(activeStep);
    const hasErrors = currentStepFields.some(field => {
      const fieldError = getFieldError(field);
      return fieldError;
    });

    if (!hasErrors) {
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      // Trigger validation for current step fields
      currentStepFields.forEach(field => {
        formik.setFieldTouched(field, true);
      });
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getStepFields = (step: number): string[] => {
    switch (step) {
      case 0:
        return ['name', 'email', 'password', 'confirmPassword', 'role'];
      case 1:
        return ['phone.number', 'address.street', 'address.city', 'address.state', 'address.country', 'address.zipCode'];
      case 2:
        return ['termsAccepted'];
      default:
        return [];
    }
  };

  const getFieldError = (fieldPath: string) => {
    const fieldError = fieldPath.split('.').reduce((obj: any, key) => obj?.[key], formik.errors);
    const fieldTouched = fieldPath.split('.').reduce((obj: any, key) => obj?.[key], formik.touched);
    return fieldTouched && fieldError;
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                label="Full Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="password"
                label="Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={formik.touched.role && Boolean(formik.errors.role)}>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Role"
                >
                  <MenuItem value="farmer">Farmer</MenuItem>
                  <MenuItem value="buyer">Buyer</MenuItem>
                  <MenuItem value="agronomist">Agronomist</MenuItem>
                  <MenuItem value="investor">Investor</MenuItem>
                  <MenuItem value="logistics">Logistics Provider</MenuItem>
                </Select>
                {formik.touched.role && formik.errors.role && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {formik.errors.role}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="phone.number"
                label="Mobile Number"
                value={formik.values.phone.number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone?.number && Boolean(formik.errors.phone?.number)}
                helperText={formik.touched.phone?.number && formik.errors.phone?.number}
                placeholder="Enter 10-digit mobile number"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address.street"
                label="Street Address"
                value={formik.values.address.street}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address?.street && Boolean(formik.errors.address?.street)}
                helperText={formik.touched.address?.street && formik.errors.address?.street}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="address.city"
                label="City"
                value={formik.values.address.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address?.city && Boolean(formik.errors.address?.city)}
                helperText={formik.touched.address?.city && formik.errors.address?.city}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="address.state"
                label="State"
                value={formik.values.address.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address?.state && Boolean(formik.errors.address?.state)}
                helperText={formik.touched.address?.state && formik.errors.address?.state}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="address.country"
                label="Country"
                value={formik.values.address.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address?.country && Boolean(formik.errors.address?.country)}
                helperText={formik.touched.address?.country && formik.errors.address?.country}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="address.zipCode"
                label="ZIP Code"
                value={formik.values.address.zipCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address?.zipCode && Boolean(formik.errors.address?.zipCode)}
                helperText={formik.touched.address?.zipCode && formik.errors.address?.zipCode}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Communication Preferences
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Choose how you'd like to receive communications from Agrimaan:
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Email Communications
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    name="communicationPreferences.email.notifications"
                    checked={formik.values.communicationPreferences.email.notifications}
                    onChange={formik.handleChange}
                  />
                }
                label="Important notifications"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="communicationPreferences.email.updates"
                    checked={formik.values.communicationPreferences.email.updates}
                    onChange={formik.handleChange}
                  />
                }
                label="Product updates"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="communicationPreferences.email.marketing"
                    checked={formik.values.communicationPreferences.email.marketing}
                    onChange={formik.handleChange}
                  />
                }
                label="Marketing emails"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                SMS Communications
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    name="communicationPreferences.sms.notifications"
                    checked={formik.values.communicationPreferences.sms.notifications}
                    onChange={formik.handleChange}
                  />
                }
                label="Important notifications"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="communicationPreferences.sms.updates"
                    checked={formik.values.communicationPreferences.sms.updates}
                    onChange={formik.handleChange}
                  />
                }
                label="Product updates"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="communicationPreferences.sms.marketing"
                    checked={formik.values.communicationPreferences.sms.marketing}
                    onChange={formik.handleChange}
                  />
                }
                label="Marketing SMS"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={
                  <Checkbox
                    name="termsAccepted"
                    checked={formik.values.termsAccepted}
                    onChange={formik.handleChange}
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setShowTermsDialog(true)}
                      sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                    >
                      Terms and Conditions
                    </Button>
                  </Typography>
                }
              />
              {formik.touched.termsAccepted && formik.errors.termsAccepted && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                  {formik.errors.termsAccepted}
                </Typography>
              )}
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  if (success) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Registration Successful!
        </Typography>
        <Typography variant="body1" paragraph>
          Thank you for registering with Agrimaan. Please check your email for verification instructions.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your account is pending admin verification. You'll receive a notification once approved.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Join Agrimaan
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <GoogleOAuthButton 
          fullWidth 
          variant="outlined"
          onError={(error) => setError(error)}
        />
        
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </form>

      {/* Terms and Conditions Dialog */}
      <Dialog
        open={showTermsDialog}
        onClose={() => setShowTermsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Terms and Conditions</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {termsContent}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTermsDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EnhancedRegistrationForm;