import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SyncIcon from '@mui/icons-material/Sync';
import apiService from '../services/api';

const Websites = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentWebsite, setCurrentWebsite] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Form state
  const [formData, setFormData] = useState({
    url: '',
    name: '',
    category: '',
    description: ''
  });

  const categories = [
    { value: 'far-right', label: 'Far-Right' },
    { value: 'neo-nazi', label: 'Neo-Nazi' },
    { value: 'white-nationalist', label: 'White Nationalist' },
    { value: 'alt-right', label: 'Alt-Right' },
    { value: 'fascist', label: 'Fascist' },
    { value: 'other', label: 'Other Extremist' }
  ];

  const loadWebsites = async () => {
    setLoading(true);
    try {
      const data = await apiService.getWebsites();
      setWebsites(data);
      setError(null);
    } catch (err) {
      console.error('Error loading websites:', err);
      setError('Failed to load websites. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebsites();
  }, []);

  const handleOpenDialog = (website = null) => {
    if (website) {
      setCurrentWebsite(website);
      setFormData({
        url: website.url,
        name: website.name,
        category: website.category || '',
        description: website.description || ''
      });
    } else {
      setCurrentWebsite(null);
      setFormData({
        url: '',
        name: '',
        category: '',
        description: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.url || !formData.name) {
        setNotification({
          open: true,
          message: 'URL and name are required!',
          severity: 'error'
        });
        return;
      }

      if (currentWebsite) {
        // Update existing website
        await apiService.updateWebsite(currentWebsite.id, formData);
      } else {
        // Add new website
        await apiService.createWebsite(formData);
      }
      
      // Show success message
      setNotification({
        open: true,
        message: `Website ${currentWebsite ? 'updated' : 'added'} successfully!`,
        severity: 'success'
      });
      
      // Refresh the list
      loadWebsites();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving website:', err);
      setNotification({
        open: true,
        message: `Failed to ${currentWebsite ? 'update' : 'add'} website: ${err.message}`,
        severity: 'error'
      });
    }
  };

  const handleScrapeWebsite = async (websiteId) => {
    try {
      // Call API to scrape a specific website
      await apiService.scrapeWebsite(websiteId);
      setNotification({
        open: true,
        message: 'Scraper started for website!',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to start scraper',
        severity: 'error'
      });
    }
  };

  const handleDeleteWebsite = async (website) => {
    // Confirm before deleting
    if (window.confirm(`Are you sure you want to delete the website "${website.name}"?`)) {
      try {
        await apiService.deleteWebsite(website.id);
        
        setNotification({
          open: true,
          message: 'Website deleted successfully!',
          severity: 'success'
        });
        
        // Refresh the list
        loadWebsites();
      } catch (err) {
        console.error('Error deleting website:', err);
        setNotification({
          open: true,
          message: `Failed to delete website: ${err.message}`,
          severity: 'error'
        });
      }
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Monitored Websites
        </Typography>
        <Typography color="text.secondary">
          Manage the list of websites being monitored for extremist content
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Website List</Typography>
          <Box>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />} 
              onClick={loadWebsites}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />} 
              onClick={() => handleOpenDialog()}
            >
              Add Website
            </Button>
          </Box>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Last Scraped</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Loading websites...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : websites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No websites added yet. Click "Add Website" to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                websites.map((website) => (
                  <TableRow key={website.id} hover>
                    <TableCell>{website.name}</TableCell>
                    <TableCell>
                      <a href={website.url} target="_blank" rel="noopener noreferrer">
                        {website.url}
                      </a>
                    </TableCell>
                    <TableCell>{website.category || '-'}</TableCell>
                    <TableCell>
                      {website.last_scraped 
                        ? new Date(website.last_scraped).toLocaleString() 
                        : 'Never'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleScrapeWebsite(website.id)}
                        title="Run scraper on this website"
                      >
                        <SyncIcon />
                      </IconButton>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(website)}
                        title="Edit website"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteWebsite(website)}
                        title="Delete website"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Website Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentWebsite ? 'Edit Website' : 'Add New Website'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                name="url"
                label="Website URL"
                value={formData.url}
                onChange={handleInputChange}
                fullWidth
                required
                placeholder="https://example.com"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Website Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                placeholder="Example Website"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentWebsite ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Websites;