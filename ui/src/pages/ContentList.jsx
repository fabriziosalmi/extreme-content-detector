import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import apiService from '../services/api';

const getScoreColor = (score) => {
  if (!score && score !== 0) return 'default';
  if (score < 0.3) return 'success';
  if (score < 0.6) return 'warning';
  return 'error';
};

const getScoreText = (score) => {
  if (!score && score !== 0) return 'N/A';
  return `${Math.round(score * 100)}%`;
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ContentList = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const initialCategory = query.get('category') || '';
  
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [websites, setWebsites] = useState([]);
  
  // Filtering and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minScore, setMinScore] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const loadContent = async () => {
    setLoading(true);
    try {
      // Construct filter parameters
      const params = {
        skip: (page - 1) * pageSize,
        limit: pageSize,
        min_score: minScore > 0 ? minScore / 100 : undefined
      };
      
      // Add optional filters
      if (selectedWebsite) {
        // If website is selected, get content for that website
        const data = await apiService.getWebsiteContent(selectedWebsite, params);
        setContent(data);
      } else {
        // Otherwise get all content with optional category filter
        if (selectedCategory) {
          params.category = selectedCategory;
        }
        const data = await apiService.getContentList(params);
        setContent(data);
      }
      
      // Estimate total pages (this is simplified, in a real app we'd get total count from API)
      setTotalPages(Math.max(1, Math.ceil(content.length / pageSize)));
      
      setError(null);
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadWebsites = async () => {
    try {
      const data = await apiService.getWebsites();
      setWebsites(data);
    } catch (err) {
      console.error('Error loading websites:', err);
    }
  };

  useEffect(() => {
    loadContent();
    loadWebsites();
  }, [page, selectedCategory]); // Reload when page or category changes

  const handleSearch = () => {
    setPage(1); // Reset to first page
    loadContent();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedWebsite('');
    setSelectedCategory('');
    setMinScore(0);
    setPage(1);
    loadContent();
  };

  const handleViewContent = (contentId) => {
    navigate(`/content/${contentId}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Extremist Content
        </Typography>
        <Typography color="text.secondary">
          Browse and analyze content from monitored websites
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper elevation={2} sx={{ borderRadius: '12px', p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Content"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Website</InputLabel>
              <Select
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
                label="Website"
              >
                <MenuItem value="">All Websites</MenuItem>
                {websites.map((website) => (
                  <MenuItem key={website.id} value={website.id}>
                    {website.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="racist">Racist Content</MenuItem>
                <MenuItem value="fascist">Fascist Content</MenuItem>
                <MenuItem value="nazi">Nazi Content</MenuItem>
                <MenuItem value="far_right">Far-Right Content</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography gutterBottom>
              Minimum Extremism Score: {minScore}%
            </Typography>
            <Slider
              value={minScore}
              onChange={(e, newValue) => setMinScore(newValue)}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
              step={5}
              marks
              min={0}
              max={100}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSearch}
                startIcon={<SearchIcon />}
              >
                Search
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Content table */}
      <Paper elevation={2} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Content Results</Typography>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />} 
            onClick={loadContent}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
              <TableRow>
                <TableCell>Title/URL</TableCell>
                <TableCell>Website</TableCell>
                <TableCell>Extremism Score</TableCell>
                <TableCell>Categories</TableCell>
                <TableCell>Scraped Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Loading content...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No content found matching the current filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                content.map((item) => (
                  <TableRow 
                    key={item.id} 
                    hover
                    onClick={() => handleViewContent(item.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" noWrap sx={{ maxWidth: 400 }}>
                          {item.title || 'Untitled Content'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 400 }}>
                          {item.url}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {/* In a real app, we'd fetch and display the website name */}
                      Website #{item.website_id}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={<WarningIcon />}
                        label={getScoreText(item.overall_extremism_score)}
                        color={getScoreColor(item.overall_extremism_score)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {item.racist_score > 0.6 && (
                          <Chip label="Racist" size="small" color="error" />
                        )}
                        {item.fascist_score > 0.6 && (
                          <Chip label="Fascist" size="small" color="warning" />
                        )}
                        {item.nazi_score > 0.6 && (
                          <Chip label="Nazi" size="small" color="error" />
                        )}
                        {item.far_right_score > 0.6 && (
                          <Chip label="Far-Right" size="small" color="warning" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {item.scraped_date 
                        ? new Date(item.scraped_date).toLocaleDateString() 
                        : 'Unknown'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange}
            color="primary" 
            disabled={loading}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default ContentList;