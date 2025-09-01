import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import FieldForm from '../components/FieldForm';

// Mock data for demonstration
const mockField = {
  id: '1',
  name: 'North Field',
  area: '12.5',
  location: 'Village Rampur, District Meerut, Uttar Pradesh',
  soilType: 'Loam',
  irrigationType: 'Drip Irrigation',
  description: 'Main wheat production field with good drainage system',
  coordinates: {
    latitude: '28.9845',
    longitude: '77.7064'
  }
};

const EditField: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  
  const [fieldData, setFieldData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchField = async () => {
      try {
        // For now, using mock data
        // Replace this with actual API call
        console.log('Fetching field with id:', id);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // TODO: Replace with actual API call
        // const response = await dispatch(getFieldById(id) as any);
        
        setFieldData(mockField);
      } catch (error: any) {
        console.error('Error fetching field:', error);
        setError('Failed to load field data.');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (id) {
      fetchField();
    }
  }, [id, dispatch]);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Updating field with data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Uncomment when slice is ready
      // await dispatch(updateField({ id, data: formData }) as any);

      setSuccess(true);
      setTimeout(() => {
        navigate('/fields');
      }, 1500);

    } catch (error: any) {
      console.error('Error updating field:', error);
      setError(error.message || 'Failed to update field. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!fieldData) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Alert severity="error">
          Field not found.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Edit Field: {fieldData.name}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Field updated successfully! Redirecting...
        </Alert>
      )}

      <FieldForm
        initialData={fieldData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        isEdit={true}
      />
    </Box>
  );
};

export default EditField;
