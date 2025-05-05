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

const NavBar = ({ toggleSettings, toggleStatistics }) => {
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
        onClick={toggleStatistics}
        sx={{ ml: 1, mr: 1 }}
        aria-label="Visualizza Statistiche"
        title="Visualizza Statistiche"
      >
        <StatsIcon />
      </IconButton>
      <IconButton 
        color="inherit" 
        onClick={toggleSettings}
        sx={{ ml: 1 }}
        aria-label="Impostazioni"
        title="Impostazioni"
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
          color: isCurrentPath('/') ? theme.palette.secondary.main : 'inherit'
        }}
      >
        <AnalyzeIcon sx={{ mr: 1 }} /> Analizza
      </MenuItem>
      <MenuItem 
        component={Link} 
        to="/stats" 
        onClick={handleMenuClose}
        sx={{ 
          color: isCurrentPath('/stats') ? theme.palette.secondary.main : 'inherit'
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
      <MenuItem onClick={() => { handleMenuClose(); toggleStatistics(); }}>
        <StatsIcon sx={{ mr: 1 }} /> Visualizza Statistiche
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); toggleSettings(); }}>
        <SettingsIcon sx={{ mr: 1 }} /> Impostazioni
      </MenuItem>
    </Menu>
  );
  
  return (
    <AppBar position="static" color="primary" elevation={3}>
      <Toolbar>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: isMobile ? 1 : 0 }}>
          {logo ? (
            <Avatar 
              src={logo} 
              alt="AntiFa Model Logo" 
              sx={{ 
                width: 48, 
                height: 48, 
                mr: 1.5,
                boxShadow: '0 0 8px rgba(0,0,0,0.2)'
              }} 
            />
          ) : (
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.secondary.main, 
                width: 48, 
                height: 48, 
                mr: 1.5,
                boxShadow: '0 0 8px rgba(0,0,0,0.2)'
              }}
            >
              <AnalyzeIcon />
            </Avatar>
          )}
          <Typography 
            variant="h6" 
            component={Link} 
            to="/"
            sx={{ 
              display: { xs: 'none', sm: 'block' },
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}
          >
            AntiFa Model
            <Typography 
              variant="caption" 
              component="span" 
              sx={{ 
                ml: 1, 
                bgcolor: 'rgba(255,255,255,0.2)', 
                px: 0.8, 
                py: 0.2, 
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              v1.0 Beta
            </Typography>
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
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
            {navLinks}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
