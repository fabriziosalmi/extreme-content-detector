import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, Grid, Divider, Chip, IconButton
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LinkIcon from '@mui/icons-material/Link';
import SearchIcon from '@mui/icons-material/Search';
import CachedIcon from '@mui/icons-material/Cached';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

// Constants for API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const GITHUB_REPO = 'https://github.com/fabriziosalmi/antifa-model';

const AnalysisForm = ({ onAnalyze, settings, updateSettings, openSettings }) => {
  // State for form inputs
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const resultsRef = useRef(null);
  
  // Load indicators on mount
  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        setLoading(true);
        // Use environment variable or fallback to localhost
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await axios.get(`${API_URL}/indicators`);
        setIndicators(response.data.indicators || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching indicators:', err);
        setError('Failed to load indicators. The server might be unavailable.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchIndicators();
  }, []);
  
  // Handle input changes
  const handleUrlChange = (e) => setUrl(e.target.value);
  
  // Count selected methods
  const selectedMethodsCount = Object.values(settings.methods).filter(Boolean).length;
  
  // Count enabled categories
  const enabledCategoriesCount = settings.categories.filter(cat => cat.enabled).length;
  
  // Settings summary for display
  const settingsSummary = [
    `${selectedMethodsCount} metodi di analisi`,
    `${enabledCategoriesCount} categorie selezionate`,
    `Soglia: ${settings.thresholds.minKeywordStrength === 'low' ? 'Bassa' : 
              settings.thresholds.minKeywordStrength === 'medium' ? 'Media' : 'Alta'}`
  ];

  // Get analysis type display name
  const getAnalysisTypeDisplay = () => {
    switch(settings.analysisType) {
      case 'standard': return 'Standard';
      case 'comparison': return 'Comparativa';
      case 'historical': return 'Storica';
      case 'trend': return 'Tendenza';
      default: return 'Standard';
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Prepare request data
      const requestData = { 
        settings: {
          methods: settings.methods,
          thresholds: settings.thresholds,
          categories: settings.categories
            .filter(cat => cat.enabled)
            .map(cat => cat.id)
        }
      };
      
      if (url.trim()) {
        requestData.url = url.trim();
      } else {
        throw new Error('Please enter a valid URL to analyze.');
      }
      
      // Submit to API
      const response = await axios.post(`${API_BASE_URL}/analyze`, requestData);
      
      if (response.data) {
        // Pass results to parent component
        if (typeof onAnalyze === 'function') {
          // Call onAnalyze with the URL AND the results
          onAnalyze('', requestData.url, response.data);
          
          // Scroll to results after a short delay
          setTimeout(() => {
            if (resultsRef.current) {
              resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 500);
        }
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.detail || err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Render the component
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {/* URL Input Field */}
      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          transition: 'all 0.2s ease-in-out',
          '&:hover, &:focus-within': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
          }
        }}
      >
        <TextField
          label="Inserisci l'URL da analizzare"
          value={url}
          onChange={handleUrlChange}
          error={Boolean(error && url === '')}
          helperText={error && url === '' ? 'URL richiesto' : ''}
          fullWidth
          variant="outlined"
          placeholder="https://esempio.it/articolo"
          InputProps={{
            startAdornment: <LinkIcon sx={{ color: 'action.active', mr: 1 }} />,
            sx: { 
              '& fieldset': { border: 'none' }
            }
          }}
        />
      </Paper>
      
      {/* Settings summary and button */}
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Impostazioni di Analisi
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
              <Chip 
                size="small" 
                color="primary" 
                variant="outlined" 
                label={`${selectedMethodsCount} metodi di analisi`}
                sx={{ fontWeight: 500 }}
              />
              
              {enabledCategoriesCount > 0 ? (
                <Chip 
                  size="small" 
                  color="secondary" 
                  variant="outlined" 
                  label={`${enabledCategoriesCount} categorie selezionate`}
                  sx={{ fontWeight: 500 }}
                />
              ) : (
                <Chip 
                  size="small" 
                  color="info" 
                  variant="outlined" 
                  label="Tutte le categorie"
                  sx={{ fontWeight: 500 }}
                />
              )}
              
              <Chip 
                size="small" 
                color="success" 
                variant="outlined" 
                label={`Soglia: ${settings.thresholds.minKeywordStrength}`}
                sx={{ fontWeight: 500 }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={openSettings}
              color="primary"
              sx={{ 
                borderRadius: 2,
                fontWeight: 500,
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
              }}
            >
              Impostazioni Avanzate
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Repository link */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
        <CachedIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="body2">
          Repository ufficiale: <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">GitHub</a>
        </Typography>
      </Box>
      
      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Submit button */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading || !url.trim()}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          sx={{ 
            minWidth: 200,
            py: 1.2,
            px: 4,
            borderRadius: 8,
            fontWeight: 500,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4
            }
          }}
        >
          {loading ? 'Analisi in corso...' : 'Analizza URL'}
        </Button>
      </Box>
      
      {/* Reference element for scrolling */}
      <div ref={resultsRef} style={{ position: 'relative', top: '-20px' }} />
    </Box>
  );
};

export default AnalysisForm;