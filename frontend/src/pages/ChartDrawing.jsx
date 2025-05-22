import React, { useEffect, useRef, useState } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";
import axios from 'axios';


function timeToTz(originalTime, timeZone) {
    const zonedDate = new Date(new Date(originalTime * 1000).toLocaleString('en-US', { timeZone }));
    return zonedDate.getTime() / 1000;
}

const ChartDrawing = () =>  {
    const chartContainerRef = useRef();
    const volumeContainerRef = useRef();
    const clickedPoints = useRef([]);    //Used for drawing 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    

    const fetchPriceHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axios.get('http://127.0.0.1:8000/api/price_history/');
          if (response.data.status === 'success') {
            return response.data.price_history.map(item => ({
              // Convert the time to desired timezone (e.g., 'America/New_York')
              time: timeToTz(item.time, 'America/New_York'), // Adjust timezone as needed
              open: item.open,
              high: item.high,
              low: item.low,
              close: item.close,
              volume: item.volume || 0,
            }));
          } else {
            throw new Error(response.data.message || 'Failed to fetch price history');
          }
        } catch (err) {
          setError(err.message);
          console.error('Axios error:', err);
          return [];
        } finally {
          setIsLoading(false);
        }
    };

    useEffect(() => {
 
        const chart = createChart(chartContainerRef.current, {
            layout: {
                backgroundColor: '#131722',
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: {
                    color: 'rgba(42, 46, 57, 0.5)',
                },
                horzLines: {
                    color: 'rgba(42, 46, 57, 0.5)',
                },
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
                borderColor: 'rgba(197, 203, 206, 0.2)',
            },
            timeScale: {
                borderColor: 'rgba(197, 203, 206, 0.2)',
                timeVisible: true,
                secondsVisible: false,
                timeZone: 'America/New_York',
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
            width: chartContainerRef.current.clientWidth,
            height: 400, 
        });

        chart.timeScale().applyOptions ({
            backgroundColor: "#71649C",
            rightOffset: 20,
            barSpacing: 15,
            minBarSpacing: 5,
            fixLeftEdge: true,
        });

        chart.priceScale().applyOptions ({
            backgroundColor: "#71649C",
            timeVisible: true,
        });


        const volume = createChart(volumeContainerRef.current, {
            layout: {
                backgroundColor: 'rgba(29, 38, 202, 0.85)',
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: {
                    color: 'rgba(42, 46, 57, 0)',
                },
                horzLines: {
                    color: 'rgba(42, 46, 57, 0)',
                },
            },
            rightPriceScale: {
                visible: false,
            },
            timeScale: {
                visible: false,
            },
            handleScroll: {
                mouseWheel: false,
                pressedMouseMove: false,
            },
            handleScale: {
                axisPressedMouseMove: false,
                mouseWheel: false,
                pinch: false,
            },
            width: chartContainerRef.current.clientWidth,
            height: 100,
        });


        const candleSeries = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderDownColor: '#ef5350',
            borderUpColor: '#26a69a',
            wickDownColor: '#ef5350',
            wickUpColor: '#26a69a',
        });

        const volumeSeries = volume.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            priceLineVisible: false,
        });

        volumeSeries.priceScale().applyOptions({
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
            rightOffset: 20,
        });

        const loadData = async () => {
            const priceData = await fetchPriceHistory();
            candleSeries.setData(priceData);
            

            const volumeData = priceData.map((candle, i) => ({
                time: candle.time,
                value: Math.floor(Math.random() * 1000) + 500,
                color: candle.close >= candle.open ? '#26a69a' : '#ef5350'
            }));


            volumeSeries.setData(volumeData);
        };

        loadData();

        const volumeTimeScale = volume.timeScale();
        const mainTimeScale = chart.timeScale();
        mainTimeScale.subscribeVisibleLogicalRangeChange(range => {
            volumeTimeScale.setVisibleLogicalRange(range);
        });

        // This is what gets the current cursors coordinates on chart
        const handleCrosshairMove = (param) => {
            if (!param || !param.point) return;

            console.log('param', param);

            const logicalX = param.logical ?? 0;
            const baseTime = chart.vertLines?.[0]?.time ?? 0;
            if (logicalX === 0) return;




            if (clickedPoints.current.length === 1) {
                const [x1, x2] = clickedPoints.current;
                const xspan = Math.abs(x2 - x1);
                console.log("xspan:", xspan);
                const coordinates = baseTime + logicalX * xspan;
                // Use xspan for drawing a trend line or other logic
            }
        };

        // This draws a line after two clicks are registered
        const handleChartClick = (param) => {
            if (!param || !param.point || !param.time) return;

            const price = candleSeries.coordinateToPrice(param.point.y);
            if (price === null) return;

            clickedPoints.current.push({ time: param.time, value: price });

            if (clickedPoints.current.length === 2) {
                const trendlineSeries = chart.addLineSeries({
                    color: 'rgba(255, 165, 0, 0.9)',
                    lineWidth: 2,
                    priceLineVisible: false,
                    lastValueVisible: false,
            });

            trendlineSeries.setData(clickedPoints.current);

            // Reset for next trendline
            clickedPoints.current = [];
            }
        };


        const handleResize = () => {
            chart.applyOptions({
                width: chartContainerRef.current.clientWidth,
            });
            volume.applyOptions({
                width: chartContainerRef.current.clientWidth,
            });
        };


        chart.subscribeClick(handleChartClick);
        chart.subscribeCrosshairMove(handleCrosshairMove);
        window.addEventListener("resize", handleResize);

        return () => {
            chart.remove();
            volume.remove();
            window.removeEventListener("resize", handleResize)
            chart.unsubscribeClick(handleChartClick);
            chart.unsubscribeCrosshairMove(handleCrosshairMove);
        };
    }, [
        chartContainerRef,
        volumeContainerRef,
        isLoading,
        error,
    ]);

    return (
    <div style={{ width: '100%', height: '500px' }}>
        <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />
        <div ref={volumeContainerRef} style={{ width: '100%', height: '100px' }} />
    </div>
    );
};

export default ChartDrawing;