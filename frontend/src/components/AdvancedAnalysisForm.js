import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Tab, Tabs, TextField, Button, 
  Alert, CircularProgress, Grid, Divider
} from '@mui/material';
import { CompareArrows as CompareIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Advanced analysis component supporting comparison between texts or URLs
 * Uses consolidated settings from parent component
 */
const AdvancedAnalysisForm = ({ onAnalysisComplete, settings, onOpenSettings }) => {
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
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Prepare request based on analysis type
      const requestData = {
        text1: source1.type === 'text' ? source1.text : null,
        url1: source1.type === 'url' ? source1.url : null,
        text2: source2.type === 'text' ? source2.text : null,
        url2: source2.type === 'url' ? source2.url : null,
        settings: {
          methods: settings.methods,
          categories: settings.categories
            .filter(cat => cat.enabled)
            .map(cat => cat.id),
          analysisType: settings.analysisType,
          thresholds: settings.thresholds
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
          Analisi Comparativa
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Analizza e confronta due fonti di contenuto
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={onOpenSettings}
            size="small"
          >
            Configura impostazioni di analisi
          </Button>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Comparison Analysis UI */}
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
        
        <Divider sx={{ my: 2 }} />
        
        {/* Display currently selected settings summary */}
        <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Impostazioni di analisi selezionate:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Tipo di analisi: {settings.analysisType === 'comparison' ? 'Comparativa' : 
                               settings.analysisType === 'historical' ? 'Storica' : 
                               settings.analysisType === 'trend' ? 'Tendenza' : 'Standard'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Metodi attivi: {Object.entries(settings.methods)
                              .filter(([_, active]) => active)
                              .map(([name, _]) => name)
                              .join(', ')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Categorie attive: {settings.categories
                                .filter(cat => cat.enabled)
                                .length} di {settings.categories.length}
          </Typography>
        </Box>
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
          {loading ? 'Analisi in corso...' : 'Avvia Analisi Comparativa'}
        </Button>
      </Box>
    </Box>
  );
};

export default AdvancedAnalysisForm;
