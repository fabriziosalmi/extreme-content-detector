import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * A reusable error alert component with optional retry capability
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Error title (optional)
 * @param {string} props.message - Error message to display
 * @param {function} props.onRetry - Optional retry handler function
 * @param {string} props.retryText - Text for retry button (default: "Try Again")
 * @param {string} props.severity - Alert severity (default: "error")
 * @param {Object} props.sx - Additional styles to apply to the container
 */
const ErrorAlert = ({
  title,
  message,
  onRetry,
  retryText = 'Try Again',
  severity = 'error',
  sx = {}
}) => {
  return (
    <Box sx={{ my: 2, ...sx }}>
      <Alert 
        severity={severity}
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
            >
              {retryText}
            </Button>
          )
        }
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorAlert;