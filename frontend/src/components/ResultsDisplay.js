import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Chip, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemText, ListItemIcon, Alert, Paper, Grid, Tooltip, Divider,
  LinearProgress
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
import TopicIcon from '@mui/icons-material/Topic';
import RhetoricIcon from '@mui/icons-material/RecordVoiceOver';
import BalanceIcon from '@mui/icons-material/Balance';
import ScoreIcon from '@mui/icons-material/Score';

const ResultsDisplay = ({ results, originalText, settings }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categorizedResults, setCategorizedResults] = useState({});
  const [strengthCounts, setStrengthCounts] = useState({ high: 0, medium: 0, low: 0 });
  const [showEvidenceFactors, setShowEvidenceFactors] = useState(true);

  // Parse and organize results when they change
  useEffect(() => {
    // Set display preference based on settings
    if (settings && settings.showEvidenceFactors !== undefined) {
      setShowEvidenceFactors(settings.showEvidenceFactors);
    }

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
  }, [results, settings]); // Depend on results and settings

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
    propagandaTechniqueAnalysis: "Tecniche di Propaganda",
    topicCoherenceAnalysis: "Coerenza Tematica",
    rhetoricalDeviceAnalysis: "Dispositivi Retorici"
  };
  
  const methodIcons = {
    keywordMatching: <KeywordIcon />,
    contextAnalysis: <ContextIcon />,
    frequencyAnalysis: <FrequencyIcon />,
    proximityAnalysis: <ProximityIcon />,
    patternMatching: <PatternIcon />,
    sentimentAnalysis: <SentimentIcon />,
    nounPhraseAnalysis: <PhraseIcon />,
    propagandaTechniqueAnalysis: <PropagandaIcon />,
    topicCoherenceAnalysis: <TopicIcon />,
    rhetoricalDeviceAnalysis: <RhetoricIcon />
  };
  
  const handleCategoryChange = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };
  
  // Check if cached result
  const isCachedResult = results.cached === true;
  
  // Calculate average score from all results (for the overall score display)
  const calculateOverallScore = () => {
    if (!results.results || results.results.length === 0) return 0;
    
    let totalScore = 0;
    let validResults = 0;
    
    results.results.forEach(result => {
      if (result.combined_analysis && result.combined_analysis.score) {
        totalScore += result.combined_analysis.score;
        validResults++;
      }
    });
    
    return validResults > 0 ? totalScore / validResults : 0;
  };
  
  const overallScore = calculateOverallScore();

  // Get score category
  const getScoreCategory = (score) => {
    if (score >= 2.5) return { label: "Alta", color: "error" };
    if (score >= 1.5) return { label: "Media", color: "warning" };
    return { label: "Bassa", color: "info" };
  };
  
  const overallScoreCategory = getScoreCategory(overallScore);
  
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
          
          {/* Overall score panel */}
          {results.results.some(r => r.combined_analysis) && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 2, 
                bgcolor: 'background.default',
                borderLeft: `4px solid ${overallScoreCategory.color}.main`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScoreIcon sx={{ mr: 1, color: `${overallScoreCategory.color}.main` }} />
                  <Typography variant="h6">
                    Punteggio complessivo: <strong>{overallScore.toFixed(2)}</strong>
                  </Typography>
                </Box>
                <Chip 
                  label={`Rilevanza ${overallScoreCategory.label}`}
                  color={overallScoreCategory.color}
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(overallScore / 3) * 100} 
                color={overallScoreCategory.color}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Questo punteggio rappresenta una valutazione ponderata di tutti i metodi di analisi combinati
              </Typography>
            </Paper>
          )}
          
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
                    <Tooltip key={method} title={methodNames[method] || method}>
                      <Chip 
                        label={methodNames[method] || method}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 0.5 }}
                        icon={methodIcons[method] || <AnalysisIcon />}
                      />
                    </Tooltip>
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
                
                {/* Combined Analysis Score (if available) */}
                {indicator.combined_analysis && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" display="flex" alignItems="center">
                        <BalanceIcon fontSize="small" sx={{ mr: 0.5 }} />
                        Analisi combinata: Punteggio {indicator.combined_analysis.score.toFixed(2)}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={indicator.combined_analysis.strength === 'high' ? 'Alta' : 
                               indicator.combined_analysis.strength === 'medium' ? 'Media' : 'Bassa'}
                        color={indicator.combined_analysis.strength === 'high' ? 'error' : 
                              indicator.combined_analysis.strength === 'medium' ? 'warning' : 'info'}
                      />
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={(indicator.combined_analysis.score / 3) * 100} 
                      color={indicator.combined_analysis.strength === 'high' ? 'error' : 
                            indicator.combined_analysis.strength === 'medium' ? 'warning' : 'info'}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    
                    {/* Evidence Factors */}
                    {showEvidenceFactors && indicator.combined_analysis.evidence_factors && 
                     indicator.combined_analysis.evidence_factors.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Fattori di evidenza ({indicator.combined_analysis.methods_used} metodi):
                        </Typography>
                        <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, mt: 1 }}>
                          {indicator.combined_analysis.evidence_factors.map((factor, i) => (
                            <ListItem key={i} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                {methodIcons[factor.method] || <AnalysisIcon fontSize="small" />}
                              </ListItemIcon>
                              <ListItemText 
                                primary={
                                  <Typography variant="body2">
                                    <strong>{methodNames[factor.method] || factor.method}</strong> - {factor.evidence}
                                  </Typography>
                                } 
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                )}
                
                <Divider sx={{ my: 2 }} />
                
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
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                      <PatternIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Modelli rilevati:
                    </Typography>
                    <List dense disablePadding>
                      {indicator.pattern_matches.map((pattern, i) => (
                        <ListItem key={i} sx={{ py: 0.5, px: 1, bgcolor: 'background.paper', mb: 0.5, borderRadius: 1 }}>
                          <ListItemText primary={<Typography variant="body2">{pattern}</Typography>} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                
                {/* Frequency data */}
                {indicator.frequency_data && (
                  <>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                      <FrequencyIcon fontSize="small" sx={{ mr: 0.5 }} />
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
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                      <ProximityIcon fontSize="small" sx={{ mr: 0.5 }} />
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
                
                {/* Sentiment Analysis */}
                {indicator.sentiment_data && (
                  <>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                      <SentimentIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Analisi del sentimento:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Chip 
                        size="small" 
                        label={`Positivo: ${indicator.sentiment_data.positive_score}`} 
                        color="success" 
                        variant="outlined" 
                      />
                      <Chip 
                        size="small" 
                        label={`Negativo: ${indicator.sentiment_data.negative_score}`} 
                        color="error" 
                        variant="outlined" 
                      />
                      <Chip 
                        size="small" 
                        label={`Minaccia: ${indicator.sentiment_data.threat_score}`} 
                        color="warning" 
                        variant="outlined" 
                      />
                    </Box>
                  </>
                )}
                
                {/* Noun Phrase Analysis */}
                {indicator.noun_phrase_matches && Object.keys(indicator.noun_phrase_matches).length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                      <PhraseIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Frasi nominali:
                    </Typography>
                    {Object.entries(indicator.noun_phrase_matches).map(([category, phrases], i) => (
                      <Box key={i} sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {category === 'nationalist_phrases' ? 'Frasi nazionaliste' : 
                           category === 'anti_democratic_phrases' ? 'Frasi anti-democratiche' : 
                           category === 'enemy_phrases' ? 'Frasi sul nemico' : category}:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1, mt: 0.5 }}>
                          {phrases.map((phrase, j) => (
                            <Chip 
                              key={j} 
                              size="small" 
                              label={phrase} 
                              variant="outlined" 
                              color="default"
                            />
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </>
                )}
                
                {/* Propaganda Techniques */}
                {indicator.propaganda_techniques && Object.keys(indicator.propaganda_techniques).length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                      <PropagandaIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Tecniche di propaganda:
                    </Typography>
                    {Object.entries(indicator.propaganda_techniques).map(([technique, examples], i) => (
                      <Box key={i} sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {technique === 'bandwagon' ? 'Bandwagon (consenso maggioritario)' : 
                           technique === 'black_and_white' ? 'Pensiero binario (bianco o nero)' : 
                           technique === 'appeal_to_fear' ? 'Appello alla paura' : 
                           technique === 'glittering_generalities' ? 'Generalizzazioni luccicanti' : 
                           technique === 'name_calling' ? 'Uso di etichette offensive' : technique}:
                        </Typography>
                        <List dense disablePadding>
                          {examples.map((example, j) => (
                            <ListItem key={j} sx={{ py: 0.5, px: 1, bgcolor: 'background.paper', mb: 0.5, borderRadius: 1 }}>
                              <ListItemText primary={<Typography variant="body2">"{example}"</Typography>} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    ))}
                  </>
                )}
                
                {/* Topic Coherence */}
                {indicator.topic_coherence && (
                  <>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                      <TopicIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Coerenza tematica:
                    </Typography>
                    
                    {/* Topic Data */}
                    {indicator.topic_coherence.topic_data && Object.keys(indicator.topic_coherence.topic_data).length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight="medium">Temi rilevati:</Typography>
                        {Object.entries(indicator.topic_coherence.topic_data).map(([topic, data], i) => (
                          <Box key={i} sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              {topic}: {data.count} occorrenze
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {data.examples.slice(0, 5).map((example, j) => (
                                <Chip key={j} size="small" label={example} variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                    
                    {/* Coherent Segments */}
                    {indicator.topic_coherence.coherent_segments && indicator.topic_coherence.coherent_segments.length > 0 && (
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Segmenti coerenti:</Typography>
                        <List dense disablePadding>
                          {indicator.topic_coherence.coherent_segments.map((segment, i) => (
                            <ListItem key={i} sx={{ py: 0.5, px: 1, bgcolor: 'background.paper', mb: 0.5, borderRadius: 1 }}>
                              <ListItemText 
                                primary={<Typography variant="body2">"{segment.sentence}"</Typography>}
                                secondary={
                                  <Typography variant="caption">
                                    Categorie tematiche: {segment.categories.join(', ')}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </>
                )}
                
                {/* Rhetorical Devices */}
                {indicator.rhetorical_devices && indicator.rhetorical_devices.devices_found && 
                 Object.keys(indicator.rhetorical_devices.devices_found).length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                      <RhetoricIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Dispositivi retorici:
                    </Typography>
                    
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {indicator.rhetorical_devices.total_devices} tipi di dispositivi, 
                        {indicator.rhetorical_devices.total_instances} istanze totali,
                        {indicator.rhetorical_devices.escalating_rhetoric ? ' con retorica crescente' : ' senza retorica crescente'}
                      </Typography>
                    </Box>
                    
                    {Object.entries(indicator.rhetorical_devices.devices_found).map(([device, examples], i) => (
                      <Box key={i} sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {device === 'repetition' ? 'Ripetizione' : 
                           device === 'slogans' ? 'Slogan' : 
                           device === 'hyperbole' ? 'Iperbole' : 
                           device === 'dehumanization' ? 'Disumanizzazione' : 
                           device === 'false_dilemma' ? 'Falso dilemma' :
                           device === 'loaded_questions' ? 'Domande tendenziose' :
                           device === 'appeal_to_authority' ? 'Appello all\'autorità' : device}:
                        </Typography>
                        <List dense disablePadding>
                          {examples.map((example, j) => (
                            <ListItem key={j} sx={{ py: 0.5, px: 1, bgcolor: 'background.paper', mb: 0.5, borderRadius: 1 }}>
                              <ListItemText primary={<Typography variant="body2">"{example}"</Typography>} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    ))}
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