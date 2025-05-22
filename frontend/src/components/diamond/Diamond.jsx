// Diamond.jsx
import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { DiamondShape } from './DiamondShape';

export const Diamond = ({ phase, loading }) => {
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 300 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!phase) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 300,
        backgroundColor: '#1e222d',
        borderRadius: 2
      }}>
        <Typography color="textSecondary">No phase data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      backgroundColor: '#1e222d',
      borderRadius: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 2 }}>
        {phase.name} Phase
      </Typography>
      
      <DiamondShape phase={phase} />
      
      <Typography variant="body2" sx={{ color: 'white', mt: 2, textAlign: 'center' }}>
        {phase.description}
      </Typography>
      
      {phase.sub_steps && phase.current_step !== undefined && (
        <Typography variant="body2" sx={{ 
          color: phase.color, 
          mt: 2,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Step {phase.current_step + 1}: {phase.sub_steps[phase.current_step]}
        </Typography>
      )}
    </Box>
  );
};

export default Diamond;