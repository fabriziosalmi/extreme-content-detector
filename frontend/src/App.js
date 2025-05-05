import React, { useState, useEffect } from 'react';
import './App.css';
import AnalysisForm from './components/AnalysisForm';
import ResultsDisplay from './components/ResultsDisplay';
import Header from './components/Header';
import Footer from './components/Footer';
import Disclaimer from './components/Disclaimer';
import Settings from './components/Settings';
import Statistics from './components/Statistics';
import axios from 'axios';

// Default settings configuration
const defaultSettings = {
  enableKeywordMatching: true,
  enableContextAnalysis: false,
  enableFrequencyAnalysis: false,
  enableProximityAnalysis: false,
  enablePatternMatching: false,
  thresholds: {
    minKeywordStrength: 'low',
    minOccurrences: 1,
    proximityDistance: 20
  },
  categories: [
    { id: 'extreme_nationalism', name: 'Nazionalismo Estremo/Autoritarismo', enabled: true },
    { id: 'revisionism', name: 'Revisionismo/Negazionismo', enabled: true },
    { id: 'hate_speech', name: 'Discorso d\'Odio', enabled: true },
    { id: 'specific_symbolism', name: 'Simbolismo/Retorica Specifica', enabled: true },
    { id: 'anti_democracy', name: 'Anti-Democrazia', enabled: true },
    { id: 'victimhood', name: 'Vittimismo e Persecuzione', enabled: true },
    { id: 'traditionalism', name: 'Tradizionalismo Reazionario', enabled: true },
    { id: 'militarism', name: 'Militarismo e Culto della Violenza', enabled: true },
    { id: 'conspiracy_theories', name: 'Teorie del Complotto', enabled: true },
    { id: 'enemy_otherization', name: 'Demonizzazione del Nemico', enabled: true },
  ],
  displayMode: 'detailed',
  highlightMatches: true
};

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [originalText, setOriginalText] = useState('');

  // Load settings from localStorage on initial load
  useEffect(() => {
    const savedSettings = localStorage.getItem('antifaModelSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }
  }, []);

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
  };

  const toggleSettings = () => {
    setShowSettings(prev => !prev);
    setShowStatistics(false);
  };

  const toggleStatistics = () => {
    setShowStatistics(prev => !prev);
    setShowSettings(false);
  };

  const handleAnalyze = async (text, url) => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    // Save the original text for highlighting if needed
    if (text) {
      setOriginalText(text);
    } else {
      setOriginalText('');
    }
    
    try {
      // Prepare the request payload based on settings
      const payload = {
        text,
        url,
        settings: {
          methods: {
            keywordMatching: settings.enableKeywordMatching,
            contextAnalysis: settings.enableContextAnalysis,
            frequencyAnalysis: settings.enableFrequencyAnalysis,
            proximityAnalysis: settings.enableProximityAnalysis,
            patternMatching: settings.enablePatternMatching
          },
          thresholds: settings.thresholds,
          categories: settings.categories
            .filter(cat => cat.enabled)
            .map(cat => cat.id)
        }
      };
      
      const API_URL = 'http://localhost:8000';
      const response = await axios.post(`${API_URL}/analyze`, payload);
      
      setResults(response.data);
    } catch (error) {
      console.error('Error during analysis:', error);
      
      if (error.response) {
        setError(`Errore: ${error.response.data.detail || 'Si è verificato un errore durante l\'analisi.'}`);
      } else if (error.request) {
        setError('Impossibile connettersi al server. Verifica che il backend sia in esecuzione.');
      } else {
        setError(`Si è verificato un errore: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        toggleSettings={toggleSettings} 
        toggleStatistics={toggleStatistics}
        showSettings={showSettings}
        showStatistics={showStatistics}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {showSettings ? (
          <Settings 
            settings={settings} 
            updateSettings={updateSettings} 
          />
        ) : showStatistics ? (
          <Statistics />
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <AnalysisForm 
                onAnalyze={handleAnalyze}
                setLoading={setLoading} 
                setError={setError} 
              />
            </div>
            
            <Disclaimer />
            
            {loading && (
              <div className="text-center my-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Caricamento...
                  </span>
                </div>
                <p className="mt-2 text-gray-700">Analisi in corso, attendere...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-6" role="alert">
                <p className="font-bold">Errore</p>
                <p>{error}</p>
              </div>
            )}
            
            {!loading && results && (
              <ResultsDisplay 
                results={results} 
                displayMode={settings.displayMode} 
                highlightMatches={settings.highlightMatches}
                originalText={originalText}
              />
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;