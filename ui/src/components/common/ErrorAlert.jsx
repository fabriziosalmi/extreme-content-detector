import React from 'react';
import { Alert, Box } from '@mui/material';

const ErrorAlert = ({ message, sx = {} }) => {
  if (!message) return null;
  
  return (
    <Box sx={{ mb: 4, ...sx }}>
      <Alert severity="error">{message}</Alert>
    </Box>
  );
};

export default ErrorAlert;