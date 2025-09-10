import React, { useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import FieldsForm from '../../components/FieldsForm';
import { createFields } from '../../features/fields/fieldSlice'; // Uncomment when slice is ready

const AddFields: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // For now, using mock implementation
      // Replace this with actual API call
      console.log('Creating Fields with data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Uncomment when slice is ready
      await dispatch(createFields(formData) as any);

      setSuccess(true);
      setTimeout(() => {
        navigate('/fields');
      }, 1500);

    } catch (error: any) {
      console.error('Error creating Fields:', error);
      setError(error.message || 'Failed to create Fields. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Fields Registry
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Fields created successfully! Redirecting...
        </Alert>
      )}

      <FieldsForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        isEdit={false}
      />
    </Box>
  );
};

export default AddFields;
