import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Chip, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemText, ListItemIcon, Alert, Paper, Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AnalysisIcon from '@mui/icons-material/Psychology';
import SentimentIcon from '@mui/icons-material/Mood';
import ContextIcon from '@mui/icons-material/TextFields';
import FrequencyIcon from '@mui/icons-material/BarChart';
import CachedIcon from '@mui/icons-material/Cached';
import PatternIcon from '@mui/icons-material/FindInPage';
import ProximityIcon from '@mui/icons-material/Compare';
import KeywordIcon from '@mui/icons-material/Key';
import PropagandaIcon from '@mui/icons-material/Campaign';
import PhraseIcon from '@mui/icons-material/FormatQuote';

const ResultsDisplay = ({ results, originalText }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categorizedResults, setCategorizedResults] = useState({});
  const [strengthCounts, setStrengthCounts] = useState({ high: 0, medium: 0, low: 0 });

  // Parse and organize results when they change
  useEffect(() => {
    if (results && results.results && results.results.length > 0) {
      // Count indicators by strength
      const counts = { high: 0, medium: 0, low: 0 };
      results.results.forEach(indicator => {
        const strength = indicator.overall_strength || 'low';
        counts[strength] = (counts[strength] || 0) + 1;
      });
      setStrengthCounts(counts);
      
      // Sort indicators by strength (high to low)
      const sorted = [...results.results].sort((a, b) => {
        const strengthValues = { high: 3, medium: 2, low: 1 };
        return strengthValues[b.overall_strength || 'low'] - strengthValues[a.overall_strength || 'low'];
      });
      
      // Group by category
      const grouped = sorted.reduce((acc, result) => {
        const category = result.indicator_name || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(result);
        return acc;
      }, {});
      
      setCategorizedResults(grouped);

      // Set the initially expanded category
      const firstCategory = Object.keys(grouped)[0];
      if (firstCategory) {
        setExpandedCategory(firstCategory);
      }
    } else {
      // Reset state if results are empty
      setCategorizedResults({});
      setStrengthCounts({ high: 0, medium: 0, low: 0 });
      setExpandedCategory(null);
    }
  }, [results]); // Depend only on results

  // Check if results exist - Early return
  if (!results || !results.results || results.results.length === 0) {
    return (
      <Box sx={{ mt: 3, p: 3, textAlign: 'center' }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Nessun indicatore rilevato
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Il testo analizzato non contiene indicatori significativi secondo i parametri impostati.
        </Typography>
      </Box>
    );
  }

  // Track which analysis methods were used
  const usedMethods = results.analysis_methods || {};
  const methodNames = {
    keywordMatching: "Corrispondenza Parole Chiave",
    contextAnalysis: "Analisi del Contesto",
    frequencyAnalysis: "Analisi della Frequenza",
    proximityAnalysis: "Analisi di Prossimità",
    patternMatching: "Riconoscimento di Modelli",
    sentimentAnalysis: "Analisi del Sentimento",
    nounPhraseAnalysis: "Analisi di Frasi Nominali",
    propagandaTechniqueAnalysis: "Tecniche di Propaganda"
  };
  
  const handleCategoryChange = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };
  
  // Check if cached result
  const isCachedResult = results.cached === true;
  
  return (
    <Box sx={{ mt: 3 }}>
      {/* Cache indicator */}
      {isCachedResult && (
        <Alert 
          icon={<CachedIcon />} 
          severity="info" 
          sx={{ mb: 2 }}
        >
          Risultato recuperato dalla cache. L'analisi è stata eseguita in precedenza.
        </Alert>
      )}
      
      {/* Summary card */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AnalysisIcon sx={{ mr: 1 }} />
            Risultati dell'Analisi
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={7}>
              <Typography variant="body1">
                Sono stati trovati <strong>{results.total_indicators_found}</strong> indicatori.
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {strengthCounts.high > 0 && (
                  <Chip 
                    icon={<ErrorIcon />} 
                    label={`${strengthCounts.high} di forza alta`} 
                    color="error" 
                    variant="outlined" 
                  />
                )}
                {strengthCounts.medium > 0 && (
                  <Chip 
                    icon={<WarningIcon />} 
                    label={`${strengthCounts.medium} di forza media`} 
                    color="warning" 
                    variant="outlined" 
                  />
                )}
                {strengthCounts.low > 0 && (
                  <Chip 
                    icon={<InfoIcon />} 
                    label={`${strengthCounts.low} di forza bassa`} 
                    color="info" 
                    variant="outlined" 
                  />
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Metodi di analisi utilizzati:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {Object.entries(usedMethods).map(([method, used]) => 
                  used && (
                    <Chip 
                      key={method}
                      label={methodNames[method] || method}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 0.5 }}
                      icon={
                        method === 'keywordMatching' ? <KeywordIcon /> :
                        method === 'contextAnalysis' ? <ContextIcon /> :
                        method === 'frequencyAnalysis' ? <FrequencyIcon /> :
                        method === 'proximityAnalysis' ? <ProximityIcon /> :
                        method === 'patternMatching' ? <PatternIcon /> :
                        method === 'sentimentAnalysis' ? <SentimentIcon /> :
                        method === 'nounPhraseAnalysis' ? <PhraseIcon /> :
                        method === 'propagandaTechniqueAnalysis' ? <PropagandaIcon /> :
                        <AnalysisIcon />
                      }
                    />
                  )
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Results by category */}
      {Object.entries(categorizedResults).map(([category, indicators]) => (
        <Accordion 
          key={category}
          expanded={expandedCategory === category}
          onChange={() => handleCategoryChange(category)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <Typography variant="h6">{category}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  {indicators.length} {indicators.length === 1 ? 'indicatore' : 'indicatori'}
                </Typography>
                
                {/* Strength indicators */}
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {indicators.some(ind => ind.overall_strength === 'high') && (
                    <ErrorIcon color="error" fontSize="small" />
                  )}
                  {indicators.some(ind => ind.overall_strength === 'medium') && (
                    <WarningIcon color="warning" fontSize="small" />
                  )}
                  {indicators.some(ind => ind.overall_strength === 'low' && ind.overall_strength !== 'high' && ind.overall_strength !== 'medium') && (
                    <InfoIcon color="info" fontSize="small" />
                  )}
                </Box>
              </Box>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            {indicators.map((indicator, idx) => (
              <Paper 
                key={indicator.indicator_id + idx}
                variant="outlined"
                sx={{ 
                  p: 2, 
                  mb: 2,
                  borderLeft: '4px solid',
                  borderLeftColor: 
                    indicator.overall_strength === 'high' ? 'error.main' :
                    indicator.overall_strength === 'medium' ? 'warning.main' : 'info.main'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {indicator.indicator_name}
                  </Typography>
                  <Chip 
                    size="small"
                    label={`Forza ${indicator.overall_strength === 'high' ? 'alta' : indicator.overall_strength === 'medium' ? 'media' : 'bassa'}`}
                    color={
                      indicator.overall_strength === 'high' ? 'error' : 
                      indicator.overall_strength === 'medium' ? 'warning' : 'info'
                    }
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {indicator.indicator_description}
                </Typography>
                
                {/* Keywords found */}
                {indicator.found_keywords && indicator.found_keywords.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Parole chiave rilevate:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {indicator.found_keywords.map((keyword, i) => (
                        <Chip 
                          key={i}
                          label={keyword.text}
                          size="small"
                          color={
                            keyword.strength === 'high' ? 'error' : 
                            keyword.strength === 'medium' ? 'warning' : 'info'
                          }
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </>
                )}
                
                {/* Context examples */}
                {indicator.context && indicator.context.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Esempi in contesto:
                    </Typography>
                    <List dense disablePadding>
                      {indicator.context.map((ctx, i) => (
                        <ListItem key={i} sx={{ py: 0.5, px: 1, bgcolor: 'background.paper', mb: 0.5, borderRadius: 1 }}>
                          <ListItemText 
                            primary={
                              <Typography variant="body2" 
                                dangerouslySetInnerHTML={{ 
                                  __html: ctx.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#d32f2f">$1</strong>') 
                                }} 
                              />
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                
                {/* Pattern matches */}
                {indicator.pattern_matches && indicator.pattern_matches.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Modelli rilevati:
                    </Typography>
                    <List dense disablePadding>
                      {indicator.pattern_matches.map((pattern, i) => (
                        <ListItem key={i} sx={{ py: 0.5, px: 1, bgcolor: 'background.paper', mb: 0.5, borderRadius: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <PatternIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">{pattern}</Typography>} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                
                {/* Frequency data */}
                {indicator.frequency_data && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Dati di frequenza:
                    </Typography>
                    <Typography variant="body2">
                      Occorrenze totali: {indicator.frequency_data.total_occurrences} (densità: {indicator.frequency_data.density.toFixed(2)}%)
                    </Typography>
                  </>
                )}
                
                {/* Proximity data */}
                {indicator.proximity_matches && indicator.proximity_matches.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Parole chiave vicine:
                    </Typography>
                    <List dense disablePadding>
                      {indicator.proximity_matches.map((match, i) => (
                        <ListItem key={i} sx={{ py: 0.5, px: 1, bgcolor: 'background.paper', mb: 0.5, borderRadius: 1 }}>
                          <ListItemText 
                            primary={
                              <Typography variant="body2">
                                "{match.keyword1}" e "{match.keyword2}" a distanza di {match.distance} parole
                              </Typography>
                            } 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Paper>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default ResultsDisplay;