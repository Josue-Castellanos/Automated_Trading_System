// TrendAdvisor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { Box, Typography, Select, MenuItem, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import { Diamond } from './Diamond';
import { PhaseInfo } from './PhaseInfo';
import axios from 'axios';

const TrendAdvisor = () => {
  const [ticker, setTicker] = useState('SPY');
  const [period, setPeriod] = useState('1mo');
  const [phase, setPhase] = useState(null);
  const [priceData, setPriceData] = useState([]);
  const [indicators, setIndicators] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const sma50SeriesRef = useRef();
  const sma200SeriesRef = useRef();

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        backgroundColor: '#1e222d',
        textColor: '#d9d9d9',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const sma50Series = chart.addLineSeries({
      color: '#FFA500',
      lineWidth: 2,
      priceScaleId: 'left',
    });

    const sma200Series = chart.addLineSeries({
      color: '#00BFFF',
      lineWidth: 2,
      priceScaleId: 'left',
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;
    sma50SeriesRef.current = sma50Series;
    sma200SeriesRef.current = sma200Series;

    return () => chart.remove();
  }, []);

  // Fetch data and update chart
  useEffect(() => {
    if (!seriesRef.current) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/market_phase/', {
          params: {
            symbol: ticker,
            periodType: period.includes('mo') ? 'month' : 'year',
            period: period.includes('mo') ? parseInt(period.replace('mo', '')) : parseInt(period.replace('y', '')),
            frequencyType: period.includes('mo') ? 'daily' : 'weekly',
            frequency: 1
          }
        });

        if (response.data.status === 'success') {
          // Update phase
          setPhase(response.data.phase);
          
          // Format price data
          const priceData = response.data.price_data.map(item => ({
            time: new Date(item.datetime).getTime() / 1000,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            // volume: item.volume
          }));
          
          // Format indicator data
          const sma50Data = response.data.indicators.MA_50.map(item => ({
            time: new Date(item.datetime).getTime() / 1000,
            value: item.MA_50
          }));
          
          const sma200Data = response.data.indicators.MA_200.map(item => ({
            time: new Date(item.datetime).getTime() / 1000,
            value: item.MA_200
          }));
          
          // Update chart
          seriesRef.current.setData(priceData);
          sma50SeriesRef.current.setData(sma50Data);
          sma200SeriesRef.current.setData(sma200Data);
          
          // Auto-scale
          chartRef.current.timeScale().fitContent();
          
          // Store data for potential re-use
          setPriceData(priceData);
          setIndicators({
            sma50: sma50Data,
            sma200: sma200Data
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch market data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker, period]);

  return (
    <Box sx={{ p: 3, backgroundColor: '#121826', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
        TrendAdvisor Diamond
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, backgroundColor: '#1e222d' }}>
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <Select
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                sx={{ backgroundColor: '#2a2e39', color: 'white' }}
                disabled={loading}
              >
                <MenuItem value="SPY">SPY</MenuItem>
                <MenuItem value="QQQ">QQQ</MenuItem>
                <MenuItem value="IWM">IWM</MenuItem>
                <MenuItem value="DIA">DIA</MenuItem>
              </Select>
              
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                sx={{ backgroundColor: '#2a2e39', color: 'white' }}
                disabled={loading}
              >
                <MenuItem value="1mo">1 Month</MenuItem>   
                <MenuItem value="3mo">3 Months</MenuItem>   
                <MenuItem value="6mo">6 Months</MenuItem>  
                <MenuItem value="20y">20 Years</MenuItem>  
              </Select>
              
              {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
            </Box>
            
            <div ref={chartContainerRef} style={{ width: '100%', height: 400 }} />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Diamond phase={phase} loading={loading} />
        </Grid>
        
        {phase && (
          <Grid item xs={12}>
            <PhaseInfo phase={phase} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TrendAdvisor;