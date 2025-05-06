import React from 'react';
import { Box, CircularProgress, Typography, TableRow, TableCell } from '@mui/material';

/**
 * A reusable loading indicator component
 * @param {Object} props - Component props
 * @param {string} props.message - Optional message to display
 * @param {string} props.size - Size of the loading indicator ('small', 'medium', 'large')
 * @param {Object} props.sx - Additional styles
 */
const LoadingIndicator = ({ 
  message = 'Loading...', 
  size = 'medium', 
  sx = {} 
}) => {
  // Map size to actual pixel values
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60
  };
  
  const circularSize = sizeMap[size] || sizeMap.medium;
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 3,
        ...sx
      }}
    >
      <CircularProgress size={circularSize} />
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

/**
 * A specialized loading indicator for use within table bodies
 * 
 * @param {Object} props - Component props
 * @param {number} props.colSpan - Number of columns in the table
 * @param {string} props.message - Optional loading message (default: "Loading data...")
 */
export const TableLoading = ({
  colSpan,
  message = 'Loading data...'
}) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
        <CircularProgress size={30} />
        <Typography variant="body2" sx={{ ml: 2 }}>
          {message}
        </Typography>
      </Box>
    </TableCell>
  </TableRow>
);

/**
 * A fullscreen loading overlay component
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Optional loading message (default: "Loading...")
 * @param {boolean} props.show - Whether to show the overlay
 */
export const FullPageLoading = ({
  message = 'Loading...',
  show = true
}) => {
  if (!show) return null;
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999
      }}
    >
      <LoadingIndicator message={message} size="large" />
    </Box>
  );
};

export default LoadingIndicator;