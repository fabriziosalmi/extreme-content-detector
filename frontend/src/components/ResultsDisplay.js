import React from 'react';

// Mapping for strength levels to user-friendly display
const strengthLabels = {
  low: { text: 'Bassa', color: 'bg-yellow-100 text-yellow-800' },
  medium: { text: 'Media', color: 'bg-orange-100 text-orange-800' },
  high: { text: 'Alta', color: 'bg-red-100 text-red-800' }
};

const ResultsDisplay = ({ results, displayMode = 'detailed', highlightMatches = true, originalText = '' }) => {
  if (!results || results.total_indicators_found === 0) {
    return (
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 my-6" role="alert">
        <p className="font-bold">Nessun indicatore trovato</p>
        <p>L'analisi non ha rilevato la presenza di indicatori nel testo fornito.</p>
      </div>
    );
  }

  // Text highlighting component (shown when originalText is provided and highlightMatches is true)
  const HighlightedText = () => {
    if (!originalText || !highlightMatches) return null;

    // Get all unique keywords found across all indicators
    const allKeywords = [];
    results.results.forEach(indicator => {
      indicator.found_keywords.forEach(keyword => {
        if (!allKeywords.includes(keyword.text)) {
          allKeywords.push(keyword.text);
        }
      });
    });

    if (allKeywords.length === 0) return null;
    
    // Create a highlighted version of the text
    let highlightedText = originalText;
    allKeywords.forEach(keyword => {
      // Use regex to replace all instances of the keyword with a highlighted version
      // Adding word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, match => 
        `<span class="bg-yellow-200 px-0.5 rounded">${match}</span>`
      );
    });

    return (
      <div className="mt-8 mb-6">
        <h3 className="text-xl font-bold mb-3">Testo Analizzato con Evidenziazione</h3>
        <div className="border border-gray-200 rounded-lg p-4 bg-white overflow-auto max-h-96">
          <p dangerouslySetInnerHTML={{ __html: highlightedText }} />
        </div>
      </div>
    );
  };

  // Render a summary view (only category level information)
  const SummaryView = () => (
    <div className="space-y-4">
      {results.results.map((indicator, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{indicator.indicator_name}</h3>
            <p className="text-gray-600 text-sm">{indicator.indicator_description}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${strengthLabels[indicator.overall_strength].color}`}>
            {strengthLabels[indicator.overall_strength].text}
          </span>
        </div>
      ))}
    </div>
  );

  // Render a compact view (only the most relevant indicators)
  const CompactView = () => {
    // Sort by strength and take only medium and high strength indicators
    const relevantIndicators = [...results.results]
      .filter(indicator => indicator.overall_strength !== 'low')
      .sort((a, b) => {
        const strengthRank = { high: 3, medium: 2, low: 1 };
        return strengthRank[b.overall_strength] - strengthRank[a.overall_strength];
      });

    if (relevantIndicators.length === 0) {
      return (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 my-6" role="alert">
          <p className="font-bold">Nessun indicatore rilevante</p>
          <p>Sono stati trovati solo indicatori di bassa rilevanza. Cambia le impostazioni per visualizzarli.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {relevantIndicators.map((indicator, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-800">{indicator.indicator_name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${strengthLabels[indicator.overall_strength].color}`}>
                Rilevanza: {strengthLabels[indicator.overall_strength].text}
              </span>
            </div>
            
            <p className="text-gray-600 mb-3">{indicator.indicator_description}</p>
            
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Parole chiave principali:</h4>
              <div className="flex flex-wrap gap-2">
                {indicator.found_keywords
                  .filter(kw => kw.strength !== 'low')
                  .slice(0, 5)
                  .map((keyword, kidx) => (
                    <span 
                      key={kidx}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${strengthLabels[keyword.strength].color}`}
                    >
                      {keyword.text}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render the detailed view (full information about all indicators)
  const DetailedView = () => (
    <div className="space-y-6">
      {results.results.map((indicator, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-800">{indicator.indicator_name}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${strengthLabels[indicator.overall_strength].color}`}>
              Rilevanza: {strengthLabels[indicator.overall_strength].text}
            </span>
          </div>
          
          <p className="text-gray-600 mb-3">{indicator.indicator_description}</p>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Parole chiave trovate:</h4>
            <div className="flex flex-wrap gap-2">
              {indicator.found_keywords.map((keyword, kidx) => (
                <span 
                  key={kidx}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${strengthLabels[keyword.strength].color}`}
                >
                  {keyword.text}
                </span>
              ))}
            </div>
          </div>
          
          {indicator.context && indicator.context.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Esempi nel contesto:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {indicator.context.map((ctx, ctxIdx) => (
                  <li key={ctxIdx} className="italic">
                    <span dangerouslySetInnerHTML={{ 
                      __html: ctx.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-red-600">$1</span>') 
                    }} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {indicator.proximity_matches && indicator.proximity_matches.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2">Relazioni di prossimità:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {indicator.proximity_matches.map((match, matchIdx) => (
                  <li key={matchIdx}>
                    <span className="font-medium">{match.keyword1}</span> vicino a <span className="font-medium">{match.keyword2}</span> 
                    <span className="text-sm text-gray-500"> (distanza: {match.distance} parole)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {indicator.frequency_data && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2">Analisi di frequenza:</h4>
              <p className="text-gray-600">
                Densità: {indicator.frequency_data.density.toFixed(2)}% del testo 
                (ripetuto {indicator.frequency_data.total_occurrences} volte)
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Risultati dell'Analisi</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <p className="font-medium">
          Trovati <span className="font-bold">{results.total_indicators_found}</span> tipi di indicatori nel testo.
        </p>
        {results.analysis_methods && (
          <div className="mt-2 text-sm text-gray-600">
            <p>Metodi utilizzati: {Object.keys(results.analysis_methods)
              .filter(method => results.analysis_methods[method])
              .join(', ')}
            </p>
          </div>
        )}
      </div>
      
      {highlightMatches && <HighlightedText />}
      
      {displayMode === 'summary' && <SummaryView />}
      {displayMode === 'compact' && <CompactView />}
      {displayMode === 'detailed' && <DetailedView />}
    </div>
  );
};

export default ResultsDisplay;