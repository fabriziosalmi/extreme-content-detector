import React from 'react';
import { Box, Typography, Chip, LinearProgress } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

// Helper functions for score formatting
export const getScoreColor = (score) => {
  if (!score && score !== 0) return 'default';
  if (score < 0.3) return 'success';
  if (score < 0.6) return 'warning';
  return 'error';
};

export const getScoreText = (score) => {
  if (!score && score !== 0) return 'N/A';
  return `${Math.round(score * 100)}%`;
};

export const getScoreSeverity = (score) => {
  if (!score) return { level: 'Low', color: 'success' };
  if (score > 0.7) return { level: 'Critical', color: 'error' };
  if (score > 0.4) return { level: 'Moderate', color: 'warning' };
  return { level: 'Low', color: 'success' };
};

// Linear progress bar that shows a score
export const ScoreBar = ({ value, label, color }) => {
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

// Chip that shows the severity level
export const SeverityChip = ({ score }) => {
  const { level, color } = getScoreSeverity(score);
  
  return (
    <Chip 
      icon={<WarningIcon />}
      label={`${level} Concern`}
      color={color}
      sx={{ mr: 1 }}
    />
  );
};

export default {
  ScoreBar,
  SeverityChip,
  getScoreColor,
  getScoreText,
  getScoreSeverity
};