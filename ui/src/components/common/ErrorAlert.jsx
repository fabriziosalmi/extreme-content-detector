import React from 'react';
import { Alert, AlertTitle, Box, Typography, Button } from '@mui/material';
import { ErrorOutline, RefreshOutlined } from '@mui/icons-material';

/**
 * A reusable error alert component with optional retry functionality
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the error alert
 * @param {string|Error|Object} props.error - Error message, Error object, or error response
 * @param {Function} props.onRetry - Optional callback for retry action
 * @param {Object} props.sx - Additional styles for the component
 * @param {string} props.severity - Alert severity ('error', 'warning', 'info', 'success')
 */
const ErrorAlert = ({
  title = 'Error',
  error,
  onRetry,
  sx = {},
  severity = 'error'
}) => {
  // Extract error message from different error types
  const getErrorMessage = () => {
    if (!error) return 'An unknown error occurred';
    
    if (typeof error === 'string') return error;
    
    if (error instanceof Error) return error.message;
    
    if (error.response) {
      // Handle API error responses
      const { status, data } = error.response;
      if (data && data.message) return `${status}: ${data.message}`;
      if (data && data.error) return `${status}: ${data.error}`;
      return `Request failed with status code ${status}`;
    }
    
    if (error.message) return error.message;
    
    return 'An unknown error occurred';
  };

  return (
    <Alert 
      severity={severity}
      icon={<ErrorOutline />}
      sx={{ 
        width: '100%',
        ...sx 
      }}
    >
      <AlertTitle>{title}</AlertTitle>
      <Box sx={{ mb: onRetry ? 2 : 0 }}>
        <Typography variant="body2">{getErrorMessage()}</Typography>
      </Box>
      
      {onRetry && (
        <Button
          startIcon={<RefreshOutlined />}
          onClick={onRetry}
          size="small"
          variant="outlined"
          color={severity}
          sx={{ mt: 1 }}
        >
          Retry
        </Button>
      )}
    </Alert>
  );
};

export default ErrorAlert;