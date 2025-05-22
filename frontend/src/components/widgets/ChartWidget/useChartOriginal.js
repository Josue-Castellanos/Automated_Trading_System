import { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import axios from 'axios';

const getIndicatorColor = (indicatorName, indicatorSettings) => {
  const indicator = indicatorSettings.find(i => i.label === indicatorName);
  return indicator ? indicator.settings.color : '#FFFFFF';
};

export const useChart = (containerRef, symbol, timeSettings, indicatorSettings, activeIndicators) => {
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const indicatorSeriesRef = useRef({});
  const indicatorDataRef = useRef({}); // Store indicator data
  
  // Trend line refs
  const lineSeriesRef = useRef(null);
  const startPointRef = useRef(null);
  const isUpdatingLineRef = useRef(false);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartPointRef = useRef(null);
  const dragStartLineDataRef = useRef(null);
  const lastCrosshairPositionRef = useRef(null);
  const selectedPointRef = useRef(null);
  const hoverThresholdRef = useRef(0.01);
  const klinesRef = useRef(null);
  const xspanRef = useRef(null);

  const fetchPriceHistory = async (symbol, settings, indicators) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/price_history/`, {
        params: {
          symbol: symbol,
          ...settings,
          indicators: indicators ? JSON.stringify(indicators) : null,
        }
      });

      if (response.data.status === 'success') {
        const priceData = response.data.price_data.map(item => ({
          time: (item.time / 1000) - (4 * 60 * 60), // Subtract 4 hours
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
        }));
        
        const indicatorData = response.data.indicators;
        
        // Store klines for trend line calculations
        klinesRef.current = priceData;
        if (priceData.length > 2) {
          xspanRef.current = priceData[2].time - priceData[1].time;
        }
        
        return { priceData, indicatorData };
      }
      throw new Error(response.data.message || 'Failed to fetch price history');
    } catch (err) {
      setError(err.message);
      return { priceData: [], indicatorData: {} };
    } finally {
      setIsLoading(false);
    }
  };

  // Trend line functions
  const handleLineDrawing = (xTs, yPrice) => {
    if (!startPointRef.current) {
      startPointRef.current = { time: xTs, price: yPrice };
    } else {
      lineSeriesRef.current?.setData([
        { time: startPointRef.current.time, value: startPointRef.current.price },
        { time: xTs, value: yPrice },
      ]);
      startPointRef.current = null;
      selectedPointRef.current = null;
    }
  };

  const isLineHovered = (xTs, yPrice, point1, point2) => {
    // Check if point is selected
    if (isDraggingRef.current) return true;
    
    if (!point1 || !point2) return false;
    
    const isPoint1 =
      xTs === point1.time &&
      (Math.abs(yPrice - point1.value) * 100) / yPrice < hoverThresholdRef.current;
    
    if (isPoint1) {
      selectedPointRef.current = 0;
      return true;
    }
    
    const isPoint2 =
      xTs === point2.time &&
      (Math.abs(yPrice - point2.value) * 100) / yPrice < hoverThresholdRef.current;
    
    if (isPoint2) {
      selectedPointRef.current = 1;
      return true;
    }

    selectedPointRef.current = null;
    const m = (point2.value - point1.value) / (point2.time - point1.time);
    const c = point1.value - m * point1.time;
    const estimatedY = m * xTs + c;
    return (Math.abs(yPrice - estimatedY) * 100) / yPrice < hoverThresholdRef.current;
  };

  const handleHoverEffect = (xTs, yPrice) => {
    if (!lineSeriesRef.current) return;
    
    const lineData = lineSeriesRef.current;
    if (!lineData || lineData.length < 2) return;

    const hoverStatus = isLineHovered(
      xTs,
      yPrice,
      lineData[0],
      lineData[1]
    );
    
    if (hoverStatus && !isHoveredRef.current) {
      startHover();
    }

    if (!hoverStatus && isHoveredRef.current && !isDraggingRef.current) {
      endHover();
    }
  };

  const startHover = () => {
    isHoveredRef.current = true;
    lineSeriesRef.current?.applyOptions({ color: "orange" });
    containerRef.current.style.cursor = "pointer";
    chartRef.current?.applyOptions({ handleScroll: false, handleScale: false });
  };

  const endHover = () => {
    isHoveredRef.current = false;
    lineSeriesRef.current?.applyOptions({ color: "dodgerblue" });
    containerRef.current.style.cursor = "default";
    chartRef.current?.applyOptions({ handleScroll: true, handleScale: true });
  };

  const startDrag = (xTs, yPrice) => {
    isDraggingRef.current = true;
    dragStartPointRef.current = { x: xTs, y: yPrice };
    dragStartLineDataRef.current = lineSeriesRef.current?.getData();
  };

  const endDrag = () => {
    isDraggingRef.current = false;
    dragStartPointRef.current = null;
    dragStartLineDataRef.current = null;
    selectedPointRef.current = null;
  };

  const updateLine = (xTs, yPrice) => {
    isUpdatingLineRef.current = true;
    lineSeriesRef.current?.setData([
      { time: startPointRef.current.time, value: startPointRef.current.price },
      { time: xTs, value: yPrice },
    ]);
    selectedPointRef.current = null;
    isUpdatingLineRef.current = false;
  };

  const dragLine = (newCords) => {
    isUpdatingLineRef.current = true;
    lineSeriesRef.current?.setData(newCords);
    isUpdatingLineRef.current = false;
  };

  const handleChartClick = (param) => {
    if (isUpdatingLineRef.current || isDraggingRef.current) return;
    
    const xTs = param.time
      ? param.time
      : (klinesRef.current && klinesRef.current.length > 0 && xspanRef.current) 
        ? klinesRef.current[0].time + param.logical * xspanRef.current
        : param.logical;
    
    const yPrice = candleSeriesRef.current.coordinateToPrice(param.point.y);
    
    isHoveredRef.current
      ? startDrag(xTs, yPrice)
      : handleLineDrawing(xTs, yPrice);
  };

  const handleCrosshairMove = (param) => {
    if (!param.point || isUpdatingLineRef.current) return;
    
    const xTs = param.time
      ? param.time
      : (klinesRef.current && klinesRef.current.length > 0 && xspanRef.current)
        ? klinesRef.current[0].time + param.logical * xspanRef.current
        : param.logical;
    
    const yPrice = candleSeriesRef.current.coordinateToPrice(param.point.y);
    lastCrosshairPositionRef.current = { x: xTs, y: yPrice };

    startPointRef.current
      ? updateLine(xTs, yPrice)
      : handleHoverEffect(xTs, yPrice);

    if (isDraggingRef.current && dragStartPointRef.current && dragStartLineDataRef.current) {
      const deltaX = xTs - dragStartPointRef.current.x;
      const deltaY = yPrice - dragStartPointRef.current.y;

      let newLineData = dragStartLineDataRef.current.map((point, i) =>
        selectedPointRef.current !== null
          ? i === selectedPointRef.current
            ? {
                time: point.time + deltaX,
                value: point.value + deltaY,
              }
            : point
          : {
              time: point.time + deltaX,
              value: point.value + deltaY,
            }
      );

      dragLine(newLineData);
    }
  };

  const handleMouseDown = (e) => {
    if (!lastCrosshairPositionRef.current) return;
    if (isHoveredRef.current) {
      startDrag(
        lastCrosshairPositionRef.current.x,
        lastCrosshairPositionRef.current.y
      );
    }
  };

  const handleMouseUp = () => {
    endDrag();
  };

  useEffect(() => {
    if (!symbol || !containerRef.current) return;

    const container = containerRef.current;
    
    // Initialize chart
    if (!chartRef.current) {
      const chart = createChart(container, {
        layout: { 
          backgroundColor: '#1e222d', 
          textColor: '#d9d9d9' 
        },
        grid: { 
          vertLines: { 
            color: 'rgba(42, 46, 57, 0.5)' 
          }, 
          horzLines: { 
            color: 'rgba(42, 46, 57, 0.5)' 
          } 
        },
        crosshair: { 
          mode: CrosshairMode.Normal,
          vertLine: {
            labelBackgroundColor: "#9B7DFF"
          },
          horzLine: {
              labelBackgroundColor: "#9B7DFF"
          }
        },
        rightPriceScale: {
          borderColor: '#485c7b',
          scaleMargins: {
            top: 0.1,
            bottom: 0.5,
          },
          autoScale: true,
          mode: 1,
          alignLabels: true,
        },
        timeScale: { 
          borderColor: '#485c7b',
          timeZone: 'America/New_York',
          timeVisible: true,
          secondsVisible: false,
          lockVisibleTimeRangeOnResize: true,
          rightOffset: 20,
          barSpacing: 15,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
        },
        handleScale: {
            axisPressedMouseMove: true,
            mouseWheel: true,
            pinch: true,
        },
        width: container.clientWidth,
        height: container.clientHeight,
      });

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceLineVisible: false,
        visible: false,
        base: 0,
        priceScaleId: '',
        crossHairMarkerRadius: 0,
        crossHairMarkerBorderColor: '#26a69a',
        crossHairMarkerBackgroundColor: '#26a69a',
        crossHairMarkerBorderWidth: 0,
        crossHairMarkerBorderVisible: false,
        crossHairMarkerVisible: false,
      });

      // Add line series for trend lines
      const lineSeries = chart.addLineSeries({
        color: 'dodgerblue',
        lineWidth: 2,
        priceLineVisible: false,
      });

      lineSeriesRef.current = lineSeries;
      volumeSeriesRef.current = volumeSeries;
      chartRef.current = chart;
      candleSeriesRef.current = candleSeries;
      
      // Set up event listeners for trend line functionality
      chart.subscribeClick(handleChartClick);
      chart.subscribeCrosshairMove(handleCrosshairMove);
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mouseup', handleMouseUp);
    }

    const loadData = async () => {
      const { priceData, indicatorData } = await fetchPriceHistory(symbol, timeSettings, indicatorSettings);
      
      if (priceData.length > 0) {
        candleSeriesRef.current.setData(priceData);
        indicatorDataRef.current = indicatorData;

        // Inside your loadData function:
        Object.entries(indicatorData).forEach(([indicatorName, indicatorValues]) => {
          if (indicatorValues?.length > 0) {
            const cleanValues = indicatorValues
              .filter(item => item.value !== null && !isNaN(item.value))
              .map(item => ({ time: (item.time / 1000) - (4 * 60 * 60), value: item.value }));
            
            if (cleanValues.length > 0) {
              // Existing series removal and creation logic
              if (indicatorSeriesRef.current[indicatorName]) {
                chartRef.current.removeSeries(indicatorSeriesRef.current[indicatorName]);
              }
              
              const series = chartRef.current.addLineSeries({
                color: getIndicatorColor(indicatorName, indicatorSettings),
                lineWidth: 1,
                visible: false
              });
              
              series.setData(cleanValues);
              indicatorSeriesRef.current[indicatorName] = series;
            }
          }
        });
      }
      // Fit the chart to the content
      chartRef.current.timeScale().fitContent();
    };

    const resizeObserver = new ResizeObserver(entries => {
      if (!chartRef.current) return;
      const { width, height } = entries[0].contentRect;
      chartRef.current.applyOptions({ width, height });
    });

    resizeObserver.observe(container);
    loadData();

    return () => {
      resizeObserver.disconnect();
      
      if (chartRef.current) {
        // Remove event listeners for trend line functionality
        chartRef.current.unsubscribeClick(handleChartClick);
        chartRef.current.unsubscribeCrosshairMove(handleCrosshairMove);
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mouseup', handleMouseUp);
        
        // Clean up all indicator series
        Object.values(indicatorSeriesRef.current).forEach(series => {
          try {
            chartRef.current.removeSeries(series);
          } catch (error) {
            console.error('Error removing series:', error);
          }
        });
        
        // Clean up line series
        if (lineSeriesRef.current) {
          try {
            chartRef.current.removeSeries(lineSeriesRef.current);
          } catch (error) {
            console.error('Error removing line series:', error);
          }
        }
        
        indicatorSeriesRef.current = {};
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [symbol, containerRef, timeSettings, indicatorSettings]);

  // Handle visibility changes for indicators
  useEffect(() => {
    if (!chartRef.current || !activeIndicators) return;

    Object.entries(indicatorSeriesRef.current).forEach(([name, series]) => {
      try {
        if (series && typeof series.applyOptions === 'function') {
          series.applyOptions({
            visible: !!activeIndicators[name]
          });
        }
      } catch (error) {
        console.error(`Error updating visibility for ${name}:`, error);
      }
    });
  }, [activeIndicators]);

  return { isLoading, error };
};