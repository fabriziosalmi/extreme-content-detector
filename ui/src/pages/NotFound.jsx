import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={2}
        sx={{
          p: 5,
          borderRadius: '12px',
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        
        <Typography variant="h3" gutterBottom>
          404 - Page Not Found
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        
        <Button 
          component={RouterLink} 
          to="/" 
          variant="contained" 
          startIcon={<HomeIcon />}
          size="large"
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFound;