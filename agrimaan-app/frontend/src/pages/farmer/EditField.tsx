import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import FieldsForm from '../../components/FieldsForm';

// Mock data for demonstration
const mockFields = {
  id: '1',
  name: 'North Fields',
  area: '12.5',
  location: 'Village Rampur, District Meerut, Uttar Pradesh',
  soilType: 'Loam',
  irrigationType: 'Drip Irrigation',
  description: 'Main wheat production Fields with good drainage system',
  coordinates: {
    latitude: '28.9845',
    longitude: '77.7064'
  }
};

const EditFields: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  
  const [FieldsData, setFieldsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        // For now, using mock data
        // Replace this with actual API call
        console.log('Fetching Fields with id:', id);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // TODO: Replace with actual API call
        // const response = await dispatch(getFieldsById(id) as any);
        
        setFieldsData(mockFields);
      } catch (error: any) {
        console.error('Error fetching Fields:', error);
        setError('Failed to load Fields data.');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (id) {
      fetchFields();
    }
  }, [id, dispatch]);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Updating Fields with data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Uncomment when slice is ready
      // await dispatch(updateFields({ id, data: formData }) as any);

      setSuccess(true);
      setTimeout(() => {
        navigate('/fields');
      }, 1500);

    } catch (error: any) {
      console.error('Error updating Fields:', error);
      setError(error.message || 'Failed to update Fields. Please try again.');
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

  if (!FieldsData) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Alert severity="error">
          Fields not found.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Edit Fields: {FieldsData.name}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Fields updated successfully! Redirecting...
        </Alert>
      )}

      <FieldsForm
        initialData={FieldsData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        isEdit={true}
      />
    </Box>
  );
};

export default EditFields;
