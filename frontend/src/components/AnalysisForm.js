import React, { useState, useEffect } from 'react';
import { Box, Button, Tabs, Tab, TextField, FormControl, FormGroup, FormControlLabel, Checkbox, 
  Typography, Accordion, AccordionSummary, AccordionDetails, Select, MenuItem, InputLabel,
  Alert, CircularProgress, Card, Paper, Grid, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import CachedIcon from '@mui/icons-material/Cached';
import LinkIcon from '@mui/icons-material/Link';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import axios from 'axios';

// Constants for API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Change the prop name to match what's being passed from App.js
const AnalysisForm = ({ onAnalyze }) => {
  // State for form inputs
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [inputType, setInputType] = useState('text');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [indicators, setIndicators] = useState([]);
  
  // State for analysis settings
  const [settings, setSettings] = useState({
    methods: {
      keywordMatching: true,
      contextAnalysis: false,
      frequencyAnalysis: false,
      proximityAnalysis: false,
      patternMatching: false,
      sentimentAnalysis: false,          // New method
      nounPhraseAnalysis: false,         // New method
      propagandaTechniqueAnalysis: false // New method
    },
    thresholds: {
      minKeywordStrength: 'low',
      minOccurrences: 1,
      proximityDistance: 20
    },
    categories: []
  });
  
  // Load indicators on component mount
  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/indicators`);
        setIndicators(response.data.indicators || []);
      } catch (err) {
        console.error('Error fetching indicators:', err);
        setError('Failed to load indicators. The server might be unavailable.');
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
  const handleTextChange = (e) => setText(e.target.value);
  const handleUrlChange = (e) => setUrl(e.target.value);
  const handleInputTypeChange = (event, newValue) => {
    setInputType(newValue);
    setError(null); // Clear any previous errors
  };
  
  // Handle settings changes
  const handleMethodChange = (method) => {
    setSettings({
      ...settings,
      methods: {
        ...settings.methods,
        [method]: !settings.methods[method]
      }
    });
  };
  
  const handleThresholdChange = (threshold, value) => {
    setSettings({
      ...settings,
      thresholds: {
        ...settings.thresholds,
        [threshold]: value
      }
    });
  };
  
  const handleCategoryChange = (categoryId) => {
    const currentCategories = [...settings.categories];
    const index = currentCategories.indexOf(categoryId);
    
    if (index === -1) {
      // Add category
      currentCategories.push(categoryId);
    } else {
      // Remove category
      currentCategories.splice(index, 1);
    }
    
    setSettings({
      ...settings,
      categories: currentCategories
    });
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
        }
      };
      
      if (inputType === 'text' && text.trim()) {
        requestData.text = text.trim();
      } else if (inputType === 'url' && url.trim()) {
        requestData.url = url.trim();
      } else {
        throw new Error(inputType === 'text' ? 'Please enter some text to analyze.' : 'Please enter a valid URL to analyze.');
      }
      
      console.log("Sending analysis request:", requestData);
      
      // Submit to API
      const response = await axios.post(`${API_BASE_URL}/analyze`, requestData);
      
      if (response.data) {
        console.log("Analysis response:", response.data);
        // Pass results to parent component
        if (typeof onAnalyze === 'function') {
          // Call onAnalyze with the text/url AND the results
          onAnalyze(requestData.text || '', requestData.url || '', response.data);
        } else {
          console.error('onAnalyze is not a function. Received:', onAnalyze);
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
      {/* Input selection tabs */}
      <Tabs value={inputType} onChange={handleInputTypeChange} aria-label="input type" sx={{ mb: 2 }}>
        <Tab icon={<TextFieldsIcon />} iconPosition="start" label="Testo" value="text" />
        <Tab icon={<LinkIcon />} iconPosition="start" label="URL" value="url" />
      </Tabs>
      
      {/* Input fields based on selected tab */}
      {inputType === 'text' ? (
        <TextField
          label="Inserisci il testo da analizzare"
          multiline
          rows={6}
          value={text}
          onChange={handleTextChange}
          fullWidth
          margin="normal"
          variant="outlined"
          placeholder="Inserisci qui il testo da analizzare per individuare potenziali indicatori retorici..."
        />
      ) : (
        <TextField
          label="Inserisci l'URL da analizzare"
          value={url}
          onChange={handleUrlChange}
          fullWidth
          margin="normal"
          variant="outlined"
          placeholder="https://esempio.it/articolo"
          InputProps={{
            startAdornment: <LinkIcon sx={{ color: 'action.active', mr: 1 }} />,
          }}
        />
      )}
      
      {/* Advanced settings accordion */}
      <Accordion 
        expanded={showAdvanced} 
        onChange={() => setShowAdvanced(!showAdvanced)}
        sx={{ mt: 2, mb: 2 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="advanced-settings-content"
          id="advanced-settings-header"
        >
          <SettingsIcon sx={{ mr: 1 }} />
          <Typography>Impostazioni Avanzate di Analisi</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Analysis Methods */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Metodi di Analisi</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox checked={settings.methods.keywordMatching} disabled />}
                    label="Corrispondenza Parole Chiave (obbligatorio)"
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
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, color: 'primary.main' }}>
                    Metodi Avanzati
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
                </FormGroup>
              </Paper>
            </Grid>
            
            {/* Thresholds */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Soglie di Rilevamento</Typography>
                <FormControl fullWidth margin="normal">
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
                
                <FormControl fullWidth margin="normal">
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
                
                <FormControl fullWidth margin="normal">
                  <InputLabel id="proximity-threshold-label">Distanza di Prossimità (parole)</InputLabel>
                  <Select
                    labelId="proximity-threshold-label"
                    value={settings.thresholds.proximityDistance}
                    label="Distanza di Prossimità (parole)"
                    onChange={(e) => handleThresholdChange('proximityDistance', Number(e.target.value))}
                  >
                    <MenuItem value={5}>5 parole</MenuItem>
                    <MenuItem value={10}>10 parole</MenuItem>
                    <MenuItem value={20}>20 parole (predefinito)</MenuItem>
                    <MenuItem value={50}>50 parole</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
              
              {/* Cache status indicator */}
              <Paper variant="outlined" sx={{ p: 2, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CachedIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2">Caching attivo per risultati più rapidi</Typography>
                </Box>
              </Paper>
            </Grid>
            
            {/* Categories */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Categorie da Analizzare</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Seleziona categorie specifiche o lascia deselezionato per analizzarle tutte
                </Typography>
                
                <Grid container spacing={2}>
                  {Object.keys(categoryGroups).map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {category}
                        </Typography>
                        <FormGroup>
                          {categoryGroups[category].map((indicator) => (
                            <FormControlLabel
                              key={indicator.id}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={settings.categories.includes(indicator.id)}
                                  onChange={() => handleCategoryChange(indicator.id)}
                                />
                              }
                              label={<Typography variant="body2">{indicator.name}</Typography>}
                            />
                          ))}
                        </FormGroup>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Submit button */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading || (!text && inputType === 'text') || (!url && inputType === 'url')}
          sx={{ minWidth: 200 }}
          startIcon={loading ? <CircularProgress size={24} color="inherit" /> : null}
        >
          {loading ? 'Analisi in corso...' : 'Analizza'}
        </Button>
      </Box>
    </Box>
  );
};

export default AnalysisForm;