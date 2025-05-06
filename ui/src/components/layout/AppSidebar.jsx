import React from 'react';
import { 
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  useTheme
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import LanguageIcon from '@mui/icons-material/Language';
import ArticleIcon from '@mui/icons-material/Article';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningIcon from '@mui/icons-material/Warning';
import SyncIcon from '@mui/icons-material/Sync';
import BugReportIcon from '@mui/icons-material/BugReport';

const drawerWidth = 240;

const menu = [
  { 
    title: 'Main',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Websites', icon: <LanguageIcon />, path: '/websites' },
      { text: 'Content', icon: <ArticleIcon />, path: '/content' }
    ]
  },
  {
    title: 'Management',
    items: [
      { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
    ]
  },
  {
    title: 'Categories',
    items: [
      { text: 'Racist Content', icon: <WarningIcon color="error" />, path: '/content?category=racist' },
      { text: 'Fascist Content', icon: <WarningIcon color="warning" />, path: '/content?category=fascist' },
      { text: 'Nazi Content', icon: <WarningIcon color="error" />, path: '/content?category=nazi' },
      { text: 'Far-Right Content', icon: <WarningIcon color="warning" />, path: '/content?category=far_right' }
    ]
  },
  {
    title: 'Tasks',
    items: [
      { 
        text: 'Start Scraper', 
        icon: <SyncIcon color="primary" />, 
        action: () => {
          fetch('/api/run/scraper', { method: 'POST' })
            .then(res => res.json())
            .then(data => console.log('Scraper started:', data));
        }
      },
      { 
        text: 'Run Analysis', 
        icon: <BugReportIcon color="primary" />, 
        action: () => {
          fetch('/api/run/analyzer', { method: 'POST' })
            .then(res => res.json())
            .then(data => console.log('Analyzer started:', data));
        }
      }
    ]
  }
];

const AppSidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (item) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
      onClose(); // Close sidebar on mobile after navigation
    }
  };

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          backgroundImage: 'linear-gradient(180deg, #121212 0%, #1a1a1a 100%)',
          borderRight: '1px solid #2c2c2c'
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', py: 2 }}>
        {menu.map((section, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Divider sx={{ my: 2 }} />}
            
            <List subheader={
              <Box sx={{ px: 2, py: 1, typography: 'caption', color: 'text.secondary' }}>
                {section.title}
              </Box>
            }>
              {section.items.map((item, itemIndex) => (
                <ListItem 
                  button 
                  key={itemIndex}
                  onClick={() => handleNavigation(item)}
                  selected={item.path && location.pathname === item.path}
                  sx={{
                    mb: 0.5,
                    mx: 1,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(233, 30, 99, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(233, 30, 99, 0.2)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </React.Fragment>
        ))}
      </Box>
    </Drawer>
  );
};

export default AppSidebar;