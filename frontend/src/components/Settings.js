import React, { useState, useEffect } from 'react';

const Settings = ({ settings, updateSettings }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    // Save to localStorage as well
    localStorage.setItem('antifaModelSettings', JSON.stringify(localSettings));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Impostazioni di Analisi</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Metodi di Analisi</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableKeywordMatching"
              name="enableKeywordMatching"
              checked={localSettings.enableKeywordMatching}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="enableKeywordMatching" className="ml-2 block text-gray-700">
              Corrispondenza di parole chiave (base)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableContextAnalysis"
              name="enableContextAnalysis"
              checked={localSettings.enableContextAnalysis}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="enableContextAnalysis" className="ml-2 block text-gray-700">
              Analisi contestuale (frasi circostanti)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableFrequencyAnalysis"
              name="enableFrequencyAnalysis"
              checked={localSettings.enableFrequencyAnalysis}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="enableFrequencyAnalysis" className="ml-2 block text-gray-700">
              Analisi di frequenza (ripetizione di indicatori)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableProximityAnalysis"
              name="enableProximityAnalysis"
              checked={localSettings.enableProximityAnalysis}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="enableProximityAnalysis" className="ml-2 block text-gray-700">
              Analisi di prossimità (indicatori vicini)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enablePatternMatching"
              name="enablePatternMatching"
              checked={localSettings.enablePatternMatching}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="enablePatternMatching" className="ml-2 block text-gray-700">
              Corrispondenza di schemi (regex)
            </label>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Soglie di Rilevanza</h3>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="minKeywordStrength" className="block text-sm font-medium text-gray-700 mb-1">
              Forza minima parola chiave: {localSettings.thresholds.minKeywordStrength}
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
            <p className="mt-1 text-sm text-gray-500">
              Determina la forza minima delle parole chiave da considerare nell'analisi.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numero minimo di occorrenze: {localSettings.thresholds.minOccurrences}
            </label>
            <input
              type="range"
              name="minOccurrences"
              min="1"
              max="10"
              value={localSettings.thresholds.minOccurrences}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Quante volte un indicatore deve apparire per essere rilevante.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distanza massima di prossimità: {localSettings.thresholds.proximityDistance} parole
            </label>
            <input
              type="range"
              name="proximityDistance"
              min="5"
              max="50"
              step="5"
              value={localSettings.thresholds.proximityDistance}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>5</span>
              <span>25</span>
              <span>50</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Distanza massima tra indicatori per l'analisi di prossimità.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Categorie da Analizzare</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {localSettings.categories.map(category => (
            <div key={category.id} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${category.id}`}
                name={`category-${category.id}`}
                checked={category.enabled}
                onChange={() => {
                  setLocalSettings(prev => ({
                    ...prev,
                    categories: prev.categories.map(cat => 
                      cat.id === category.id ? {...cat, enabled: !cat.enabled} : cat
                    )
                  }));
                }}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor={`category-${category.id}`} className="ml-2 block text-sm text-gray-700">
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Modalità di Visualizzazione</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modalità di visualizzazione risultati
            </label>
            <select
              name="displayMode"
              value={localSettings.displayMode}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="detailed">Dettagliata (mostra tutti gli indicatori)</option>
              <option value="summary">Riassuntiva (solo categorie)</option>
              <option value="compact">Compatta (solo elementi più rilevanti)</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="highlightMatches"
              name="highlightMatches"
              checked={localSettings.highlightMatches}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="highlightMatches" className="ml-2 block text-gray-700">
              Evidenzia corrispondenze nel testo originale
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Salva Impostazioni
        </button>
      </div>
    </div>
  );
};

export default Settings;