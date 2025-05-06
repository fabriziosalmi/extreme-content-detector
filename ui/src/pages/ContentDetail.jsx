import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningIcon from '@mui/icons-material/Warning';
import LanguageIcon from '@mui/icons-material/Language';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import apiService from '../services/api';

const ScoreBar = ({ value, label, color }) => {
  const scoreValue = value || 0;
  const percentage = Math.round(scoreValue * 100);
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight="bold">
          {percentage}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{ 
          height: 10, 
          borderRadius: 5,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: 5
          }
        }}
      />
    </Box>
  );
};

const ContentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const contentData = await apiService.getContentDetail(id);
        setContent(contentData);
        
        // Also load website info
        if (contentData.website_id) {
          try {
            const websiteData = await apiService.getWebsite(contentData.website_id);
            setWebsite(websiteData);
          } catch (websiteErr) {
            console.error('Error loading website details:', websiteErr);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading content details:', err);
        setError('Failed to load content details. The content may not exist or has been removed.');
      } finally {
        setLoading(false);
      }
    };
    
    loadContent();
  }, [id]);

  const goBack = () => {
    navigate(-1);
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading content...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={goBack} 
          sx={{ mb: 3 }}
        >
          Back to Content List
        </Button>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!content) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={goBack} 
          sx={{ mb: 3 }}
        >
          Back to Content List
        </Button>
        <Alert severity="warning">
          Content not found.
        </Alert>
      </Container>
    );
  }

  // Calculate overall severity level based on the overall_extremism_score
  let severityLevel = 'Low';
  let severityColor = 'success';
  
  if (content.overall_extremism_score > 0.7) {
    severityLevel = 'Critical';
    severityColor = 'error';
  } else if (content.overall_extremism_score > 0.4) {
    severityLevel = 'Moderate';
    severityColor = 'warning';
  }

  return (
    <Container maxWidth="xl">
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={goBack} 
        sx={{ mb: 3 }}
      >
        Back to Content List
      </Button>
      
      <Grid container spacing={3}>
        {/* Content info */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" gutterBottom>
                {content.title || 'Untitled Content'}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LanguageIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" component="a" href={content.url} target="_blank" rel="noopener noreferrer">
                  {content.url}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Scraped on {getFormattedDate(content.scraped_date)}
                </Typography>
              </Box>
              
              {website && (
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={`Source: ${website.name}`} 
                    size="small" 
                    variant="outlined"
                  />
                  {website.category && (
                    <Chip 
                      label={website.category} 
                      size="small" 
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Content Analysis
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Chip 
                icon={<WarningIcon />}
                label={`${severityLevel} Concern`}
                color={severityColor}
                sx={{ mr: 1 }}
              />
              <Typography variant="body1">
                Overall Extremism Score: <strong>{Math.round(content.overall_extremism_score * 100)}%</strong>
              </Typography>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Content Text
            </Typography>
            
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                maxHeight: '400px', 
                overflow: 'auto',
                backgroundColor: 'rgba(0,0,0,0.05)',
                whiteSpace: 'pre-wrap'
              }}
            >
              <Typography variant="body2">
                {content.content_text || 'No text content available.'}
              </Typography>
            </Paper>
          </Paper>
        </Grid>
        
        {/* Score breakdown */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Extremism Score Breakdown
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <ScoreBar 
                value={content.overall_extremism_score} 
                label="Overall Extremism" 
                color="#e91e63" 
              />
              <ScoreBar 
                value={content.racist_score} 
                label="Racist Content" 
                color="#f44336" 
              />
              <ScoreBar 
                value={content.fascist_score} 
                label="Fascist Content" 
                color="#ff9800" 
              />
              <ScoreBar 
                value={content.nazi_score} 
                label="Nazi Content" 
                color="#e91e63" 
              />
              <ScoreBar 
                value={content.far_right_score} 
                label="Far-Right Content" 
                color="#ff9800" 
              />
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Alert severity={severityColor}>
                <Typography variant="subtitle2">
                  {severityLevel} Level of Extremist Content
                </Typography>
                <Typography variant="body2">
                  {severityLevel === 'Critical' && 'This content contains highly concerning extremist material.'}
                  {severityLevel === 'Moderate' && 'This content contains potentially concerning extremist material.'}
                  {severityLevel === 'Low' && 'This content contains minimal extremist indicators.'}
                </Typography>
              </Alert>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContentDetail;