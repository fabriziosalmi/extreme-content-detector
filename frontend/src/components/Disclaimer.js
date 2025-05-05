import React from 'react';
import { 
  Box, Typography, Alert, AlertTitle, Collapse, IconButton 
} from '@mui/material';
import { Warning, ExpandMore, ExpandLess } from '@mui/icons-material';

const Disclaimer = () => {
  const [expanded, setExpanded] = React.useState(true);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Alert 
      severity="warning" 
      variant="outlined"
      icon={<Warning />}
      sx={{ 
        mb: 4, 
        bgcolor: 'rgba(255, 235, 210, 0.3)',
        border: '1px solid rgba(237, 108, 2, 0.2)',
        '& .MuiAlert-icon': {
          alignItems: 'flex-start',
          pt: 1,
        }
      }}
      action={
        <IconButton
          aria-label={expanded ? "show less" : "show more"}
          color="inherit"
          size="small"
          onClick={toggleExpanded}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      }
    >
      <AlertTitle sx={{ fontWeight: 'bold' }}>
        Importante: Limitazioni dello Strumento
      </AlertTitle>
      
      <Collapse in={expanded}>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body2" paragraph sx={{ mb: 1 }}>
            Questo strumento identifica solo la <strong>presenza</strong> di specifici indicatori retorici e tematici basati su una lista predefinita di parole chiave e frasi.
          </Typography>
          
          <Typography variant="body2" paragraph sx={{ mb: 1 }}>
            <strong>Non</strong> è un giudizio assoluto o un'etichetta binaria di "fascismo" su un testo. L'analisi è limitata, basata su pattern testuali semplici e priva di comprensione contestuale complessa.
          </Typography>
          
          <Typography variant="body2">
            I risultati devono essere interpretati come indicativi della presenza di <strong>alcuni elementi retorici</strong> che potrebbero essere associati a ideologie estremiste, non come una valutazione complessiva del testo o dell'autore.
          </Typography>
        </Box>
      </Collapse>
    </Alert>
  );
};

export default Disclaimer;