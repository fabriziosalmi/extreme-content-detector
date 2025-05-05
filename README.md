# AntiFa Model

Una web application per analizzare testi e URL per identificare la presenza di indicatori, temi e retoriche comunemente associati a ideologie estremiste.

## Caratteristiche

- Analisi di testo diretto o URL
- Scraping di contenuto testuale da URL
- Identificazione di indicatori retorici basati su parole chiave e frasi
- Valutazione della forza/rilevanza degli indicatori trovati
- Interfaccia utente moderna e intuitiva

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
│   ├── app.py             # API FastAPI
│   ├── analysis.py        # Logica di analisi testuale
│   ├── indicators.json    # Definizione degli indicatori
│   └── requirements.txt   # Dipendenze Python
└── frontend/
    ├── package.json       # Configurazione React/npm
    ├── src/
    │   ├── App.js         # Componente principale
    │   └── components/    # Componenti React
    └── tailwind.config.js # Configurazione Tailwind CSS
```

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

### Frontend

1. Dalla directory `frontend`, avviare l'applicazione React:
   ```
   npm start
   ```
   
   L'interfaccia sarà disponibile all'indirizzo `http://localhost:3000`.

## Utilizzo

1. Apri l'interfaccia web all'indirizzo `http://localhost:3000`
2. Scegli se vuoi analizzare un testo diretto o un URL
3. Inserisci il testo o l'URL
4. Clicca su "Analizza"
5. Attendi l'elaborazione e visualizza i risultati

## Contribuire

Puoi contribuire al progetto in diversi modi:

1. Migliorare gli indicatori in `indicators.json` con parole chiave più accurate
2. Migliorare l'algoritmo di scraping per URL complessi
3. Aggiungere supporto per NLP più avanzato (es. riconoscimento entità, analisi contestuale)
4. Migliorare l'interfaccia utente

## Considerazioni Etiche

Questo strumento è progettato per scopi educativi e di ricerca. Riconosce la complessità delle ideologie politiche e non pretende di fornire etichette definitive. I risultati dovrebbero sempre essere interpretati con senso critico e consapevolezza del contesto più ampio.

## Licenza

Questo progetto è rilasciato sotto licenza MIT.