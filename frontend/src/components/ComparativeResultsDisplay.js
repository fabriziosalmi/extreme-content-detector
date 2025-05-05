import React from 'react';
import {
  Box, Paper, Typography, Grid, Chip, Divider, Card, CardContent,
  List, ListItem, ListItemText, ListItemIcon, Avatar
} from '@mui/material';
import {
  CompareArrows as CompareIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  ArrowForward as RightIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * Component to display comparative analysis results between two sources
 */
const ComparativeResultsDisplay = ({ results }) => {
  if (!results || !results.source1 || !results.source2) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Nessun risultato comparativo disponibile
        </Typography>
      </Box>
    );
  }
  
  const { source1, source2, common_indicators, unique_indicators_source1, unique_indicators_source2, strength_comparison } = results;
  
  // Calculate which source has more indicators
  const source1Total = source1.indicators_count;
  const source2Total = source2.indicators_count;
  const indicatorDifference = source1Total - source2Total;
  
  // Calculate total by strength for each source
  const source1Strengths = strength_comparison.source1;
  const source2Strengths = strength_comparison.source2;
  
  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CompareIcon sx={{ mr: 1 }} />
          Analisi Comparativa
        </Typography>
        
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Fonte 1: {source1.type === 'url' ? 'URL' : 'Testo'}
                </Typography>
                {source1.type === 'url' && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, wordBreak: 'break-all' }}>
                    {source1.content}
                  </Typography>
                )}
                <Typography variant="body1" paragraph>
                  Indicatori rilevati: <strong>{source1Total}</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {source1Strengths.high > 0 && (
                    <Chip icon={<ErrorIcon />} color="error" variant="outlined" 
                      label={`${source1Strengths.high} alta intensità`} />
                  )}
                  {source1Strengths.medium > 0 && (
                    <Chip icon={<WarningIcon />} color="warning" variant="outlined" 
                      label={`${source1Strengths.medium} media intensità`} />
                  )}
                  {source1Strengths.low > 0 && (
                    <Chip icon={<InfoIcon />} color="info" variant="outlined" 
                      label={`${source1Strengths.low} bassa intensità`} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Fonte 2: {source2.type === 'url' ? 'URL' : 'Testo'}
                </Typography>
                {source2.type === 'url' && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, wordBreak: 'break-all' }}>
                    {source2.content}
                  </Typography>
                )}
                <Typography variant="body1" paragraph>
                  Indicatori rilevati: <strong>{source2Total}</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {source2Strengths.high > 0 && (
                    <Chip icon={<ErrorIcon />} color="error" variant="outlined" 
                      label={`${source2Strengths.high} alta intensità`} />
                  )}
                  {source2Strengths.medium > 0 && (
                    <Chip icon={<WarningIcon />} color="warning" variant="outlined" 
                      label={`${source2Strengths.medium} media intensità`} />
                  )}
                  {source2Strengths.low > 0 && (
                    <Chip icon={<InfoIcon />} color="info" variant="outlined" 
                      label={`${source2Strengths.low} bassa intensità`} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Comparison Summary */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Riepilogo Comparativo
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography variant="h3">
                      {source1Total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fonte 1
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mx: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {indicatorDifference > 0 ? (
                      <UpIcon color="error" fontSize="large" />
                    ) : indicatorDifference < 0 ? (
                      <DownIcon color="success" fontSize="large" />
                    ) : (
                      <RightIcon color="action" fontSize="large" />
                    )}
                    <Typography variant="body2" fontWeight="bold">
                      {indicatorDifference > 0 
                        ? `+${indicatorDifference}` 
                        : indicatorDifference < 0 
                          ? indicatorDifference 
                          : 'Pari'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography variant="h3">
                      {source2Total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fonte 2
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" gutterBottom>
                      Indicatori Comuni: {common_indicators.length}
                    </Typography>
                    <List dense>
                      {common_indicators.length > 0 ? (
                        common_indicators.map((indicator, index) => (
                          <ListItem key={index}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  bgcolor: 
                                    indicator.source1_strength === 'high' || indicator.source2_strength === 'high'
                                    ? 'error.main'
                                    : indicator.source1_strength === 'medium' || indicator.source2_strength === 'medium'
                                    ? 'warning.main'
                                    : 'info.main'
                                }}
                              >
                                {index + 1}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText 
                              primary={indicator.indicator_name}
                              secondary={`${indicator.source1_strength} / ${indicator.source2_strength}`}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText primary="Nessun indicatore comune trovato" />
                        </ListItem>
                      )}
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" gutterBottom>
                      Unici nella Fonte 1: {unique_indicators_source1.length}
                    </Typography>
                    <List dense>
                      {unique_indicators_source1.length > 0 ? (
                        unique_indicators_source1.map((indicator, index) => (
                          <ListItem key={index}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  bgcolor: 
                                    indicator.overall_strength === 'high'
                                    ? 'error.main'
                                    : indicator.overall_strength === 'medium'
                                    ? 'warning.main'
                                    : 'info.main'
                                }}
                              >
                                {index + 1}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText 
                              primary={indicator.indicator_name}
                              secondary={indicator.overall_strength}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText primary="Nessun indicatore unico trovato" />
                        </ListItem>
                      )}
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" gutterBottom>
                      Unici nella Fonte 2: {unique_indicators_source2.length}
                    </Typography>
                    <List dense>
                      {unique_indicators_source2.length > 0 ? (
                        unique_indicators_source2.map((indicator, index) => (
                          <ListItem key={index}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  bgcolor: 
                                    indicator.overall_strength === 'high'
                                    ? 'error.main'
                                    : indicator.overall_strength === 'medium'
                                    ? 'warning.main'
                                    : 'info.main'
                                }}
                              >
                                {index + 1}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText 
                              primary={indicator.indicator_name}
                              secondary={indicator.overall_strength}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText primary="Nessun indicatore unico trovato" />
                        </ListItem>
                      )}
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ComparativeResultsDisplay;
