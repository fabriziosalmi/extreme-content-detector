import React from 'react';
import { Typography, Container, Box } from '@mui/material';
import Statistics from '../components/Statistics';

const StatsPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Statistiche e Analisi Dati
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph align="center">
          Visualizzazione completa di statistiche, tendenze e dati analitici raccolti
        </Typography>
        
        <Statistics />
      </Box>
    </Container>
  );
};

export default StatsPage;
