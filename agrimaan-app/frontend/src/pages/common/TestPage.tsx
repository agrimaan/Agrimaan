import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Box, Typography, Paper, Container } from '@mui/material';

const TestPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Authentication Test Page
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Current User:</Typography>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </Box>
      </Paper>
    </Container>
  );
};

export default TestPage;