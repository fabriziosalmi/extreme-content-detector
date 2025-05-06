import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Button,
  Box,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';

const AppHeader = ({ toggleSidebar }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme => theme.zIndex.drawer + 1,
        background: 'linear-gradient(90deg, #000000 0%, #e91e63 100%)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        >
          <Box 
            component="span" 
            sx={{ 
              display: 'inline-flex', 
              fontWeight: 'bold',
              alignItems: 'center' 
            }}
          >
            ANTIFA-SCRAPER
          </Box>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            color="inherit" 
            variant="outlined" 
            startIcon={<PlayArrowIcon />}
            sx={{ mr: 2 }}
            onClick={() => {
              // TODO: Trigger a scraping run via API
              fetch('/api/run/scraper', { method: 'POST' })
                .then(res => res.json())
                .then(data => console.log('Scraper started:', data));
            }}
          >
            Run Scraper
          </Button>

          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;