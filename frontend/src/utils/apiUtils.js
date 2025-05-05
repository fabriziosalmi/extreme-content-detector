/**
 * Utility functions for handling API requests and responses
 */

/**
 * Makes an API request to analyze text or a URL
 * @param {Object} data - The data to send to the API
 * @param {Function} onComplete - Callback function when analysis is complete
 * @param {Function} onError - Callback function when an error occurs
 */
export const analyzeContent = async (data, onComplete, onError) => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error analyzing content');
    }

    const results = await response.json();
    
    // Check if onComplete is a function before calling it
    if (typeof onComplete === 'function') {
      onComplete(results);
    } else {
      console.error('onAnalysisComplete is not a function. Received:', onComplete);
    }
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Check if onError is a function before calling it
    if (typeof onError === 'function') {
      onError(error.message);
    } else {
      console.error('Error callback is not a function');
    }
  }
};

/**
 * Fetches indicators from the API
 * @param {Function} onSuccess - Callback function on successful fetch
 * @param {Function} onError - Callback function when an error occurs
 */
export const fetchIndicators = async (onSuccess, onError) => {
  try {
    const response = await fetch('/api/indicators');
    
    if (!response.ok) {
      throw new Error('Failed to fetch indicators');
    }
    
    const data = await response.json();
    
    if (typeof onSuccess === 'function') {
      onSuccess(data.indicators);
    }
  } catch (error) {
    console.error('Error fetching indicators:', error);
    
    if (typeof onError === 'function') {
      onError(error.message);
    }
  }
};

/**
 * Fetches statistics from the API
 * @param {Function} onSuccess - Callback function on successful fetch
 * @param {Function} onError - Callback function when an error occurs
 */
export const fetchStats = async (onSuccess, onError) => {
  try {
    const response = await fetch('/api/stats');
    
    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }
    
    const data = await response.json();
    
    if (typeof onSuccess === 'function') {
      onSuccess(data);
    }
  } catch (error) {
    console.error('Error fetching statistics:', error);
    
    if (typeof onError === 'function') {
      onError(error.message);
    }
  }
};
