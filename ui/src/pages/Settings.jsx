import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  TextField,
  Switch,
  FormGroup,
  FormControlLabel,
  Divider,
  Slider,
  Alert,
  Snackbar,
  InputAdornment,
  Card,
  CardContent
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import ScheduleIcon from '@mui/icons-material/Schedule';

const Settings = () => {
  // Scraper settings
  const [scraperSettings, setScraperSettings] = useState({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    requestTimeout: 10,
    scraperInterval: 24,
    minContentLength: 100,
    maxPagesPerSite: 50,
    followExternalLinks: false
  });

  // Analysis settings
  const [analysisSettings, setAnalysisSettings] = useState({
    minimumConfidenceThreshold: 0.6,
    enableRacistDetection: true,
    enableFascistDetection: true,
    enableNaziDetection: true,
    enableFarRightDetection: true
  });

  // Database settings
  const [dbSettings, setDbSettings] = useState({
    maxStorageDays: 90,
    enableAutoBackup: true,
    backupInterval: 24
  });

  // Notification
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleScraperChange = (e) => {
    const { name, value, checked, type } = e.target;
    setScraperSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAnalysisChange = (e) => {
    const { name, value, checked, type } = e.target;
    setAnalysisSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDbChange = (e) => {
    const { name, value, checked, type } = e.target;
    setDbSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSliderChange = (settingGroup, name) => (e, newValue) => {
    if (settingGroup === 'scraper') {
      setScraperSettings(prev => ({ ...prev, [name]: newValue }));
    } else if (settingGroup === 'analysis') {
      setAnalysisSettings(prev => ({ ...prev, [name]: newValue }));
    } else if (settingGroup === 'db') {
      setDbSettings(prev => ({ ...prev, [name]: newValue }));
    }
  };

  const handleSaveSettings = () => {
    // Here we would call an API to save the settings
    // For now, we'll just show a success notification
    setNotification({
      open: true,
      message: 'Settings saved successfully',
      severity: 'success'
    });
  };

  const handleResetSettings = () => {
    // Reset to default values
    setScraperSettings({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      requestTimeout: 10,
      scraperInterval: 24,
      minContentLength: 100,
      maxPagesPerSite: 50,
      followExternalLinks: false
    });
    
    setAnalysisSettings({
      minimumConfidenceThreshold: 0.6,
      enableRacistDetection: true,
      enableFascistDetection: true,
      enableNaziDetection: true,
      enableFarRightDetection: true
    });
    
    setDbSettings({
      maxStorageDays: 90,
      enableAutoBackup: true,
      backupInterval: 24
    });
    
    setNotification({
      open: true,
      message: 'Settings reset to defaults',
      severity: 'info'
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography color="text.secondary">
          Configure the antifa-scraper application
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Scraper Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Scraper Settings
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="userAgent"
                  label="User Agent"
                  value={scraperSettings.userAgent}
                  onChange={handleScraperChange}
                  fullWidth
                  margin="normal"
                  size="small"
                  helperText="Browser user agent string for web requests"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>
                  Request Timeout: {scraperSettings.requestTimeout} seconds
                </Typography>
                <Slider
                  value={scraperSettings.requestTimeout}
                  onChange={handleSliderChange('scraper', 'requestTimeout')}
                  min={5}
                  max={60}
                  step={5}
                  valueLabelDisplay="auto"
                  marks
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>
                  Scraper Interval: {scraperSettings.scraperInterval} hours
                </Typography>
                <Slider
                  value={scraperSettings.scraperInterval}
                  onChange={handleSliderChange('scraper', 'scraperInterval')}
                  min={1}
                  max={72}
                  step={1}
                  valueLabelDisplay="auto"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="minContentLength"
                  label="Minimum Content Length"
                  value={scraperSettings.minContentLength}
                  onChange={handleScraperChange}
                  type="number"
                  fullWidth
                  margin="normal"
                  size="small"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">chars</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="maxPagesPerSite"
                  label="Max Pages Per Site"
                  value={scraperSettings.maxPagesPerSite}
                  onChange={handleScraperChange}
                  type="number"
                  fullWidth
                  margin="normal"
                  size="small"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">pages</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={scraperSettings.followExternalLinks} 
                        onChange={handleScraperChange}
                        name="followExternalLinks"
                        color="primary"
                      />
                    } 
                    label="Follow External Links" 
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Analysis Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Analysis Settings
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography gutterBottom>
                  Minimum Confidence Threshold: {Math.round(analysisSettings.minimumConfidenceThreshold * 100)}%
                </Typography>
                <Slider
                  value={analysisSettings.minimumConfidenceThreshold}
                  onChange={handleSliderChange('analysis', 'minimumConfidenceThreshold')}
                  min={0}
                  max={1}
                  step={0.05}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                  Enable Content Detection Categories:
                </Typography>
                <FormGroup>
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={analysisSettings.enableRacistDetection} 
                        onChange={handleAnalysisChange}
                        name="enableRacistDetection"
                        color="error"
                      />
                    } 
                    label="Racist Content" 
                  />
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={analysisSettings.enableFascistDetection} 
                        onChange={handleAnalysisChange}
                        name="enableFascistDetection"
                        color="warning"
                      />
                    } 
                    label="Fascist Content" 
                  />
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={analysisSettings.enableNaziDetection} 
                        onChange={handleAnalysisChange}
                        name="enableNaziDetection"
                        color="error"
                      />
                    } 
                    label="Nazi Content" 
                  />
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={analysisSettings.enableFarRightDetection} 
                        onChange={handleAnalysisChange}
                        name="enableFarRightDetection"
                        color="warning"
                      />
                    } 
                    label="Far-Right Content" 
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Database Settings */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Database Settings
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Maximum Storage Period: {dbSettings.maxStorageDays} days
                </Typography>
                <Slider
                  value={dbSettings.maxStorageDays}
                  onChange={handleSliderChange('db', 'maxStorageDays')}
                  min={7}
                  max={365}
                  step={1}
                  valueLabelDisplay="auto"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormGroup>
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={dbSettings.enableAutoBackup} 
                        onChange={handleDbChange}
                        name="enableAutoBackup"
                        color="primary"
                      />
                    } 
                    label="Enable Automatic Backups" 
                  />
                </FormGroup>
                
                {dbSettings.enableAutoBackup && (
                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>
                      Backup Interval: {dbSettings.backupInterval} hours
                    </Typography>
                    <Slider
                      value={dbSettings.backupInterval}
                      onChange={handleSliderChange('db', 'backupInterval')}
                      min={1}
                      max={168}
                      step={1}
                      valueLabelDisplay="auto"
                      disabled={!dbSettings.enableAutoBackup}
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button 
          variant="outlined" 
          color="secondary"
          startIcon={<RotateLeftIcon />}
          onClick={handleResetSettings}
        >
          Reset to Defaults
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </Box>
      
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

export default Settings;