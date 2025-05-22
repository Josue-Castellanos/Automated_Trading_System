// DiamondShape.jsx
import React from 'react';
import { Box } from '@mui/material';

export const DiamondShape = ({ phase }) => {
  return (
    <Box sx={{
      position: 'relative',
      width: 200,
      height: 200,
      transform: 'rotate(45deg)',
      border: '2px solid #2B2B43',
      mb: 3
    }}>
      {/* Main diamond shape */}
      <Box sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        border: `4px solid ${phase.color}`,
        opacity: 0.7
      }} />
      
      {/* Phase labels */}
      <Box sx={{
        position: 'absolute',
        top: -30,
        left: '50%',
        transform: 'translateX(-50%) rotate(-45deg)',
        color: phase.name === 'Bullish' ? phase.color : 'white',
        fontWeight: phase.name === 'Bullish' ? 'bold' : 'normal'
      }}>
        Bullish
      </Box>
      
      <Box sx={{
        position: 'absolute',
        right: -40,
        top: '50%',
        transform: 'translateY(-50%) rotate(-45deg)',
        color: phase.name === 'Accumulation' ? phase.color : 'white',
        fontWeight: phase.name === 'Accumulation' ? 'bold' : 'normal'
      }}>
        Accumulation
      </Box>
      
      <Box sx={{
        position: 'absolute',
        bottom: -30,
        left: '50%',
        transform: 'translateX(-50%) rotate(-45deg)',
        color: phase.name === 'Bearish' ? phase.color : 'white',
        fontWeight: phase.name === 'Bearish' ? 'bold' : 'normal'
      }}>
        Bearish
      </Box>
      
      <Box sx={{
        position: 'absolute',
        left: -40,
        top: '50%',
        transform: 'translateY(-50%) rotate(-45deg)',
        color: phase.name === 'Distribution' ? phase.color : 'white',
        fontWeight: phase.name === 'Distribution' ? 'bold' : 'normal'
      }}>
        Distribution
      </Box>
      
      {/* Current phase highlight */}
      <Box sx={{
        position: 'absolute',
        width: 60,
        height: 60,
        backgroundColor: phase.color,
        opacity: 0.3,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        borderRadius: 1
      }} />
    </Box>
  );
};

export default DiamondShape;