import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Settings component for adjusting analysis parameters
 * Consolidated to include all settings in one place
 */
const Settings = ({ isOpen, onClose, settings, updateSettings }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis', 'categories', 'display'
  const [saveMessage, setSaveMessage] = useState(''); // Added for save feedback

  // Update local settings when parent settings change or modal opens
  useEffect(() => {
    setLocalSettings({ ...settings });
    setSaveMessage(''); // Clear message when settings/modal state changes
  }, [settings, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'minKeywordStrength') {
      setLocalSettings(prev => ({
        ...prev,
        thresholds: {
          ...prev.thresholds,
          [name]: value
        }
      }));
    } else if (name === 'analysisType') {
      setLocalSettings(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setLocalSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleMethodChange = (methodName, checked) => {
    setLocalSettings(prev => ({
      ...prev,
      methods: {
        ...prev.methods,
        [methodName]: checked
      }
    }));
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    
    setLocalSettings(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [name]: parseInt(value, 10)
      }
    }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    try {
      localStorage.setItem('antifaModelSettings', JSON.stringify(localSettings));
      setSaveMessage('Impostazioni salvate con successo!');
      setTimeout(() => setSaveMessage(''), 3000); // Clear message after 3 seconds
    } catch (e) {
      console.error('Error saving settings to localStorage:', e);
      setSaveMessage('Errore durante il salvataggio delle impostazioni.');
      setTimeout(() => setSaveMessage(''), 5000); // Clear error message after 5 seconds
    }
    // Optionally, you might want to close the modal on save, or let the user close it.
    // onClose(); // Uncomment if modal should close on save
  };

  // Select or deselect all categories
  const handleSelectAllCategories = (selected) => {
    const updatedCategories = localSettings.categories.map(cat => ({
      ...cat,
      enabled: selected
    }));
    
    setLocalSettings(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };

  // Select or deselect all methods
  const handleSelectAllMethods = (selected) => {
    // Keep keywordMatching always true as it's required
    const updatedMethods = { ...localSettings.methods };
    
    Object.keys(updatedMethods).forEach(method => {
      if (method !== 'keywordMatching') {
        updatedMethods[method] = selected;
      }
    });
    
    setLocalSettings(prev => ({
      ...prev,
      methods: updatedMethods
    }));
  };

  const handleCategoryChange = (categoryId, checked) => {
    const updatedCategories = localSettings.categories.map(cat => 
      cat.id === categoryId 
        ? {...cat, enabled: checked} 
        : cat
    );
    
    setLocalSettings(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };

  const handleDisplayOptionChange = (optionName, checked) => {
    setLocalSettings(prev => ({
      ...prev,
      [optionName]: checked
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-y-auto py-10">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6">Impostazioni di Analisi</h2>
        
        {loading && (
          <div className="mb-4 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Save Feedback Message */}
        {saveMessage && (
          <div className={`mb-4 p-3 rounded-md ${saveMessage.includes('successo') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {saveMessage}
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`${
                activeTab === 'analysis'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } py-2 px-1 border-b-2 font-medium text-sm`}
            >
              Metodi di Analisi
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`${
                activeTab === 'categories'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } py-2 px-1 border-b-2 font-medium text-sm`}
            >
              Categorie
            </button>
            <button
              onClick={() => setActiveTab('thresholds')}
              className={`${
                activeTab === 'thresholds'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } py-2 px-1 border-b-2 font-medium text-sm`}
            >
              Soglie
            </button>
            <button
              onClick={() => setActiveTab('display')}
              className={`${
                activeTab === 'display'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } py-2 px-1 border-b-2 font-medium text-sm`}
            >
              Visualizzazione
            </button>
          </nav>
        </div>
        
        {/* Methods Tab Content */}
        {activeTab === 'analysis' && (
          <div className="mb-8">
            {/* MOVED HERE: Type of Analysis Section */}
            <div className="mb-8"> {/* Added mb-8 for spacing consistent with other sections */}
              <h3 className="text-lg font-semibold mb-4">Tipo di Analisi</h3>
              <div className="space-y-2">
                <select
                  id="analysisType"
                  name="analysisType"
                  value={localSettings.analysisType || 'standard'}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  <option value="standard">Analisi Standard</option>
                  <option value="comparison">Analisi Comparativa</option>
                  <option value="historical">Analisi Storica</option>
                  <option value="trend">Analisi di Tendenza</option>
                </select>
                <p className="text-sm text-gray-500">
                  Il tipo di analisi determina come verranno elaborati i contenuti e presentati i risultati.
                </p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">Metodi di Analisi</h3>
            <p className="text-sm text-gray-600 mb-4">
              Seleziona i metodi da utilizzare per l'analisi del testo. Più metodi garantiscono risultati più accurati ma possono richiedere più tempo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleSelectAllMethods(true)}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Seleziona tutti
                </button>
                <button
                  onClick={() => handleSelectAllMethods(false)}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Deseleziona tutti
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="keywordMatching"
                    checked={localSettings.methods.keywordMatching}
                    onChange={() => {}}
                    disabled={true}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="keywordMatching" className="ml-2 block text-gray-700">
                    Corrispondenza Parole Chiave (obbligatorio)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="contextAnalysis"
                    checked={localSettings.methods.contextAnalysis}
                    onChange={() => handleMethodChange('contextAnalysis', !localSettings.methods.contextAnalysis)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="contextAnalysis" className="ml-2 block text-gray-700">
                    Analisi del Contesto
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="frequencyAnalysis"
                    checked={localSettings.methods.frequencyAnalysis}
                    onChange={() => handleMethodChange('frequencyAnalysis', !localSettings.methods.frequencyAnalysis)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="frequencyAnalysis" className="ml-2 block text-gray-700">
                    Analisi della Frequenza
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="proximityAnalysis"
                    checked={localSettings.methods.proximityAnalysis}
                    onChange={() => handleMethodChange('proximityAnalysis', !localSettings.methods.proximityAnalysis)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="proximityAnalysis" className="ml-2 block text-gray-700">
                    Analisi di Prossimità
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="patternMatching"
                    checked={localSettings.methods.patternMatching}
                    onChange={() => handleMethodChange('patternMatching', !localSettings.methods.patternMatching)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="patternMatching" className="ml-2 block text-gray-700">
                    Riconoscimento di Modelli
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-primary">Metodi Avanzati</h4>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sentimentAnalysis"
                    checked={localSettings.methods.sentimentAnalysis}
                    onChange={() => handleMethodChange('sentimentAnalysis', !localSettings.methods.sentimentAnalysis)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="sentimentAnalysis" className="ml-2 block text-gray-700">
                    Analisi del Sentimento
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="nounPhraseAnalysis"
                    checked={localSettings.methods.nounPhraseAnalysis}
                    onChange={() => handleMethodChange('nounPhraseAnalysis', !localSettings.methods.nounPhraseAnalysis)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="nounPhraseAnalysis" className="ml-2 block text-gray-700">
                    Analisi di Frasi Nominali
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="propagandaTechniqueAnalysis"
                    checked={localSettings.methods.propagandaTechniqueAnalysis}
                    onChange={() => handleMethodChange('propagandaTechniqueAnalysis', !localSettings.methods.propagandaTechniqueAnalysis)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="propagandaTechniqueAnalysis" className="ml-2 block text-gray-700">
                    Tecniche di Propaganda
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="topicCoherenceAnalysis"
                    checked={localSettings.methods.topicCoherenceAnalysis}
                    onChange={() => handleMethodChange('topicCoherenceAnalysis', !localSettings.methods.topicCoherenceAnalysis)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="topicCoherenceAnalysis" className="ml-2 block text-gray-700">
                    Analisi di Coerenza Tematica
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rhetoricalDeviceAnalysis"
                    checked={localSettings.methods.rhetoricalDeviceAnalysis}
                    onChange={() => handleMethodChange('rhetoricalDeviceAnalysis', !localSettings.methods.rhetoricalDeviceAnalysis)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="rhetoricalDeviceAnalysis" className="ml-2 block text-gray-700">
                    Dispositivi Retorici
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Categories Tab Content */}
        {activeTab === 'categories' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Categorie di Indicatori</h3>
            <p className="text-sm text-gray-600 mb-4">
              Seleziona le categorie specifiche di indicatori da cercare nel testo. Deseleziona tutte per un'analisi completa.
            </p>
            <div className="flex items-center justify-between mb-3">
              <div>
                <button
                  onClick={() => handleSelectAllCategories(true)}
                  className="text-sm text-primary hover:text-primary-dark mr-2"
                >
                  Seleziona tutti
                </button>
                <button
                  onClick={() => handleSelectAllCategories(false)}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Deseleziona tutti
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {localSettings.categories.map(category => (
                <div key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={category.enabled}
                    onChange={() => handleCategoryChange(category.id, !category.enabled)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor={`category-${category.id}`} className="ml-2 block text-gray-700 text-sm">
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Thresholds Tab Content */}
        {activeTab === 'thresholds' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Soglie di Analisi</h3>
            <p className="text-sm text-gray-600 mb-4">
              Personalizza le soglie per regolare la sensibilità dell'analisi. Valori più alti offrono risultati più precisi ma meno estesi.
            </p>
            
            <div className="mb-4">
              <label htmlFor="minKeywordStrength" className="block text-sm font-medium text-gray-700 mb-1">
                Forza minima delle parole chiave
              </label>
              <select
                id="minKeywordStrength"
                name="minKeywordStrength"
                value={localSettings.thresholds.minKeywordStrength}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="low">Bassa</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Determina la forza minima che una parola chiave deve avere per essere considerata rilevante.
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="proximityDistance" className="block text-sm font-medium text-gray-700 mb-1">
                Distanza di prossimità: {localSettings.thresholds.proximityDistance} parole
              </label>
              <input
                type="range"
                id="proximityDistance"
                name="proximityDistance"
                min="5"
                max="50"
                step="5"
                value={localSettings.thresholds.proximityDistance}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5</span>
                <span>25</span>
                <span>50</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Imposta la distanza massima tra parole chiave per l'analisi di prossimità.
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="minOccurrences" className="block text-sm font-medium text-gray-700 mb-1">
                Numero minimo di occorrenze: {localSettings.thresholds.minOccurrences}
              </label>
              <input
                type="range"
                id="minOccurrences"
                name="minOccurrences"
                min="1"
                max="10"
                value={localSettings.thresholds.minOccurrences}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Definisce quante volte un indicatore deve comparire per essere significativo.
              </p>
            </div>
          </div>
        )}
        
        {/* Display Tab Content */}
        {activeTab === 'display' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Opzioni di Visualizzazione</h3>
            <p className="text-sm text-gray-600 mb-4">
              Personalizza come i risultati dell'analisi vengono presentati nell'interfaccia.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="displayMode"
                  checked={localSettings.displayMode === 'detailed'}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    displayMode: e.target.checked ? 'detailed' : 'summary'
                  }))}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="displayMode" className="ml-2 block text-gray-700">
                  Visualizzazione dettagliata dei risultati
                </label>
                <p className="ml-6 text-xs text-gray-500">
                  Mostra informazioni dettagliate su ogni corrispondenza trovata
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="highlightMatches"
                  checked={localSettings.highlightMatches ?? true}
                  onChange={(e) => handleDisplayOptionChange("highlightMatches", e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="highlightMatches" className="ml-2 block text-gray-700">
                  Evidenzia le corrispondenze nel testo
                </label>
                <p className="ml-6 text-xs text-gray-500">
                  Evidenzia le parole chiave e gli indicatori trovati nel testo analizzato
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showEvidenceFactors"
                  checked={localSettings.showEvidenceFactors ?? true}
                  onChange={(e) => handleDisplayOptionChange("showEvidenceFactors", e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="showEvidenceFactors" className="ml-2 block text-gray-700">
                  Mostra fattori di evidenza
                </label>
                <p className="ml-6 text-xs text-gray-500">
                  Visualizza i dettagli su come è stata calcolata ogni corrispondenza
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Salva Impostazioni
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;