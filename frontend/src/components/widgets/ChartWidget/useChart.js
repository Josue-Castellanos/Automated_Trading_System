import { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import axios from 'axios';
import { DrawingManager } from '../../toolbar/DrawingManager';

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
  const drawingManagerRef = useRef(null);
  
  // Drawing state
  const [selectedTool, setSelectedTool] = useState(null);
  const [hasSelectedDrawing, setHasSelectedDrawing] = useState(false);
  
// ********************************************************************************
// ********************************************************************************
  // Mouse state tracking
    const isMouseDownRef = useRef(false);
// ********************************************************************************
// ********************************************************************************

  // Stored drawings (per symbol)
  const drawingsMapRef = useRef({});
  
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
        
        // Store klines for drawing calculations
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

  const customizeDrawing = (changes) => {
    if (!drawingManagerRef.current) return;
    
    const { color, fibLevels } = changes;
    const drawing = drawingManagerRef.current.drawings.find(
      d => d.id === drawingManagerRef.current.getSelectedDrawingId()
    );
    
    if (drawing) {
      if (color) {
        drawingManagerRef.current.setColor(drawing.type, color);
        drawing.series.applyOptions({ color });
      }
      
      if (fibLevels && (drawing.type === 'fibRetracement' || drawing.type === 'fibExtension')) {
        drawingManagerRef.current.setFibLevels(drawing.type, fibLevels);
        drawingManagerRef.current.updateFibonacciLevels(drawing);
      }
      
      // Save updated drawings
      if (symbol) {
        const serializedDrawings = drawingManagerRef.current.serializeDrawings();
        drawingsMapRef.current[symbol] = serializedDrawings;
      }
    }
  };
  
  const getSelectedDrawing = () => {
    if (!drawingManagerRef.current) return null;
    
    return drawingManagerRef.current.drawings.find(
      d => d.id === drawingManagerRef.current.getSelectedDrawingId()
    );
  };
  
  // Handle drawing tool selection
  const handleSelectDrawingTool = (toolType) => {
    if (!drawingManagerRef.current) return;
    setSelectedTool(toolType);
    drawingManagerRef.current.setActiveTool(toolType);
    
    // Add drawing-mode class to container for cursor styling
    if (toolType) {
      containerRef.current?.classList.add('drawing-mode');
    } else {
      containerRef.current?.classList.remove('drawing-mode');
    }
  };
  
  // Handle deleting selected drawing
  const handleDeleteSelectedDrawing = () => {
    if (!drawingManagerRef.current) return;
    drawingManagerRef.current.deleteSelected();
    setHasSelectedDrawing(false);
    
    // Save updated drawings
    if (symbol) {
      const serializedDrawings = drawingManagerRef.current.serializeDrawings();
      drawingsMapRef.current[symbol] = serializedDrawings;
    }
  };

  // Set up chart event handlers
  const setupChartEvents = () => {
    if (!chartRef.current || !drawingManagerRef.current) return;
    
    const handleCrosshairMove = (param) => {
      if (!param.point || !candleSeriesRef.current) return;
      
      const xTs = param.time
        ? param.time
        : (klinesRef.current && klinesRef.current.length > 0 && xspanRef.current)
          ? klinesRef.current[0].time + param.logical * xspanRef.current
          : param.logical;
      
      const yPrice = candleSeriesRef.current.coordinateToPrice(param.point.y);
      
// ********************************************************************************
// ********************************************************************************

      if (isMouseDownRef.current && drawingManagerRef.current.isHovering) {
        drawingManagerRef.current.updateDraggedDrawing(xTs, yPrice);
      } else {
        drawingManagerRef.current.handleCrosshairMove(xTs, yPrice);
      }
// ********************************************************************************
// ********************************************************************************

      // Pass to drawing manager
      // drawingManagerRef.current.handleCrosshairMove(xTs, yPrice, param.logical);
    };
    
    const handleChartClick = (param) => {
      if (!candleSeriesRef.current) return;
      
      const xTs = param.time
        ? param.time
        : (klinesRef.current && klinesRef.current.length > 0 && xspanRef.current) 
          ? klinesRef.current[0].time + param.logical * xspanRef.current
          : param.logical;
      
      const yPrice = candleSeriesRef.current.coordinateToPrice(param.point.y);
      
      // Pass to drawing manager
      drawingManagerRef.current.handleClick(xTs, yPrice);
      
      // Check if we have a selected drawing after the click
      setTimeout(() => {
        setHasSelectedDrawing(drawingManagerRef.current.hasSelectedDrawing());
      }, 10);
      
      // Save drawings after changes
      if (symbol) {
        setTimeout(() => {
          const serializedDrawings = drawingManagerRef.current.serializeDrawings();
          drawingsMapRef.current[symbol] = serializedDrawings;
        }, 100);
      }
    };
    
// ********************************************************************************
// ********************************************************************************

    const handleMouseDown = (event) => {
      if (!drawingManagerRef.current || !candleSeriesRef.current || !drawingManagerRef.current.lastCrosshairPosition) return;
      
      if (event.button !== 0) return;
      
      isMouseDownRef.current = true;
      
      if (drawingManagerRef.current.isHovering) {
        // const rect = containerRef.current.getBoundingClientRect();
        // const x = event.clientX - rect.left;
        // const y = event.clientY - rect.top;
        
        // const logical = chartRef.current.timeScale().coordinateToLogical(x);
        // const xTs = (klinesRef.current && klinesRef.current.length > 0 && xspanRef.current)
        //   ? klinesRef.current[0].time + logical * xspanRef.current
        //   : logical;
        // const yPrice = candleSeriesRef.current.coordinateToPrice(y);
        
        // drawingManagerRef.current.startDragging(xTs, yPrice);
        
        chartRef.current.applyOptions({
          // Disable all interactions
          handleScroll: false,
          handleScale: false,
          // Disable mouse wheel interactions
          mouseWheel: {
            scale: false,
            scroll: false,
          },
          // Disable touch interactions
          touch: {
            enabled: false,
          },
          // Disable kinetic scrolling (momentum)
          kineticScroll: {
            enabled: false,
          },
          crosshair: {
            mode: CrosshairMode.Normal,
          },
          // Disable price/scale interactions
          // priceScale: {
          //   // mode: 0, // 0 = Normal (no auto-scaling)
          //   // autoScale: false,
          // },
          // Disable time scale interactions
          timeScale: {
            // rightOffset: 0,
            // barSpacing: 20, // Fixed bar spacing
            // minBarSpacing: 20, // Same as barSpacing to prevent changes
            // fixLeftEdge: true,
            // fixRightEdge: true,
            lockVisibleTimeRangeOnResize: true,
          },
        });

        drawingManagerRef.current.startDragging(
          drawingManagerRef.current.lastCrosshairPosition.x,
          drawingManagerRef.current.lastCrosshairPosition.y);
        event.preventDefault();
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      
      if (!drawingManagerRef.current) return;
      drawingManagerRef.current.endDragging();
      chartRef.current.applyOptions({ handleScroll: true, handleScale: true });

      if (symbol) {
        const serializedDrawings = drawingManagerRef.current.serializeDrawings();
        drawingsMapRef.current[symbol] = serializedDrawings;
      }
    };

// ********************************************************************************
// ********************************************************************************

    // const handleMouseUp = () => {
    //   if (!drawingManagerRef.current) return;
    //   drawingManagerRef.current.endDragging();
      
    //   // Save drawings after dragging
    //   if (symbol) {
    //     const serializedDrawings = drawingManagerRef.current.serializeDrawings();
    //     drawingsMapRef.current[symbol] = serializedDrawings;
    //   }
    // };

    chartRef.current.subscribeClick(handleChartClick);
    chartRef.current.subscribeCrosshairMove(handleCrosshairMove);
    containerRef.current.addEventListener('mouseup', handleMouseUp);
// ********************************************************************************
// ********************************************************************************
    containerRef.current.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
// ********************************************************************************
// ********************************************************************************

    
    // Cleanup function
    return () => {
      chartRef.current?.unsubscribeClick(handleChartClick);
      chartRef.current?.unsubscribeCrosshairMove(handleCrosshairMove);
      containerRef.current?.removeEventListener('mouseup', handleMouseUp);
// ********************************************************************************
// ********************************************************************************
      containerRef.current?.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
// ********************************************************************************
// ********************************************************************************
    };
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

      chartRef.current = chart;
      candleSeriesRef.current = candleSeries;
      volumeSeriesRef.current = volumeSeries;
      
      // Initialize drawing manager
      drawingManagerRef.current = new DrawingManager(chart);
    }

    const loadData = async () => {
      const { priceData, indicatorData } = await fetchPriceHistory(symbol, timeSettings, indicatorSettings);
      
      if (priceData.length > 0) {
        candleSeriesRef.current.setData(priceData);
        indicatorDataRef.current = indicatorData;

        // Process indicator data
        Object.entries(indicatorData).forEach(([indicatorName, indicatorValues]) => {
          if (indicatorValues?.length > 0) {
            const cleanValues = indicatorValues
              .filter(item => item.value !== null && !isNaN(item.value))
              .map(item => ({ time: (item.time / 1000) - (4 * 60 * 60), value: item.value }));
            
            if (cleanValues.length > 0) {
              // Handle existing series
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
        
        // Load saved drawings for this symbol
        if (drawingsMapRef.current[symbol] && drawingManagerRef.current) {
          drawingManagerRef.current.loadDrawings(drawingsMapRef.current[symbol]);
        }
      }
      
      // Set up event handlers for drawings
      const cleanup = setupChartEvents();
      
      // Fit the chart to the content
      chartRef.current.timeScale().fitContent();
      
      return cleanup;
    };

    const resizeObserver = new ResizeObserver(entries => {
      if (!chartRef.current) return;
      const { width, height } = entries[0].contentRect;
      chartRef.current.applyOptions({ width, height });
    });

    resizeObserver.observe(container);
    const cleanupEvents = loadData();

    return () => {
      resizeObserver.disconnect();
      if (cleanupEvents) cleanupEvents();
      
      if (chartRef.current) {
        // Clean up all indicator series
        Object.values(indicatorSeriesRef.current).forEach(series => {
          try {
            chartRef.current.removeSeries(series);
          } catch (error) {
            console.error('Error removing series:', error);
          }
        });
        
        // Save drawings before unmounting
        if (symbol && drawingManagerRef.current) {
          const serializedDrawings = drawingManagerRef.current.serializeDrawings();
          drawingsMapRef.current[symbol] = serializedDrawings;
        }
        
        indicatorSeriesRef.current = {};
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

  return { 
    isLoading, 
    error, 
    selectedDrawingTool: selectedTool,
    hasSelectedDrawing,
    customizeDrawing,
    getSelectedDrawing,
    selectDrawingTool: handleSelectDrawingTool,
    deleteSelectedDrawing: handleDeleteSelectedDrawing
  };
};
