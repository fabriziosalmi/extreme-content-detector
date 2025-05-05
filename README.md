# AntiFa Model

Una web application per analizzare URL e identificare la presenza di indicatori, temi e retoriche comunemente associati a ideologie estremiste.

## Caratteristiche

- Analisi di contenuto da URL con interfaccia intuitiva
- Scraping di contenuto testuale da URL
- Identificazione di indicatori retorici basati su parole chiave e frasi
- Valutazione della forza/rilevanza degli indicatori trovati
- Interfaccia utente moderna con design responsivo
- Visualizzazioni statistiche e grafici di tendenza
- Registrazione e storico delle analisi
- API documentata con Swagger UI
- Analisi multi-metodo personalizzabile
- Navigazione fluida con auto-scroll ai risultati

## Limitazioni Importanti

Questo strumento:
- **NON** assegna un punteggio singolo di "fascismo" o etichetta i testi in modo binario
- Rileva **solo** la presenza di specifici indicatori retorici definiti staticamente
- È basato su un approccio di pattern matching semplice, non su modelli ML complessi
- Non considera il contesto più ampio, l'ironia, o le citazioni
- Va interpretato come uno strumento indicativo, non come un giudizio assoluto

## Struttura del Progetto

```
./
├── backend/
│   ├── app.py             # API FastAPI con Swagger docs
│   ├── analysis.py        # Logica di analisi testuale
│   ├── indicators.json    # Definizione degli indicatori
│   ├── websocket_server.py # Supporto per WebSocket 
│   ├── cache/             # Cache per risultati analisi
│   ├── logs/              # Directory per i file di log JSON
│   └── requirements.txt   # Dipendenze Python
└── frontend/
    ├── package.json       # Configurazione React/npm
    ├── public/            # Asset statici
    │   ├── antifa.png     # Logo applicazione
    │   └── favicon.ico    # Icona browser
    ├── src/
    │   ├── App.js         # Componente principale React
    │   ├── App.css        # Stili CSS
    │   ├── index.js       # Entry point
    │   ├── assets/        # Asset grafici
    │   │   └── logo.png   # Logo dell'applicazione
    │   ├── components/    # Componenti React
    │   │   ├── AnalysisForm.js      # Form per analisi URL
    │   │   ├── AdvancedAnalysisForm.js # Form con opzioni avanzate
    │   │   ├── ComparativeResultsDisplay.js # Visualizzazione analisi comparative
    │   │   ├── Disclaimer.js        # Disclaimer legale con UI collassabile
    │   │   ├── Footer.js            # Footer con link a repository
    │   │   ├── Header.js            # Header dell'applicazione
    │   │   ├── NavBar.js            # Barra di navigazione principale
    │   │   ├── ResultsDisplay.js    # Visualizzazione risultati
    │   │   ├── Settings.js          # Configurazione analisi
    │   │   └── Statistics.js        # Dashboard statistiche
    │   ├── pages/         # Pagine dell'applicazione
    │   │   ├── AboutPage.js         # Pagina informazioni
    │   │   └── StatsPage.js         # Pagina statistiche
    │   └── utils/
    │       └── apiUtils.js          # Utilità per chiamate API
    └── tailwind.config.js # Configurazione Tailwind CSS
```

## Nuove Funzionalità

### UI/UX Migliorato
- Design responsivo per dispositivi mobili e desktop
- Logo con maschera circolare per un aspetto più moderno
- Navigazione semplificata con barra superiore unificata
- Auto-scroll ai risultati di analisi
- Form di analisi ottimizzato per URL
- Impostazioni avanzate collassabili per un'interfaccia più pulita

### Dashboard Statistiche
- Visualizzazione grafica di tendenze e risultati
- Grafici a torta per distribuzione degli indicatori
- Grafici a barre per efficacia dei metodi
- Grafici lineari per evoluzione nel tempo
- Visualizzazione delle parole chiave più frequenti

### Sistema di Caching
- Cache per risultati di analisi URL
- Miglioramento delle performance per URL analizzati frequentemente
- Indicatore di stato di cache nell'interfaccia

### Sistema di Logging
- Salvataggio automatico di tutte le analisi
- Archiviazione dei risultati in formato JSON
- Tracciamento di metadati (timestamp, fonte)
- Analisi storica delle tendenze

