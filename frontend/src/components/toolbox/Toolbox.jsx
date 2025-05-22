import React from 'react';
import { Box, Typography, ButtonGroup, Button } from '@mui/material';
import './Toolbox.css';

const WIDGET_TYPES = [
  { type: 'chart', name: 'Price Chart' },
  // { type: 'news', name: 'News Feed' },
  // { type: 'orderBook', name: 'Order Book' },
  // { type: 'tradingView', name: 'Trading View' },
  // { type: 'screener', name: 'Screener' },
  // { type: 'watchlist', name: 'Watchlist' }
];

export const Toolbox = ({ addWidget, canAdd, canRemove }) => {
  return (
    <Box className="toolbox">
      <Typography variant="h6" gutterBottom>Widgets</Typography>
      <ButtonGroup orientation="vertical" fullWidth>
        {WIDGET_TYPES.map(widget => (
          <Button 
            key={widget.type}
            onClick={() => addWidget(widget.type)}
            disabled={!canAdd}
            sx={{ justifyContent: 'flex-start' }}
          >
            {widget.name}
          </Button>
        ))}
      </ButtonGroup>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Workstations</Typography>
      <ButtonGroup orientation="vertical" fullWidth>
        <Button>Save Current</Button>
        <Button>Load Preset</Button>
      </ButtonGroup>
    </Box>
  );
};