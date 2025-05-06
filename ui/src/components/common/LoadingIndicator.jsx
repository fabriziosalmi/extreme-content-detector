import React from 'react';
import { Box, CircularProgress, Typography, TableRow, TableCell } from '@mui/material';

const LoadingIndicator = ({ message = "Loading...", size = 30, fullPage = false }) => {
  const content = (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: fullPage ? 'column' : 'row',
      py: fullPage ? 8 : 2
    }}>
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" sx={{ ml: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );

  return content;
};

// Simple centered loading spinner with optional label
export const CenteredLoading = ({ size = 60, message = 'Loading...' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
    <CircularProgress size={size} />
    {message && (
      <Typography variant="body2" sx={{ mt: 2 }}>
        {message}
      </Typography>
    )}
  </Box>
);

// Loading indicator that can be used inside tables
export const TableLoading = ({ colSpan = 5, message = 'Loading...' }) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={30} />
        <Typography variant="body2" sx={{ ml: 2 }}>
          {message}
        </Typography>
      </Box>
    </TableCell>
  </TableRow>
);

export default {
  CenteredLoading,
  TableLoading
};