### API Documentata
- Interfaccia Swagger UI completa all'indirizzo `/docs`
- Documentazione alternativa in ReDoc all'indirizzo `/redoc`
- Specifiche OpenAPI dettagliate
- Supporto esclusivo per analisi URL

## Requisiti

### Backend
- Python 3.8+
- Pacchetti elencati in `requirements.txt`

### Frontend
- Node.js 14+
- npm o Yarn

## Installazione

### Backend

1. Navigare nella directory del backend:
   ```
   cd backend
   ```

2. Creare un ambiente virtuale e attivarlo:
   ```
   python -m venv venv
   source venv/bin/activate  # Linux/MacOS
   venv\Scripts\activate     # Windows
   ```

3. Installare le dipendenze:
   ```
   pip install -r requirements.txt
   ```

4. Scaricare i dati NLTK necessari:
   ```
   python -c "import nltk; nltk.download('punkt')"
   ```

### Frontend

1. Navigare nella directory del frontend:
   ```
   cd frontend
   ```

2. Installare le dipendenze:
   ```
   npm install
   ```

## Avvio dell'applicazione

### Backend

1. Dalla directory `backend`, avviare il server:
   ```
   uvicorn app:app --reload
   ```
   
   Il backend sarà disponibile all'indirizzo `http://localhost:8000`.
   La documentazione Swagger è disponibile all'indirizzo `http://localhost:8000/docs`.

### Frontend

1. Dalla directory `frontend`, avviare l'applicazione React:
   ```
   npm start
   ```
   
   L'interfaccia sarà disponibile all'indirizzo `http://localhost:3000`.

## Utilizzo

1. Apri l'interfaccia web all'indirizzo `http://localhost:3000`
2. Inserisci l'URL da analizzare nel campo di input
3. Opzionalmente, espandi le "Impostazioni avanzate" per personalizzare l'analisi
4. Clicca su "Analizza URL"
5. L'interfaccia scorrerà automaticamente ai risultati una volta pronti
6. Esplora le statistiche cliccando sul pulsante nell'header
7. Personalizza le impostazioni di analisi tramite il menù di configurazione

## Endpoint API

L'API offre i seguenti endpoint principali:

- `POST /analyze` - Analizza un URL
- `POST /analyze-comparison` - Confronta due URL
- `GET /indicators` - Ottieni l'elenco degli indicatori disponibili
- `GET /stats` - Ottieni statistiche sulle analisi effettuate
- `GET /logs` - Ottieni i log delle analisi precedenti
- `GET /trends` - Ottieni dati di tendenza per grafici
- `GET /domain-stats` - Ottieni statistiche sui domini analizzati
- `GET /url-history` - Ottieni cronologia URL analizzati
- `GET /top-urls` - Ottieni URL con maggior numero di indicatori
- `GET /date-analytics` - Ottieni analisi per data
- `GET /web-coverage` - Ottieni statistiche sulla copertura web
- `GET /export-analysis/{format}` - Esporta dati di analisi in diversi formati

Per una documentazione completa, consultare l'interfaccia Swagger all'indirizzo `http://localhost:8000/docs`.

## Contribuire

Il repository ufficiale è disponibile su GitHub: [https://github.com/fabriziosalmi/antifa-model](https://github.com/fabriziosalmi/antifa-model)

Puoi contribuire al progetto in diversi modi:

1. Migliorare gli indicatori in `indicators.json` con parole chiave più accurate
2. Migliorare l'algoritmo di scraping per URL complessi
3. Aggiungere supporto per NLP più avanzato (es. riconoscimento entità, analisi contestuale)
4. Migliorare l'interfaccia utente
5. Aggiungere nuove visualizzazioni alla dashboard statistiche
6. Migliorare la gestione degli errori e la robustezza

## Considerazioni Etiche

Questo strumento è progettato per scopi educativi e di ricerca. Riconosce la complessità delle ideologie politiche e non pretende di fornire etichette definitive. I risultati dovrebbero sempre essere interpretati con senso critico e consapevolezza del contesto più ampio.

## Licenza

Questo progetto è rilasciato sotto licenza MIT.