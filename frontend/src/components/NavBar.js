import React from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, 
  useTheme, useMediaQuery, IconButton, Menu, MenuItem, Avatar
} from '@mui/material';
import {
  BarChart as StatsIcon,
  Analytics as AnalyzeIcon,
  InfoOutlined as InfoIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
// Try to import logo but handle if it doesn't exist
let logo;
try {
  logo = require('../assets/logo.png');
} catch (e) {
  console.warn('Logo image not found, using a placeholder');
  logo = null;
}

const NavBar = ({ toggleSettings }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);
  
  const handleMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMobileMenuAnchor(null);
  };
  
  const isCurrentPath = (path) => {
    return location.pathname === path;
  };
  
  // Navigation links (desktop version)
  const navLinks = (
    <>
      <Button 
        component={Link} 
        to="/" 
        color={isCurrentPath('/') ? "secondary" : "inherit"}
        startIcon={<AnalyzeIcon />}
        sx={{ mr: 2 }}
      >
        Analizza
      </Button>
      <Button 
        component={Link} 
        to="/stats" 
        color={isCurrentPath('/stats') ? "secondary" : "inherit"}
        startIcon={<StatsIcon />}
        sx={{ mr: 2 }}
      >
        Statistiche
      </Button>
      <Button 
        component={Link} 
        to="/about" 
        color={isCurrentPath('/about') ? "secondary" : "inherit"}
        startIcon={<InfoIcon />}
        sx={{ mr: 2 }}
      >
        Informazioni
      </Button>
      <IconButton 
        color="inherit" 
        onClick={toggleSettings}
        sx={{ ml: 1 }}
        aria-label="Impostazioni"
      >
        <SettingsIcon />
      </IconButton>
    </>
  );
  
  // Mobile menu items
  const mobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchor}
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMenuClose}
      sx={{ mt: 1 }}
    >
      <MenuItem 
        component={Link} 
        to="/" 
        onClick={handleMenuClose}
        sx={{ 
        }}
      >
        <StatsIcon sx={{ mr: 1 }} /> Statistiche
      </MenuItem>
      <MenuItem 
        component={Link} 
        to="/about" 
        onClick={handleMenuClose}
        sx={{ 
          color: isCurrentPath('/about') ? theme.palette.secondary.main : 'inherit'
        }}
      >
        <InfoIcon sx={{ mr: 1 }} /> Informazioni
      </MenuItem>
    </Menu>
  );
  
  return (
    <AppBar position="static" color="primary" elevation={3}>
      <Toolbar>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: isMobile ? 1 : 0 }}>
          {logo ? (
            <img src={logo} alt="AntiFa Model Logo" height="72" width="72" style={{ marginRight: '10px' }} />
          ) : (
            <AnalyzeIcon sx={{ mr: 1, fontSize: 32 }} />
          )}
          <Typography variant="h6" component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
            AntiFa Model
          </Typography>
        </Box>
        
        {/* Navigation Links */}
        {isMobile ? (
          <>
            <IconButton 
              edge="end" 
              color="inherit" 
              aria-label="menu"
              onClick={handleMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            {mobileMenu}
          </>
        ) : (
          <Box sx={{ ml: 4 }}>
            {navLinks}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
