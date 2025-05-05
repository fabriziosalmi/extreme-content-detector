import React, { useState } from 'react';

const AnalysisForm = ({ onAnalyze, setError }) => {
  const [inputType, setInputType] = useState('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (inputType === 'text' && !text.trim()) {
      setError('Inserisci del testo da analizzare.');
      return;
    }
    
    if (inputType === 'url' && !url.trim()) {
      setError('Inserisci un URL valido da analizzare.');
      return;
    }
    
    // Call the parent's onAnalyze method with the current text or URL
    onAnalyze(
      inputType === 'text' ? text : '',
      inputType === 'url' ? url : ''
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Analisi Testo o URL</h2>
      
      <div className="mb-4">
        <div className="flex items-center space-x-4">
          <div>
            <input
              type="radio"
              id="text-option"
              name="input-type"
              value="text"
              checked={inputType === 'text'}
              onChange={() => setInputType('text')}
              className="mr-2"
            />
            <label htmlFor="text-option" className="text-gray-700">Testo</label>
          </div>
          
          <div>
            <input
              type="radio"
              id="url-option"
              name="input-type"
              value="url"
              checked={inputType === 'url'}
              onChange={() => setInputType('url')}
              className="mr-2"
            />
            <label htmlFor="url-option" className="text-gray-700">URL</label>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {inputType === 'text' ? (
          <div className="mb-4">
            <label 
              htmlFor="text-input" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Inserisci il testo da analizzare:
            </label>
            <textarea
              id="text-input"
              rows="8"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Inserisci qui il testo da analizzare..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        ) : (
          <div className="mb-4">
            <label
              htmlFor="url-input"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Inserisci l'URL da analizzare:
            </label>
            <input
              type="url"
              id="url-input"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-white font-bold py-2 px-4 rounded hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition"
          >
            Analizza
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnalysisForm;