# AntiFa Model

Una web application per analizzare testi e URL per identificare la presenza di indicatori, temi e retoriche comunemente associati a ideologie estremiste.

## Caratteristiche

- Analisi di testo diretto o URL
- Scraping di contenuto testuale da URL
- Identificazione di indicatori retorici basati su parole chiave e frasi
- Valutazione della forza/rilevanza degli indicatori trovati
- Interfaccia utente moderna e intuitiva
- Visualizzazioni statistiche e grafici di tendenza
- Registrazione e storico delle analisi
- API documentata con Swagger UI
- Analisi multi-metodo personalizzabile

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
│   ├── logs/              # Directory per i file di log JSON
│   └── requirements.txt   # Dipendenze Python
└── frontend/
    ├── package.json       # Configurazione React/npm
    ├── public/            # Asset statici
    ├── src/
    │   ├── App.js         # Componente principale React
    │   ├── App.css        # Stili CSS/Tailwind
    │   ├── index.js       # Entry point
    │   └── components/    # Componenti React
    │       ├── AnalysisForm.js    # Form di input
    │       ├── Disclaimer.js      # Disclaimer legale
    │       ├── Footer.js          # Footer
    │       ├── Header.js          # Header con navigazione 
    │       ├── ResultsDisplay.js  # Visualizzazione risultati
    │       ├── Settings.js        # Configurazione analisi
    │       └── Statistics.js      # Dashboard statistiche
    └── tailwind.config.js # Configurazione Tailwind CSS
```

## Nuove Funzionalità

### Dashboard Statistiche
- Visualizzazione grafica di tendenze e risultati
- Grafici a torta per distribuzione degli indicatori
- Grafici a barre per efficacia dei metodi
- Grafici lineari per evoluzione nel tempo
- Visualizzazione delle parole chiave più frequenti

### Sistema di Logging
- Salvataggio automatico di tutte le analisi
- Archiviazione dei risultati in formato JSON
- Tracciamento di metadati (timestamp, fonte)
- Analisi storica delle tendenze

### API Documentata
- Interfaccia Swagger UI completa all'indirizzo `/docs`
- Documentazione alternativa in ReDoc all'indirizzo `/redoc`
- Specifiche OpenAPI dettagliate
- Esempi di richieste API

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