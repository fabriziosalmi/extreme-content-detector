import React from 'react';
import { Box, Typography, Link, Container, Grid, Divider } from '@mui/material';
import { GitHub, Code, Security } from '@mui/icons-material';

// Constants
const REPO_URL = 'https://github.com/fabriziosalmi/antifa-model';
const README_URL = 'https://github.com/fabriziosalmi/antifa-model/blob/main/README.md';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        py: 3,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
              © {new Date().getFullYear()} AntiFa Model
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Progetto open source per l'analisi retorica
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'center' } }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: 2 }}>
              <Link 
                href={REPO_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                color="inherit" 
                sx={{ display: 'flex', alignItems: 'center', opacity: 0.8, '&:hover': { opacity: 1 } }}
              >
                <GitHub fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Repository</Typography>
              </Link>
              <Link 
                href={README_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                color="inherit" 
                sx={{ display: 'flex', alignItems: 'center', opacity: 0.8, '&:hover': { opacity: 1 } }}
              >
                <Code fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Documentazione</Typography>
              </Link>
              <Link 
                href={`${REPO_URL}#privacy`} 
                target="_blank" 
                rel="noopener noreferrer" 
                color="inherit" 
                sx={{ display: 'flex', alignItems: 'center', opacity: 0.8, '&:hover': { opacity: 1 } }}
              >
                <Security fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Privacy</Typography>
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Questo strumento è pensato per scopi educativi e di ricerca.
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <Typography variant="caption" align="center" display="block" sx={{ opacity: 0.6 }}>
          I risultati dell'analisi sono indicativi e non rappresentano valutazioni assolute.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;