import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const API_URL = 'http://localhost:8000';
        
        // Fetch both stats and trends simultaneously
        const [statsResponse, trendsResponse] = await Promise.all([
          axios.get(`${API_URL}/stats`),
          axios.get(`${API_URL}/trends`)
        ]);
        
        setStats(statsResponse.data);
        setTrends(trendsResponse.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setError('Impossibile caricare le statistiche. Assicurati che il backend sia in esecuzione.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Configure charts based on the data
  const getChartData = () => {
    // If data is not loaded yet, return empty objects
    if (!stats || !trends) {
      return { 
        indicatorsPie: { labels: [], datasets: [] }, 
        trendsChart: { labels: [], datasets: [] }, 
        strengthPie: { labels: [], datasets: [] },
        methodEffectiveness: { labels: [], datasets: [] }
      };
    }
    
    // Prepare indicators pie chart data
    const indicatorIds = Object.keys(stats.indicators_found);
    const indicatorCounts = Object.values(stats.indicators_found);
    
    // Get top keywords for word cloud
    const keywordData = Object.entries(stats.top_keywords)
      .map(([keyword, data]) => ({ 
        text: keyword, 
        value: data.count, 
        strength: data.strength 
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);
    
    // Prepare strength distribution pie chart
    const strengthLabels = Object.keys(trends.strength_distribution);
    const strengthCounts = Object.values(trends.strength_distribution);
    
    // Prepare trends over time line chart
    const dateLabels = Object.keys(trends.indicators_over_time).sort();
    const indicatorTrends = dateLabels.map(date => trends.indicators_over_time[date]);
    
    // Prepare method effectiveness bar chart
    const methodLabels = Object.keys(trends.method_effectiveness);
    const methodAverages = methodLabels.map(method => 
      trends.method_effectiveness[method].average || 0
    );
    
    return {
      indicatorsPie: {
        labels: indicatorIds,
        datasets: [
          {
            label: 'Indicatori Rilevati',
            data: indicatorCounts,
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
              '#FF9F40', '#8AC926', '#FF595E', '#6A4C93', '#1982C4'
            ],
            borderWidth: 1
          }
        ]
      },
      strengthPie: {
        labels: strengthLabels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
        datasets: [
          {
            label: 'Livelli di Rilevanza',
            data: strengthCounts,
            backgroundColor: [
              '#FFCE56', // low - yellow
              '#FF9F40', // medium - orange
              '#FF6384'  // high - red
            ],
            borderWidth: 1
          }
        ]
      },
      trendsChart: {
        labels: dateLabels,
        datasets: [
          {
            label: 'Indicatori Trovati nel Tempo',
            data: indicatorTrends,
            borderColor: '#36A2EB',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      methodEffectiveness: {
        labels: methodLabels.map(method => {
          // Convert camelCase to readable format
          return method
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
        }),
        datasets: [
          {
            label: 'Indicatori Medi Trovati per Metodo',
            data: methodAverages,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      },
      keywordData
    };
  };

  const chartData = getChartData();

  // Chart options
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        font: {
          size: 16
        }
      }
    }
  };
  
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        font: {
          size: 16
        }
      }
    }
  };

  // Keyword "cloud" (not a real cloud but a grid of keywords)
  const KeywordDisplay = ({ keywordData }) => {
    if (!keywordData || keywordData.length === 0) return null;
    
    const strengthColors = {
      low: 'bg-yellow-100 text-yellow-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    };
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Parole Chiave Più Frequenti</h3>
        <div className="flex flex-wrap gap-2">
          {keywordData.map((keyword, index) => (
            <div 
              key={index}
              className={`px-3 py-1 rounded-full text-sm font-medium ${strengthColors[keyword.strength]} 
                          flex items-center`}
              style={{ opacity: 0.7 + (keyword.value / Math.max(...keywordData.map(k => k.value)) * 0.3) }}
            >
              {keyword.text}
              <span className="ml-2 bg-white bg-opacity-50 rounded-full px-1.5 py-0.5 text-xs">
                {keyword.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // General Statistics Tab
  const GeneralStatsTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <p className="font-medium text-lg">
          Totale Analisi Effettuate: <span className="font-bold">{stats?.total_analyses || 0}</span>
        </p>
        <div className="mt-2 text-sm text-gray-600">
          <p>Testi Analizzati: {stats?.source_types?.text || 0}</p>
          <p>URL Analizzati: {stats?.source_types?.url || 0}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Distribuzione Indicatori</h3>
          <div className="h-64">
            <Pie data={chartData.indicatorsPie} options={{...pieOptions, plugins: {...pieOptions.plugins, title: {...pieOptions.plugins.title, text: 'Tipi di Indicatori Rilevati'}}}} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Distribuzione Rilevanza</h3>
          <div className="h-64">
            <Pie data={chartData.strengthPie} options={{...pieOptions, plugins: {...pieOptions.plugins, title: {...pieOptions.plugins.title, text: 'Distribuzione Livelli di Rilevanza'}}}} />
          </div>
        </div>
      </div>
      
      <KeywordDisplay keywordData={chartData.keywordData} />
    </div>
  );

  // Trends Tab
  const TrendsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Indicatori nel Tempo</h3>
        <div className="h-64">
          <Line data={chartData.trendsChart} options={{...lineOptions, plugins: {...lineOptions.plugins, title: {...lineOptions.plugins.title, text: 'Andamento Indicatori Rilevati'}}}} />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Efficacia dei Metodi di Analisi</h3>
        <div className="h-64">
          <Bar data={chartData.methodEffectiveness} options={{...barOptions, plugins: {...barOptions.plugins, title: {...barOptions.plugins.title, text: 'Indicatori Medi per Metodo di Analisi'}}}} />
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Caricamento...
          </span>
        </div>
        <p className="ml-2 text-gray-700">Caricamento statistiche...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-6" role="alert">
        <p className="font-bold">Errore</p>
        <p>{error}</p>
      </div>
    );
  }
  
  // If no data available yet
  if (!stats || !trends || stats.total_analyses === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 my-6" role="alert">
        <p className="font-bold">Nessun dato disponibile</p>
        <p>Non sono state ancora effettuate analisi. Prova ad analizzare un testo o un URL per generare statistiche.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Statistiche e Tendenze</h2>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'general'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Statistiche Generali
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'trends'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Tendenze
        </button>
      </div>
      
      {/* Tab content */}
      {activeTab === 'general' ? <GeneralStatsTab /> : <TrendsTab />}
    </div>
  );
};

export default Statistics;