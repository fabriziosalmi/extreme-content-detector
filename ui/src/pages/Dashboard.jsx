import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import apiService from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ title, value, description, color, loading }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      height: '100%',
      borderTop: `4px solid ${color}`,
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <Typography variant="h6" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress size={40} />
      </Box>
    ) : (
      <Typography variant="h3" component="div" sx={{ mb: 1, color: color }}>
        {value}
      </Typography>
    )}
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Paper>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState([]);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsData = await apiService.getStats();
      setStats(statsData);
      
      // Get some recent content
      const contentData = await apiService.getContentList({ limit: 10 });
      setContent(contentData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRunScraper = async () => {
    try {
      const response = await apiService.runScraper();
      setNotification({
        open: true,
        message: 'Scraper started successfully!',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to start scraper.',
        severity: 'error'
      });
    }
  };

  const handleRunAnalyzer = async () => {
    try {
      const response = await apiService.runAnalyzer();
      setNotification({
        open: true,
        message: 'Content analyzer started successfully!',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to start content analyzer.',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Prepare chart data
  const categoryData = {
    labels: ['Racist', 'Fascist', 'Nazi', 'Far-Right'],
    datasets: [
      {
        label: 'Content by Category',
        data: content.reduce((counts, item) => {
          if (item.racist_score > 0.6) counts[0]++;
          if (item.fascist_score > 0.6) counts[1]++;
          if (item.nazi_score > 0.6) counts[2]++;
          if (item.far_right_score > 0.6) counts[3]++;
          return counts;
        }, [0, 0, 0, 0]),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Monitor and analyze extremist content across the web
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Statistics cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monitored Websites"
            value={stats?.total_websites || 0}
            description="Total websites being tracked"
            color="#e91e63"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Content Items"
            value={stats?.total_content || 0}
            description="Total content items scraped"
            color="#2196f3"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Analyzed Content"
            value={stats?.total_analyzed || 0}
            description="Content with completed analysis"
            color="#ff9800"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. Extremism Score"
            value={stats?.average_extremism_score ? 
              `${(stats.average_extremism_score * 100).toFixed(1)}%` : 
              'N/A'
            }
            description="Average extremism score across all content"
            color="#f44336"
            loading={loading}
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3,
              borderRadius: '12px',
              height: '100%'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Content Analysis by Category
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Bar 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                  data={categoryData}
                />
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3,
              borderRadius: '12px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleRunScraper}
                disabled={loading}
              >
                Run Website Scraper
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleRunAnalyzer}
                disabled={loading}
              >
                Run Content Analyzer
              </Button>
              <Button 
                variant="outlined" 
                onClick={loadDashboardData}
                disabled={loading}
              >
                Refresh Dashboard
              </Button>
            </Box>
            <Box sx={{ flexGrow: 1, mt: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Last Updated:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.last_update ? new Date(stats.last_update).toLocaleString() : 'Never'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;