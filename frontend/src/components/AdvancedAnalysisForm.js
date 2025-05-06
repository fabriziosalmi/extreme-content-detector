import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Tab, Tabs, TextField, Button, 
  FormGroup, FormControlLabel, Switch, Divider, 
  Alert, CircularProgress, Grid, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { CompareArrows as CompareIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Advanced analysis component supporting comparison between texts or URLs
 */
const AdvancedAnalysisForm = ({ onAnalysisComplete, settings, updateSettings }) => {
  // State for inputs
  const [source1, setSource1] = useState({
    type: 'text',
    text: '',
    url: ''
  });
  
  const [source2, setSource2] = useState({
    type: 'text', 
    text: '',
    url: ''
  });
  
  // Analysis type
  const [analysisType, setAnalysisType] = useState('comparison');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allIndicators, setAllIndicators] = useState([]);
  
  // Load indicators on mount
  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        // Use environment variable or fallback to localhost
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await axios.get(`${API_URL}/indicators`);
        setAllIndicators(response.data.indicators || []);
      } catch (err) {
        console.error('Error fetching indicators:', err);
        setError('Failed to load indicators. The server might be unavailable.');
      }
    };
    
    fetchIndicators();
  }, []);
  
  // Handle input changes
  const handleSource1Change = (field, value) => {
    setSource1(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSource2Change = (field, value) => {
    setSource2(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleMethodChange = (method) => {
    updateSettings({
      ...settings,
      methods: {
        ...settings.methods,
        [method]: !settings.methods[method]
      }
    });
  };
  
  const handleIndicatorSelection = (indicatorId) => {
    // Use the enabled property in the categories array
    const updatedCategories = settings.categories.map(cat => 
      cat.id === indicatorId
        ? {...cat, enabled: !cat.enabled}
        : cat
    );
    
    updateSettings({
      ...settings,
      categories: updatedCategories
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Prepare request based on analysis type
      if (analysisType === 'comparison') {
        const requestData = {
          text1: source1.type === 'text' ? source1.text : null,
          url1: source1.type === 'url' ? source1.url : null,
          text2: source2.type === 'text' ? source2.text : null,
          url2: source2.type === 'url' ? source2.url : null,
          settings: {
            methods: settings.methods,
            categories: settings.categories
              .filter(cat => cat.enabled)
              .map(cat => cat.id)
          }
        };
        
        const response = await axios.post(`${API_BASE_URL}/analyze-comparison`, requestData);
        
        if (response.data) {
          if (typeof onAnalysisComplete === 'function') {
            onAnalysisComplete({
              type: 'comparison',
              data: response.data
            });
          }
        }
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.detail || err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Analisi Avanzata
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="analysis-type-label">Tipo di Analisi</InputLabel>
          <Select
            labelId="analysis-type-label"
            value={analysisType}
            label="Tipo di Analisi"
            onChange={(e) => setAnalysisType(e.target.value)}
          >
            <MenuItem value="comparison">Analisi Comparativa</MenuItem>
            <MenuItem value="historical">Analisi Storica</MenuItem>
            <MenuItem value="trend">Analisi di Tendenza</MenuItem>
          </Select>
        </FormControl>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Comparison Analysis UI */}
        {analysisType === 'comparison' && (
          <Grid container spacing={3}>
            {/* Source 1 */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Fonte 1
              </Typography>
              
              <Tabs 
                value={source1.type} 
                onChange={(e, newValue) => handleSource1Change('type', newValue)}
                sx={{ mb: 2 }}
              >
                <Tab label="Testo" value="text" />
                <Tab label="URL" value="url" />
              </Tabs>
              
              {source1.type === 'text' ? (
                <TextField
                  label="Inserisci il testo da analizzare"
                  multiline
                  rows={5}
                  value={source1.text}
                  onChange={(e) => handleSource1Change('text', e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              ) : (
                <TextField
                  label="Inserisci l'URL da analizzare"
                  value={source1.url}
                  onChange={(e) => handleSource1Change('url', e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              )}
            </Grid>
            
            {/* Source 2 */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Fonte 2
              </Typography>
              
              <Tabs 
                value={source2.type} 
                onChange={(e, newValue) => handleSource2Change('type', newValue)}
                sx={{ mb: 2 }}
              >
                <Tab label="Testo" value="text" />
                <Tab label="URL" value="url" />
              </Tabs>
              
              {source2.type === 'text' ? (
                <TextField
                  label="Inserisci il testo da analizzare"
                  multiline
                  rows={5}
                  value={source2.text}
                  onChange={(e) => handleSource2Change('text', e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              ) : (
                <TextField
                  label="Inserisci l'URL da analizzare"
                  value={source2.url}
                  onChange={(e) => handleSource2Change('url', e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              )}
            </Grid>
          </Grid>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        {/* Analysis Methods */}
        <Typography variant="h6" gutterBottom>
          Metodi di Analisi
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.methods.keywordMatching}
                    onChange={() => handleMethodChange('keywordMatching')}
                    disabled={true}
                  />
                }
                label="Corrispondenza Parole Chiave (obbligatorio)"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.methods.contextAnalysis}
                    onChange={() => handleMethodChange('contextAnalysis')}
                  />
                }
                label="Analisi del Contesto"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.methods.frequencyAnalysis}
                    onChange={() => handleMethodChange('frequencyAnalysis')}
                  />
                }
                label="Analisi della Frequenza"
              />
            </FormGroup>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.methods.proximityAnalysis}
                    onChange={() => handleMethodChange('proximityAnalysis')}
                  />
                }
                label="Analisi di Prossimità"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.methods.patternMatching}
                    onChange={() => handleMethodChange('patternMatching')}
                  />
                }
                label="Riconoscimento di Modelli"
              />
            </FormGroup>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Indicator Selection */}
        <Typography variant="h6" gutterBottom>
          Categorie di Indicatori
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Seleziona le categorie specifiche da analizzare o lascia vuoto per analizzarle tutte
        </Typography>
        
        <Grid container spacing={2}>
          {settings.categories.map(category => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={category.enabled}
                    onChange={() => handleIndicatorSelection(category.id)}
                  />
                }
                label={category.name}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CompareIcon />}
          disabled={loading}
          sx={{ minWidth: 200 }}
        >
          {loading ? 'Analisi in corso...' : 'Avvia Analisi Avanzata'}
        </Button>
      </Box>
    </Box>
  );
};

export default AdvancedAnalysisForm;
