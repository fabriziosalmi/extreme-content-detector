import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

/**
 * A reusable page container component with consistent styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Main page title
 * @param {string} props.subtitle - Optional page subtitle
 * @param {React.ReactNode} props.headerAction - Optional action button(s) to display in the header
 * @param {boolean} props.paper - Whether to wrap content in a Paper component (default: false)
 * @param {Object} props.paperProps - Additional props to pass to the Paper component
 * @param {Object} props.containerProps - Additional props to pass to the Container component
 * @param {React.ReactNode} props.children - Page content
 */
const PageContainer = ({ 
  title, 
  subtitle, 
  headerAction, 
  paper = false, 
  paperProps = {}, 
  containerProps = {}, 
  children 
}) => {
  const defaultContainerProps = {
    maxWidth: 'xl',
    ...containerProps
  };

  const defaultPaperProps = {
    elevation: 2,
    sx: { 
      borderRadius: '12px',
      p: 3,
      ...paperProps?.sx 
    },
    ...paperProps
  };

  const content = (
    <>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {headerAction && (
          <Box>
            {headerAction}
          </Box>
        )}
      </Box>
      
      {paper ? (
        <Paper {...defaultPaperProps}>
          {children}
        </Paper>
      ) : children}
    </>
  );

  return <Container {...defaultContainerProps}>{content}</Container>;
};

export default PageContainer;