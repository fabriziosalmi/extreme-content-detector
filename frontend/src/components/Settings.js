import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Settings component for adjusting analysis parameters
 */
const Settings = ({ isOpen, onClose, settings, updateSettings }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localSettings, setLocalSettings] = useState({ ...settings });

  // Load indicators on mount and fetch latest settings
  useEffect(() => {
    // Update local settings when parent settings change
    setLocalSettings({ ...settings });
  }, [settings]);

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
    // Update parent component's settings
    updateSettings(localSettings);
    onClose();
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
        
        <div className="mb-8">
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
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Soglie di Rilevamento</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="minKeywordStrength" className="block text-sm font-medium text-gray-700 mb-1">
                Forza Minima Parole Chiave
              </label>
              <select
                id="minKeywordStrength"
                name="minKeywordStrength"
                value={localSettings.thresholds?.minKeywordStrength || 'low'}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="low">Bassa</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Filtra gli indicatori in base alla loro forza (impatto ideologico).
              </p>
            </div>
            
            <div>
              <label htmlFor="minOccurrences" className="block text-sm font-medium text-gray-700 mb-1">
                Occorrenze Minime: {localSettings.thresholds?.minOccurrences || 1}
              </label>
              <input
                type="range"
                id="minOccurrences"
                name="minOccurrences"
                min="1"
                max="10"
                value={localSettings.thresholds?.minOccurrences || 1}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="mt-1 text-sm text-gray-500">
                Numero minimo di volte che un indicatore deve apparire per essere considerato rilevante.
              </p>
            </div>
            
            <div>
              <label htmlFor="proximityDistance" className="block text-sm font-medium text-gray-700 mb-1">
                Distanza di Prossimità: {localSettings.thresholds?.proximityDistance || 20} parole
              </label>
              <input
                type="range"
                id="proximityDistance"
                name="proximityDistance"
                min="5"
                max="50"
                step="5"
                value={localSettings.thresholds?.proximityDistance || 20}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="mt-1 text-sm text-gray-500">
                Distanza massima tra parole per analizzare il contesto di prossimità.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Metodi di Analisi</h3>
            <div className="space-x-2">
              <button 
                onClick={() => handleSelectAllCategories(true)}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                Seleziona tutti
              </button>
              <button 
                onClick={() => handleSelectAllCategories(false)}
                className="px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
              >
                Deseleziona tutti
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="keywordMatching"
                checked={localSettings.methods?.keywordMatching ?? true}
                disabled={true}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-not-allowed"
              />
              <label htmlFor="keywordMatching" className="ml-2 block text-gray-700">
                Corrispondenza parole chiave (obbligatorio)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="contextAnalysis"
                checked={localSettings.methods?.contextAnalysis ?? false}
                onChange={(e) => handleMethodChange("contextAnalysis", e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="contextAnalysis" className="ml-2 block text-gray-700">
                Analisi contestuale (frasi circostanti)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="frequencyAnalysis"
                checked={localSettings.methods?.frequencyAnalysis ?? false}
                onChange={(e) => handleMethodChange("frequencyAnalysis", e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="frequencyAnalysis" className="ml-2 block text-gray-700">
                Analisi di frequenza (ripetizione di indicatori)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="proximityAnalysis"
                checked={localSettings.methods?.proximityAnalysis ?? false}
                onChange={(e) => handleMethodChange("proximityAnalysis", e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="proximityAnalysis" className="ml-2 block text-gray-700">
                Analisi di prossimità (indicatori vicini)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="patternMatching"
                checked={localSettings.methods?.patternMatching ?? false}
                onChange={(e) => handleMethodChange("patternMatching", e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="patternMatching" className="ml-2 block text-gray-700">
                Corrispondenza di schemi (regex)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sentimentAnalysis"
                checked={localSettings.methods?.sentimentAnalysis ?? false}
                onChange={(e) => handleMethodChange("sentimentAnalysis", e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="sentimentAnalysis" className="ml-2 block text-gray-700">
                Analisi del sentimento (tono emotivo)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="nounPhraseAnalysis"
                checked={localSettings.methods?.nounPhraseAnalysis ?? false}
                onChange={(e) => handleMethodChange("nounPhraseAnalysis", e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="nounPhraseAnalysis" className="ml-2 block text-gray-700">
                Analisi di frasi nominali (pattern ideologici)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="propagandaTechniqueAnalysis"
                checked={localSettings.methods?.propagandaTechniqueAnalysis ?? false}
                onChange={(e) => handleMethodChange("propagandaTechniqueAnalysis", e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="propagandaTechniqueAnalysis" className="ml-2 block text-gray-700">
                Analisi tecniche di propaganda
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="topicCoherenceAnalysis"
                checked={localSettings.methods?.topicCoherenceAnalysis ?? false}
                onChange={(e) => handleMethodChange("topicCoherenceAnalysis", e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="topicCoherenceAnalysis" className="ml-2 block text-gray-700">
                Analisi di coerenza tematica (narrative ideologiche)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rhetoricalDeviceAnalysis"
                checked={localSettings.methods?.rhetoricalDeviceAnalysis ?? false}
                onChange={(e) => handleMethodChange("rhetoricalDeviceAnalysis", e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="rhetoricalDeviceAnalysis" className="ml-2 block text-gray-700">
                Analisi di dispositivi retorici
              </label>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <h4 className="text-md font-semibold text-blue-700">Consiglio di Analisi</h4>
            <p className="text-sm text-blue-600 mt-1">
              Per risultati ottimali, combina almeno 3-4 metodi. I metodi avanzati come l'analisi di coerenza tematica e i dispositivi retorici 
              richiedono più tempo ma offrono risultati più approfonditi.
            </p>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Categorie da Analizzare</h3>
          <p className="text-sm text-gray-600 mb-4">
            Seleziona le categorie di indicatori da includere nell'analisi. Se non selezioni alcuna categoria, verranno analizzate tutte.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localSettings.categories?.map(category => (
              <div key={category.id} className="p-3 border rounded-md hover:border-primary">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={category.enabled}
                    onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor={`category-${category.id}`} className="ml-2 block text-gray-700 font-medium">
                    {category.name}
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500 pl-6">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
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