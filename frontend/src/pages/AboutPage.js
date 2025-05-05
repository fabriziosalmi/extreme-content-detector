import React from 'react';
import {
  Typography, Box, Card, CardContent, Grid, Divider,
  List, ListItem, ListItemText, Link, Paper
} from '@mui/material';
import {
  Info as InfoIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Psychology as PsychologyIcon,
  Public as PublicIcon
} from '@mui/icons-material';

const AboutPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Informazioni su AntiFa Model
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cos'è AntiFa Model?
        </Typography>
        
        <Typography paragraph>
          AntiFa Model è uno strumento progettato per l'analisi automatizzata di testi al fine di identificare indicatori retorici 
          potenzialmente associati a discorsi d'odio o retorica estremista. Utilizzando vari metodi di analisi linguistica, 
          il sistema esamina testi in italiano alla ricerca di pattern linguistici specifici.
        </Typography>
        
        <Typography paragraph>
          Il progetto è stato sviluppato come strumento di ricerca e educazione, per aiutare a identificare e comprendere
          meglio i modelli retorici che possono sottendere a certe forme di comunicazione.
        </Typography>
      </Paper>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PsychologyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Metodi di Analisi</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Corrispondenza Parole Chiave" 
                    secondary="Individua termini specifici associati a particolari retoriche"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Analisi del Contesto" 
                    secondary="Esamina il contesto in cui compaiono parole chiave"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Analisi della Frequenza" 
                    secondary="Valuta la ripetizione e la densità di termini significativi"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Analisi di Prossimità" 
                    secondary="Rileva la vicinanza tra termini potenzialmente correlati"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Pattern Matching" 
                    secondary="Identifica schemi retorici complessi nel testo"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Analisi del Sentimento" 
                    secondary="Valuta la carica emotiva del testo"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Analisi di Frasi Nominali" 
                    secondary="Esamina costrutti nominali caratteristici"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Tecniche di Propaganda" 
                    secondary="Rileva strategie comunicative manipolative"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Limitazioni e Considerazioni</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography paragraph>
                <strong>Non è un sistema di moderazione automatica:</strong> AntiFa Model è progettato come strumento 
                di ricerca e analisi, non come sistema di moderazione automatica dei contenuti.
              </Typography>
              <Typography paragraph>
                <strong>Falsi positivi e negativi:</strong> Il sistema può produrre sia falsi positivi (identificando 
                erroneamente testo innocuo) che falsi negativi (non rilevando contenuti problematici).
              </Typography>
              <Typography paragraph>
                <strong>Supporto limitato di lingue:</strong> Attualmente, il sistema è ottimizzato per l'italiano.
              </Typography>
              <Typography paragraph>
                <strong>Giudizio umano necessario:</strong> I risultati dovrebbero sempre essere interpretati da un 
                essere umano che comprenda il contesto e le sfumature che un sistema automatizzato potrebbe non cogliere.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CodeIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Tecnologie Utilizzate</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Backend</Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Python" secondary="Linguaggio di programmazione principale" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="FastAPI" secondary="Framework web per API" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="NLTK" secondary="Libreria per elaborazione del linguaggio naturale" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="BeautifulSoup" secondary="Parsing HTML per estrazione testo" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Frontend</Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="React" secondary="Libreria JavaScript per UI" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Material-UI" secondary="Componenti React stile Material Design" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Recharts" secondary="Libreria di visualizzazione dati" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Axios" secondary="Client HTTP per richieste API" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SecurityIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Privacy e Utilizzo Responsabile</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Typography paragraph>
          I dati analizzati vengono utilizzati esclusivamente per fini di analisi e possono essere archiviati in forma anonimizzata 
          per migliorare il sistema. Non vengono condivisi con terze parti né utilizzati per profilazione.
        </Typography>
        <Typography paragraph>
          Lo strumento è pensato per essere utilizzato in modo responsabile ed etico. Non incoraggiamo l'uso di AntiFa Model 
          per scopi di sorveglianza, censura, o per target specifici individui o gruppi.
        </Typography>
        <Typography>
          Per maggiori informazioni o feedback sul progetto, visitare la 
          <Link href="https://github.com/fab/antifa-model" target="_blank" rel="noopener" sx={{ ml: 1 }}>
            repository GitHub <PublicIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default AboutPage;
