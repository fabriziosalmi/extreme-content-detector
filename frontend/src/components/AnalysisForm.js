import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Button, TextField, FormControl, FormGroup, FormControlLabel, Checkbox, 
  Typography, Select, MenuItem, InputLabel, Collapse,
  Alert, CircularProgress, Paper, Grid, Divider, Chip, Tooltip, IconButton
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CachedIcon from '@mui/icons-material/Cached';
import LinkIcon from '@mui/icons-material/Link';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import axios from 'axios';

// Constants for API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const GITHUB_REPO = 'https://github.com/fabriziosalmi/antifa-model';

const AnalysisForm = ({ onAnalyze, settings, updateSettings }) => {
  // State for form inputs
  const [url, setUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
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
  
  // Group indicators by category for the UI
  const categoryGroups = indicators.reduce((groups, indicator) => {
    if (!groups[indicator.category_name]) {
      groups[indicator.category_name] = [];
    }
    groups[indicator.category_name].push(indicator);
    return groups;
  }, {});
  
  // Handle input changes
  const handleUrlChange = (e) => setUrl(e.target.value);
  
  // Handle settings changes
  const handleMethodChange = (method) => {
    updateSettings({
      ...settings,
      methods: {
        ...settings.methods,
        [method]: !settings.methods[method]
      }
    });
  };
  
  const handleThresholdChange = (threshold, value) => {
    updateSettings({
      ...settings,
      thresholds: {
        ...settings.thresholds,
        [threshold]: value
      }
    });
  };
  
  const handleCategoryChange = (categoryId) => {
    // Use the enabled property in the categories array
    const updatedCategories = settings.categories.map(cat => 
      cat.id === categoryId 
        ? {...cat, enabled: !cat.enabled} 
        : cat
    );
    
    updateSettings({
      ...settings,
      categories: updatedCategories
    });
  };

  // Select or deselect all categories
  const handleSelectAllCategories = (selected) => {
    const updatedCategories = settings.categories.map(cat => ({
      ...cat,
      enabled: selected
    }));
    
    updateSettings({
      ...settings,
      categories: updatedCategories
    });
  };
  
  // Count selected methods
  const selectedMethodsCount = Object.values(settings.methods).filter(Boolean).length;
  
  // Count enabled categories
  const enabledCategoriesCount = settings.categories.filter(cat => cat.enabled).length;
  
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
      
      {/* Settings summary */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ mr: 1 }}>
          Metodi attivi:
        </Typography>
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
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Button
          size="small"
          startIcon={<SettingsIcon />}
          onClick={() => setShowAdvanced(!showAdvanced)}
          color="inherit"
          sx={{ 
            fontSize: '0.8125rem',
            color: showAdvanced ? 'primary.main' : 'text.secondary'
          }}
        >
          {showAdvanced ? 'Nascondi impostazioni' : 'Impostazioni avanzate'}
        </Button>
      </Box>
      
      {/* Advanced settings accordion */}
      <Collapse in={showAdvanced}>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
            Impostazioni Avanzate di Analisi
          </Typography>
          
          <Grid container spacing={3}>
            {/* Analysis Methods */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Metodi di Analisi
              </Typography>
              
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={settings.methods.keywordMatching} disabled />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Corrispondenza Parole Chiave
                      <Chip size="small" label="Base" sx={{ ml: 1, height: 18, fontSize: '0.7rem' }} />
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={<Checkbox checked={settings.methods.contextAnalysis} onChange={() => handleMethodChange('contextAnalysis')} />}
                  label="Analisi del Contesto"
                />
                
                <FormControlLabel
                  control={<Checkbox checked={settings.methods.frequencyAnalysis} onChange={() => handleMethodChange('frequencyAnalysis')} />}
                  label="Analisi della Frequenza"
                />
                
                <FormControlLabel
                  control={<Checkbox checked={settings.methods.proximityAnalysis} onChange={() => handleMethodChange('proximityAnalysis')} />}
                  label="Analisi di Prossimità"
                />
                
                <FormControlLabel
                  control={<Checkbox checked={settings.methods.patternMatching} onChange={() => handleMethodChange('patternMatching')} />}
                  label="Riconoscimento di Modelli"
                />
                
                <Divider sx={{ my: 1.5 }} />
                
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  Metodi Avanzati
                  <Tooltip title="Questi metodi potrebbero richiedere più tempo di elaborazione">
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                
                <FormControlLabel
                  control={<Checkbox checked={settings.methods.sentimentAnalysis} onChange={() => handleMethodChange('sentimentAnalysis')} />}
                  label="Analisi del Sentimento"
                />
                
                <FormControlLabel
                  control={<Checkbox checked={settings.methods.nounPhraseAnalysis} onChange={() => handleMethodChange('nounPhraseAnalysis')} />}
                  label="Analisi di Frasi Nominali"
                />
                
                <FormControlLabel
                  control={<Checkbox checked={settings.methods.propagandaTechniqueAnalysis} onChange={() => handleMethodChange('propagandaTechniqueAnalysis')} />}
                  label="Tecniche di Propaganda"
                />
                
                <FormControlLabel
                  control={<Checkbox checked={settings.methods.topicCoherenceAnalysis} onChange={() => handleMethodChange('topicCoherenceAnalysis')} />}
                  label="Analisi di Coerenza Tematica"
                />
                
                <FormControlLabel
                  control={<Checkbox checked={settings.methods.rhetoricalDeviceAnalysis} onChange={() => handleMethodChange('rhetoricalDeviceAnalysis')} />}
                  label="Dispositivi Retorici"
                />
              </FormGroup>
            </Grid>
            
            {/* Thresholds */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Soglie di Rilevamento
              </Typography>
              
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="strength-threshold-label">Forza Minima Parole Chiave</InputLabel>
                <Select
                  labelId="strength-threshold-label"
                  value={settings.thresholds.minKeywordStrength}
                  label="Forza Minima Parole Chiave"
                  onChange={(e) => handleThresholdChange('minKeywordStrength', e.target.value)}
                >
                  <MenuItem value="low">Bassa</MenuItem>
                  <MenuItem value="medium">Media</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="occurrences-threshold-label">Occorrenze Minime</InputLabel>
                <Select
                  labelId="occurrences-threshold-label"
                  value={settings.thresholds.minOccurrences}
                  label="Occorrenze Minime"
                  onChange={(e) => handleThresholdChange('minOccurrences', Number(e.target.value))}
                >
                  <MenuItem value={1}>1 (predefinito)</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="proximity-threshold-label">Distanza di Prossimità</InputLabel>
                <Select
                  labelId="proximity-threshold-label"
                  value={settings.thresholds.proximityDistance}
                  label="Distanza di Prossimità"
                  onChange={(e) => handleThresholdChange('proximityDistance', Number(e.target.value))}
                >
                  <MenuItem value={5}>5 parole</MenuItem>
                  <MenuItem value={10}>10 parole</MenuItem>
                  <MenuItem value={20}>20 parole (predefinito)</MenuItem>
                  <MenuItem value={50}>50 parole</MenuItem>
                </Select>
              </FormControl>
              
              {/* Repository link */}
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                <CachedIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  Repository ufficiale: <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">GitHub</a>
                </Typography>
              </Box>
            </Grid>
            
            {/* Categories */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  Categorie da Analizzare
                </Typography>
                
                <Box>
                  <Button 
                    size="small" 
                    onClick={() => handleSelectAllCategories(true)}
                    sx={{ mr: 1 }}
                  >
                    Seleziona tutte
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => handleSelectAllCategories(false)}
                    color="inherit"
                  >
                    Deseleziona tutte
                  </Button>
                </Box>
              </Box>
              
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Seleziona categorie specifiche o lascia deselezionato per analizzarle tutte
              </Typography>
              
              <Grid container spacing={2}>
                {settings.categories.map((category) => (
                  <Grid item xs={12} sm={6} md={4} key={category.id}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 1.5, 
                        borderRadius: 1,
                        height: '100%'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {category.name}
                      </Typography>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              checked={category.enabled}
                              onChange={() => handleCategoryChange(category.id)}
                            />
                          }
                          label={<Typography variant="body2">{category.name}</Typography>}
                        />
                      </FormGroup>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
      
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