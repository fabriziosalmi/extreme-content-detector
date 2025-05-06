import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';

// Create a context for notifications
const NotificationContext = createContext({
  showNotification: () => {},
  closeNotification: () => {},
});

/**
 * Hook to use the notification system
 * @returns {Object} notification methods
 */
export const useNotification = () => useContext(NotificationContext);

/**
 * Provider component for notifications
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    title: '',
    severity: 'info',
    autoHideDuration: 5000,
  });

  const showNotification = ({
    message,
    title,
    severity = 'info',
    autoHideDuration = 5000,
  }) => {
    setNotification({
      open: true,
      message,
      title,
      severity,
      autoHideDuration,
    });
  };

  const closeNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  // Convenience methods for different notification types
  const notifySuccess = (message, title) => 
    showNotification({ message, title, severity: 'success' });
  
  const notifyError = (message, title = 'Error') => 
    showNotification({ message, title, severity: 'error', autoHideDuration: 6000 });
  
  const notifyWarning = (message, title) => 
    showNotification({ message, title, severity: 'warning' });
  
  const notifyInfo = (message, title) => 
    showNotification({ message, title, severity: 'info' });

  return (
    <NotificationContext.Provider 
      value={{ 
        showNotification, 
        closeNotification,
        notifySuccess,
        notifyError, 
        notifyWarning,
        notifyInfo
      }}
    >
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.autoHideDuration}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.title && <AlertTitle>{notification.title}</AlertTitle>}
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;