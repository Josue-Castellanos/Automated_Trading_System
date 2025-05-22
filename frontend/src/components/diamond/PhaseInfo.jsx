// PhaseInfo.jsx
import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Divider,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const PhaseInfo = ({ phase }) => {
  return (
    <Paper sx={{ p: 3, backgroundColor: '#1e222d' }}>
      <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
        {phase.name} Phase Details
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ color: 'white' }}>
          {phase.description}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2, backgroundColor: '#2B2B43' }} />
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Chip 
          label={`Price: $${phase.current_price.toFixed(2)}`} 
          sx={{ backgroundColor: '#2a2e39', color: 'white' }} 
        />
        <Chip 
          label={`50 MA: $${phase.ma_50.toFixed(2)}`} 
          sx={{ backgroundColor: '#2a2e39', color: 'white' }} 
        />
        <Chip 
          label={`200 MA: $${phase.ma_200.toFixed(2)}`} 
          sx={{ backgroundColor: '#2a2e39', color: 'white' }} 
        />
        <Chip 
          label={`50 MA Slope: ${phase.ma_50_slope.toFixed(4)}`} 
          sx={{ backgroundColor: '#2a2e39', color: 'white' }} 
        />
        <Chip 
          label={`200 MA Slope: ${phase.ma_200_slope.toFixed(4)}`} 
          sx={{ backgroundColor: '#2a2e39', color: 'white' }} 
        />
      </Box>
      
      <Accordion sx={{ backgroundColor: '#2a2e39', color: 'white', mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Typography>Options Strategy</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ mb: 1 }}><strong>Strategy:</strong> {phase.options.strategy}</Typography>
          <Typography sx={{ mb: 1 }}><strong>Greeks Focus:</strong> {phase.options.greeks}</Typography>
          <Typography sx={{ mb: 1 }}><strong>Moneyness:</strong> {phase.options.moneyness}</Typography>
          <Typography><strong>Expiry:</strong> {phase.options.expiry}</Typography>
        </AccordionDetails>
      </Accordion>
      
      <Accordion sx={{ backgroundColor: '#2a2e39', color: 'white' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Typography>0DTE Trading Strategies</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ mb: 1 }}><strong>Entry:</strong> {phase.zdte.entries}</Typography>
          <Typography sx={{ mb: 1 }}><strong>Adjustments:</strong> {phase.zdte.adjustments}</Typography>
          <Typography sx={{ mb: 1 }}><strong>Exit:</strong> {phase.zdte.exits}</Typography>
          <Typography sx={{ mb: 1 }}><strong>Strikes:</strong> {phase.zdte.strikes}</Typography>
          <Typography><strong>Timing:</strong> {phase.zdte.timing}</Typography>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default PhaseInfo;