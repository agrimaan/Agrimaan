/**
 * Format field data for API submission
 * Ensures proper structure for backend API
 */

export const formatFieldData = (formData: any) => {
    return {
      name: formData.name || '',
      area: parseFloat(formData.area) || 0,
      location: formData.location || formData.address || '',
      soilType: formData.soilType || '',
      irrigationType: formData.irrigationType || '',
      description: formData.description || '',
      coordinates: {
        latitude: parseFloat(formData.coordinates?.latitude) || 0,
        longitude: parseFloat(formData.coordinates?.longitude) || 0
      },
      // Add any additional fields your backend expects
      address: formData.location || formData.address || '',
      latitude: parseFloat(formData.coordinates?.latitude) || 0,
      longitude: parseFloat(formData.coordinates?.longitude) || 0
    };
  };
  
  // Usage in your form submit:
  // const formattedData = formatFieldData(formData);
  // await onSubmit(formattedData);