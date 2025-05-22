import React from 'react';
import { createChart } from 'lightweight-charts';
import '../styles/chart.css';

const Chart = () => {
    const chartContainer = document.getElementById('price-chart');
    const volumeContainer = document.getElementById('volume-container');

    const chart = createChart(chartContainer, {
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
            mode: LightweightCharts.CrosshairMode.Normal,
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
        width: container.clientWidth,
        height: container.clientHeight
    });

    const volumeChart = createChart(volumeContainer, {
        height: 100,
        layout: {
            backgroundColor: '#131722',
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
    });

    // Link time scales
    const mainTimeScale = chart.timeScale();
    const volumeTimeScale = volumeChart.timeScale();
    
    mainTimeScale.subscribeVisibleLogicalRangeChange(range => {
        volumeTimeScale.setVisibleLogicalRange(range);
    });

    // Create series
    const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderDownColor: '#ef5350',
        borderUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        wickUpColor: '#26a69a',
    });

    const volumeSeries = volumeChart.addHistogramSeries({
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
    });

    // candleSeries.setData(priceData);
    candleSeries.setData([
        { time: '2018-12-22', open: 75.16, high: 82.84, low: 36.16, close: 45.72 },
        { time: '2018-12-23', open: 45.12, high: 53.90, low: 45.12, close: 48.09 },
        { time: '2018-12-24', open: 60.71, high: 60.71, low: 53.39, close: 59.29 },
        { time: '2018-12-25', open: 68.26, high: 68.26, low: 59.04, close: 60.50 },
        { time: '2018-12-26', open: 67.71, high: 105.85, low: 66.67, close: 91.04 },
        { time: '2018-12-27', open: 91.04, high: 121.40, low: 82.70, close: 111.40 },
        { time: '2018-12-28', open: 111.51, high: 142.83, low: 103.34, close: 131.25 },
        { time: '2018-12-29', open: 131.33, high: 151.17, low: 77.68, close: 96.43 },
        { time: '2018-12-30', open: 106.33, high: 110.20, low: 90.39, close: 98.10 },
        { time: '2018-12-31', open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
    ]);
    const sampleVolumeData = sampleCandleData.map((candle, i) => ({
        time: candle.time,
        value: Math.floor(Math.random() * 1000) + 500,
        color: candle.close >= candle.open ? '#26a69a' : '#ef5350'
    }));
    volumeSeries.setData(volumeData);
    chart.timeScale().fitContent();


    // Enhanced Drawing Tools Implementation
    let activeDrawingTool = null;
    let drawings = [];
    let currentDrawing = null;
    let savedDrawingSets = JSON.parse(localStorage.getItem('savedDrawingSets')) || [];

    // Modal elements
    const indicatorModal = document.getElementById('indicator-settings-modal');
    const drawingsModal = document.getElementById('drawings-modal');
    const indicatorSettingsForm = document.getElementById('indicator-settings-form');
    const savedDrawingsList = document.getElementById('saved-drawings-list');

    // Serialize drawings for saving
    function serializeDrawings() {
        return drawings.map(drawing => {
            const serialized = {
                type: drawing.type,
                points: drawing.points.map(p => ({
                    time: p.time,
                    price: p.price || p.y,
                    x: p.x,
                    y: p.y
                })),
                options: drawing.options || {}
            };
            
            if (drawing.fibLevels) {
                serialized.fibLevels = drawing.fibLevels;
            }
            
            if (drawing.gannAngles) {
                serialized.gannAngles = drawing.gannAngles;
            }
            
            return serialized;
        });
    }

    // Deserialize drawings for loading
    function deserializeDrawings(serializedDrawings) {
        // Clear existing drawings
        drawings.forEach(drawing => {
            if (drawing.line) chart.removeSeries(drawing.line);
            if (drawing.rect) chart.removeShape(drawing.rect);
            if (drawing.ellipse) chart.removeShape(drawing.ellipse);
            if (drawing.fibRetracement) drawing.fibRetracement.forEach(s => chart.removeSeries(s));
            if (drawing.gannFan) drawing.gannFan.forEach(s => chart.removeSeries(s));
        });
        
        drawings = [];
        
        // Create new drawings from serialized data
        serializedDrawings.forEach(serialized => {
            const drawing = {
                type: serialized.type,
                points: serialized.points.map(p => ({
                    time: p.time,
                    price: p.price,
                    x: p.x,
                    y: p.y
                })),
                options: serialized.options || {}
            };
            
            switch (serialized.type) {
                case 'line':
                case 'ray':
                case 'trendline':
                case 'arrow':
                    drawing.line = chart.addLineSeries({
                        color: drawing.options.color || '#2962FF',
                        lineWidth: drawing.options.lineWidth || 2,
                        lineStyle: drawing.options.lineStyle || 0,
                        lineType: serialized.type === 'ray' ? 
                            LightweightCharts.LineType.Ray : 
                            (serialized.type === 'trendline' ? 
                                LightweightCharts.LineType.WithAngle : 
                                LightweightCharts.LineType.Simple),
                    });
                    drawing.line.setData(drawing.points);
                    break;
                    
                case 'horizontal':
                    drawing.line = chart.addLineSeries({
                        color: drawing.options.color || '#2962FF',
                        lineWidth: drawing.options.lineWidth || 1,
                        lineStyle: drawing.options.lineStyle || 2,
                    });
                    drawing.line.setData([
                        { time: priceData[0].time, value: drawing.points[0].price },
                        { time: priceData[priceData.length - 1].time, value: drawing.points[0].price },
                    ]);
                    break;
                    
                case 'vertical':
                    drawing.line = chart.addLineSeries({
                        color: drawing.options.color || '#2962FF',
                        lineWidth: drawing.options.lineWidth || 1,
                        lineStyle: drawing.options.lineStyle || 2,
                    });
                    const priceRange = chart.priceScale().getPriceRange();
                    drawing.line.setData([
                        { time: drawing.points[0].time, value: priceRange.minValue },
                        { time: drawing.points[0].time, value: priceRange.maxValue },
                    ]);
                    break;
                    
                case 'rectangle':
                    drawing.rect = chart.addRectangle({
                        top: Math.max(drawing.points[0].price, drawing.points[1].price),
                        bottom: Math.min(drawing.points[0].price, drawing.points[1].price),
                        left: Math.min(drawing.points[0].time, drawing.points[1].time),
                        right: Math.max(drawing.points[0].time, drawing.points[1].time),
                        background: drawing.options.background || 'rgba(41, 98, 255, 0.1)',
                        borderColor: drawing.options.borderColor || '#2962FF',
                        borderWidth: drawing.options.borderWidth || 2,
                    });
                    break;
                    
                case 'ellipse':
                    drawing.ellipse = chart.addEllipse({
                        x: (drawing.points[0].time + drawing.points[1].time) / 2,
                        y: (drawing.points[0].price + drawing.points[1].price) / 2,
                        width: Math.abs(drawing.points[1].time - drawing.points[0].time),
                        height: Math.abs(drawing.points[1].price - drawing.points[0].price),
                        background: drawing.options.background || 'rgba(41, 98, 255, 0.1)',
                        borderColor: drawing.options.borderColor || '#2962FF',
                        borderWidth: drawing.options.borderWidth || 2,
                    });
                    break;
                    
                case 'fib-retracement':
                    const fibLevels = serialized.fibLevels || [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
                    const startPrice = drawing.points[0].price;
                    const endPrice = drawing.points[1].price;
                    const priceDiff = endPrice - startPrice;
                    
                    drawing.fibRetracement = fibLevels.map(level => {
                        const series = chart.addLineSeries({
                            color: level === 0 || level === 1 ? '#FF9800' : '#9E9E9E',
                            lineWidth: level === 0 || level === 1 ? 2 : 1,
                            lineStyle: level === 0 || level === 1 ? 0 : 2,
                        });
                        
                        const levelPrice = startPrice + priceDiff * level;
                        series.setData([
                            { time: drawing.points[0].time, value: levelPrice },
                            { time: drawing.points[1].time, value: levelPrice },
                        ]);
                        
                        return series;
                    });
                    break;
                    
                case 'gann-fan':
                    const angles = serialized.gannAngles || [1, 2, 3, 4, 5, 6, 7, 8];
                    const gannStartTime = drawing.points[0].time;
                    const gannStartPrice = drawing.points[0].price;
                    
                    drawing.gannFan = angles.map(angle => {
                        const series = chart.addLineSeries({
                            color: angle === 1 ? '#FF9800' : '#9E9E9E',
                            lineWidth: angle === 1 ? 2 : 1,
                            lineType: LightweightCharts.LineType.WithAngle,
                        });
                        
                        // Calculate end point based on angle (simplified)
                        const timeDiff = 1000 * 60 * 60 * 24 * 30; // 30 days
                        const priceDiff = angle * 10; // Simplified Gann angle calculation
                        
                        series.setData([
                            { time: gannStartTime, value: gannStartPrice },
                            { time: gannStartTime + timeDiff, value: gannStartPrice + priceDiff },
                        ]);
                        
                        return series;
                    });
                    break;
            }
            
            drawings.push(drawing);
        });
    }

    // Save drawings to localStorage
    function saveDrawings(name, description) {
        const serialized = serializeDrawings();
        const drawingSet = {
            name,
            description,
            data: serialized,
            timestamp: new Date().toISOString()
        };
        
        // Check if this name already exists
        const existingIndex = savedDrawingSets.findIndex(set => set.name === name);
        if (existingIndex >= 0) {
            savedDrawingSets[existingIndex] = drawingSet;
        } else {
            savedDrawingSets.push(drawingSet);
        }
        
        localStorage.setItem('savedDrawingSets', JSON.stringify(savedDrawingSets));
        updateSavedDrawingsList();
    }

    // Load drawings from localStorage
    function loadDrawings(name) {
        const drawingSet = savedDrawingSets.find(set => set.name === name);
        if (drawingSet) {
            deserializeDrawings(drawingSet.data);
        }
    }

    // Delete drawings from localStorage
    function deleteDrawings(name) {
        savedDrawingSets = savedDrawingSets.filter(set => set.name !== name);
        localStorage.setItem('savedDrawingSets', JSON.stringify(savedDrawingSets));
        updateSavedDrawingsList();
    }

    // Update the saved drawings list in the modal
    function updateSavedDrawingsList() {
        savedDrawingsList.innerHTML = '';
        
        if (savedDrawingSets.length === 0) {
            savedDrawingsList.innerHTML = '<p>No saved drawing sets found</p>';
            return;
        }
        
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.margin = '10px 0';
        ul.style.maxHeight = '200px';
        ul.style.overflowY = 'auto';
        
        savedDrawingSets.forEach(set => {
            const li = document.createElement('li');
            li.style.padding = '8px';
            li.style.borderBottom = '1px solid #2b3139';
            li.style.cursor = 'pointer';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            
            li.innerHTML = `
                <div>
                    <strong>${set.name}</strong>
                    <div style="font-size: 12px; color: #9E9E9E;">${set.description || 'No description'}</div>
                </div>
                <div style="font-size: 12px; color: #9E9E9E;">
                    ${new Date(set.timestamp).toLocaleString()}
                </div>
            `;
            
            li.addEventListener('click', () => {
                document.getElementById('drawings-name').value = set.name;
                document.getElementById('drawings-description').value = set.description || '';
                document.getElementById('delete-drawings-btn').style.display = 'inline-block';
            });
            
            ul.appendChild(li);
        });
        
        savedDrawingsList.appendChild(ul);
    }

    // Drawing tools implementation
    function setActiveTool(tool) {
        activeDrawingTool = tool;
        document.querySelectorAll('#toolbar button').forEach(btn => {
            btn.classList.remove('active');
        });
        if (tool) {
            event.target.classList.add('active');
        } else {
            document.getElementById('cursor-btn').classList.add('active');
        }
    }

    function handleCrosshairMove(param) {
        if (!currentDrawing || !param.point) return;
        
        switch (currentDrawing.type) {
            case 'line':
            case 'ray':
            case 'trendline':
            case 'arrow':
                currentDrawing.line.applyOptions({
                    points: [currentDrawing.points[0], { ...param.point }],
                });
                break;
            case 'fib-retracement':
                // Update the end point of the fib retracement
                currentDrawing.points[1] = param.point;
                updateFibRetracement(currentDrawing);
                break;
            case 'gann-fan':
                // Update the end point of the gann fan
                currentDrawing.points[1] = param.point;
                updateGannFan(currentDrawing);
                break;
            case 'rectangle':
                currentDrawing.rect.applyOptions({
                    coordinates: {
                        top: Math.max(currentDrawing.points[0].y, param.point.y),
                        bottom: Math.min(currentDrawing.points[0].y, param.point.y),
                        left: Math.min(currentDrawing.points[0].x, param.point.x),
                        right: Math.max(currentDrawing.points[0].x, param.point.x),
                    },
                });
                break;
            case 'ellipse':
                currentDrawing.ellipse.applyOptions({
                    x: (currentDrawing.points[0].x + param.point.x) / 2,
                    y: (currentDrawing.points[0].y + param.point.y) / 2,
                    width: Math.abs(param.point.x - currentDrawing.points[0].x),
                    height: Math.abs(param.point.y - currentDrawing.points[0].y),
                });
                break;
        }
    }

    function updateFibRetracement(drawing) {
        const fibLevels = drawing.fibLevels || [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
        const startPrice = drawing.points[0].price;
        const endPrice = drawing.points[1].price;
        const priceDiff = endPrice - startPrice;
        
        fibLevels.forEach((level, i) => {
            const levelPrice = startPrice + priceDiff * level;
            drawing.fibRetracement[i].setData([
                { time: drawing.points[0].time, value: levelPrice },
                { time: drawing.points[1].time, value: levelPrice },
            ]);
        });
    }

    function updateGannFan(drawing) {
        const angles = drawing.gannAngles || [1, 2, 3, 4, 5, 6, 7, 8];
        const startTime = drawing.points[0].time;
        const startPrice = drawing.points[0].price;
        const endTime = drawing.points[1].time;
        const endPrice = drawing.points[1].price;
        
        const timeDiff = endTime - startTime;
        const priceDiff = endPrice - startPrice;
        
        angles.forEach((angle, i) => {
            // Simplified Gann angle calculation
            const anglePriceDiff = priceDiff * angle;
            drawing.gannFan[i].setData([
                { time: startTime, value: startPrice },
                { time: startTime + timeDiff, value: startPrice + anglePriceDiff },
            ]);
        });
    }

    function handleClick(param) {
        if (!activeDrawingTool || !param.point) return;
        
        if (!currentDrawing) {
            // Start new drawing
            currentDrawing = {
                type: activeDrawingTool,
                points: [param.point],
                options: {
                    color: '#2962FF',
                    lineWidth: 2,
                }
            };
            
            switch (activeDrawingTool) {
                case 'line':
                case 'ray':
                case 'trendline':
                case 'arrow':
                    currentDrawing.line = chart.addLineSeries({
                        color: currentDrawing.options.color,
                        lineWidth: currentDrawing.options.lineWidth,
                    });
                    currentDrawing.line.setData([param.point, param.point]);
                    break;
                case 'horizontal':
                    currentDrawing.line = chart.addLineSeries({
                        color: currentDrawing.options.color,
                        lineWidth: currentDrawing.options.lineWidth,
                        lineStyle: 2, // dashed
                    });
                    currentDrawing.line.setData([
                        { time: priceData[0].time, value: param.point.y },
                        { time: priceData[priceData.length - 1].time, value: param.point.y },
                    ]);
                    drawings.push(currentDrawing);
                    currentDrawing = null;
                    break;
                case 'vertical':
                    currentDrawing.line = chart.addLineSeries({
                        color: currentDrawing.options.color,
                        lineWidth: currentDrawing.options.lineWidth,
                        lineStyle: 2, // dashed
                    });
                    const priceRange = chart.priceScale().getPriceRange();
                    currentDrawing.line.setData([
                        { time: param.point.time, value: priceRange.minValue },
                        { time: param.point.time, value: priceRange.maxValue },
                    ]);
                    drawings.push(currentDrawing);
                    currentDrawing = null;
                    break;
                case 'fib-retracement':
                    currentDrawing.fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
                    currentDrawing.fibRetracement = currentDrawing.fibLevels.map(level => {
                        const series = chart.addLineSeries({
                            color: level === 0 || level === 1 ? '#FF9800' : '#9E9E9E',
                            lineWidth: level === 0 || level === 1 ? 2 : 1,
                            lineStyle: level === 0 || level === 1 ? 0 : 2,
                        });
                        return series;
                    });
                    break;
                case 'gann-fan':
                    currentDrawing.gannAngles = [1, 2, 3, 4, 5, 6, 7, 8];
                    currentDrawing.gannFan = currentDrawing.gannAngles.map(angle => {
                        const series = chart.addLineSeries({
                            color: angle === 1 ? '#FF9800' : '#9E9E9E',
                            lineWidth: angle === 1 ? 2 : 1,
                            lineType: LightweightCharts.LineType.WithAngle,
                        });
                        return series;
                    });
                    break;
                case 'rectangle':
                    currentDrawing.rect = chart.addRectangle({
                        top: param.point.y,
                        bottom: param.point.y,
                        left: param.point.x,
                        right: param.point.x,
                        background: 'rgba(41, 98, 255, 0.1)',
                        borderColor: currentDrawing.options.color,
                        borderWidth: currentDrawing.options.lineWidth,
                    });
                    break;
                case 'ellipse':
                    currentDrawing.ellipse = chart.addEllipse({
                        x: param.point.x,
                        y: param.point.y,
                        width: 0,
                        height: 0,
                        background: 'rgba(41, 98, 255, 0.1)',
                        borderColor: currentDrawing.options.color,
                        borderWidth: currentDrawing.options.lineWidth,
                    });
                    break;
            }
        } else {
            // Complete the drawing
            currentDrawing.points.push(param.point);
            
            if (activeDrawingTool === 'line' || 
                activeDrawingTool === 'ray' || 
                activeDrawingTool === 'trendline' ||
                activeDrawingTool === 'arrow') {
                currentDrawing.line.setData(currentDrawing.points);
                
                if (activeDrawingTool === 'ray' || activeDrawingTool === 'trendline') {
                    currentDrawing.line.applyOptions({
                        lineType: activeDrawingTool === 'ray' ? 
                            LightweightCharts.LineType.Ray : 
                            LightweightCharts.LineType.WithAngle,
                    });
                }
            } else if (activeDrawingTool === 'fib-retracement') {
                updateFibRetracement(currentDrawing);
            } else if (activeDrawingTool === 'gann-fan') {
                updateGannFan(currentDrawing);
            }
            
            drawings.push(currentDrawing);
            currentDrawing = null;
        }
    }


    // Enhanced candlestick pattern recognition
    class CandlestickPatternDetector {
        constructor(data) {
            this.data = data;
            this.patternMarkers = [];
            this.infoWindows = [];
        }

        detectAllPatterns() {
            this.clearPatternMarkers();
            
            // Detect single candle patterns
            this.detectSingleCandlePatterns();
            
            // Detect two candle patterns
            this.detectTwoCandlePatterns();
            
            // Detect three candle patterns
            this.detectThreeCandlePatterns();
            
            // Detect complex patterns
            this.detectComplexPatterns();
        }

        clearPatternMarkers() {
            const container = document.getElementById('pattern-markers-container');
            container.innerHTML = '';
            this.patternMarkers = [];
            this.infoWindows = [];
        }

        detectSingleCandlePatterns() {
            for (let i = 0; i < this.data.length; i++) {
                const candle = this.data[i];
                const bodySize = Math.abs(candle.open - candle.close);
                const upperWick = candle.high - Math.max(candle.open, candle.close);
                const lowerWick = Math.min(candle.open, candle.close) - candle.low;
                const totalRange = candle.high - candle.low;
                
                // Hammer / Hanging Man
                if (lowerWick >= 2 * bodySize && upperWick <= bodySize * 0.3) {
                    const type = candle.close > candle.open ? 'Hammer' : 'Hanging Man';
                    const sentiment = candle.close > candle.open ? 'bullish' : 'bearish';
                    this.addPatternMarker(i, type, sentiment, 0.7);
                }
                
                // Inverted Hammer / Shooting Star
                if (upperWick >= 2 * bodySize && lowerWick <= bodySize * 0.3) {
                    const type = candle.close > candle.open ? 'Inverted Hammer' : 'Shooting Star';
                    const sentiment = candle.close > candle.open ? 'bullish' : 'bearish';
                    this.addPatternMarker(i, type, sentiment, 0.7);
                }
                
                // Doji
                if (bodySize <= totalRange * 0.05) {
                    let type = 'Doji';
                    let strength = 0.5;
                    
                    // Dragonfly Doji
                    if (lowerWick >= totalRange * 0.8) {
                        type = 'Dragonfly Doji';
                        strength = 0.7;
                    }
                    // Gravestone Doji
                    else if (upperWick >= totalRange * 0.8) {
                        type = 'Gravestone Doji';
                        strength = 0.7;
                    }
                    // Long-Legged Doji
                    else if (upperWick >= totalRange * 0.3 && lowerWick >= totalRange * 0.3) {
                        type = 'Long-Legged Doji';
                        strength = 0.6;
                    }
                    
                    const sentiment = candle.close > candle.open ? 'bullish' : 'bearish';
                    this.addPatternMarker(i, type, sentiment, strength);
                }
                
                // Marubozu
                if (bodySize >= totalRange * 0.9) {
                    const type = candle.close > candle.open ? 'Bullish Marubozu' : 'Bearish Marubozu';
                    const sentiment = candle.close > candle.open ? 'bullish' : 'bearish';
                    this.addPatternMarker(i, type, sentiment, 0.8);
                }
            }
        }

        detectTwoCandlePatterns() {
            for (let i = 1; i < this.data.length; i++) {
                const prev = this.data[i-1];
                const current = this.data[i];
                
                const prevBody = Math.abs(prev.open - prev.close);
                const currentBody = Math.abs(current.open - current.close);
                const prevMid = (prev.open + prev.close) / 2;
                const currentMid = (current.open + current.close) / 2;
                
                // Engulfing
                if (currentBody > prevBody * 1.5) {
                    const bullEngulf = prev.close < prev.open && 
                                    current.open < prev.close && 
                                    current.close > prev.open;
                    
                    const bearEngulf = prev.close > prev.open && 
                                    current.open > prev.close && 
                                    current.close < prev.open;
                    
                    if (bullEngulf) {
                        this.addPatternMarker(i, 'Bullish Engulfing', 'bullish', 0.8);
                    } else if (bearEngulf) {
                        this.addPatternMarker(i, 'Bearish Engulfing', 'bearish', 0.8);
                    }
                }
                
                // Harami
                if (currentBody < prevBody * 0.7 && 
                    Math.min(current.open, current.close) > Math.min(prev.open, prev.close) &&
                    Math.max(current.open, current.close) < Math.max(prev.open, prev.close)) {
                    
                    const sentiment = current.close > current.open ? 'bullish' : 'bearish';
                    const type = sentiment === 'bullish' ? 'Bullish Harami' : 'Bearish Harami';
                    this.addPatternMarker(i, type, sentiment, 0.6);
                }
                
                // Piercing Line / Dark Cloud Cover
                if (prevBody > 0 && currentBody > 0) {
                    const prevIsBearish = prev.close < prev.open;
                    const currentIsBullish = current.close > current.open;
                    
                    if (prevIsBearish && currentIsBullish && 
                        current.open < prev.close && 
                        current.close > prevMid) {
                        this.addPatternMarker(i, 'Piercing Line', 'bullish', 0.7);
                    }
                    
                    if (!prevIsBearish && !currentIsBullish && 
                        current.open > prev.close && 
                        current.close < prevMid) {
                        this.addPatternMarker(i, 'Dark Cloud Cover', 'bearish', 0.7);
                    }
                }
                
                // Tweezer Tops/Bottoms
                if (Math.abs(prev.high - current.high) <= prev.high * 0.002 || 
                    Math.abs(prev.low - current.low) <= prev.low * 0.002) {
                    
                    if (prev.close < prev.open && current.close > current.open && 
                        Math.abs(prev.low - current.low) <= prev.low * 0.002) {
                        this.addPatternMarker(i, 'Tweezer Bottom', 'bullish', 0.7);
                    }
                    
                    if (prev.close > prev.open && current.close < current.open && 
                        Math.abs(prev.high - current.high) <= prev.high * 0.002) {
                        this.addPatternMarker(i, 'Tweezer Top', 'bearish', 0.7);
                    }
                }
            }
        }

        detectThreeCandlePatterns() {
            for (let i = 2; i < this.data.length; i++) {
                const first = this.data[i-2];
                const second = this.data[i-1];
                const third = this.data[i];
                
                const firstBody = Math.abs(first.open - first.close);
                const secondBody = Math.abs(second.open - second.close);
                const thirdBody = Math.abs(third.open - third.close);
                
                const firstIsBullish = first.close > first.open;
                const firstIsBearish = first.close < first.open;
                const secondIsBullish = second.close > second.open;
                const secondIsBearish = second.close < second.open;
                const thirdIsBullish = third.close > third.open;
                const thirdIsBearish = third.close < third.open;
                
                // Morning Star / Evening Star
                if (firstBody > 0 && thirdBody > 0) {
                    const firstLong = firstBody >= (first.high - first.low) * 0.7;
                    const thirdLong = thirdBody >= (third.high - third.low) * 0.7;
                    
                    if (firstLong && thirdLong) {
                        // Morning Star
                        if (firstIsBearish && 
                            secondBody <= (second.high - second.low) * 0.3 && 
                            thirdIsBullish && 
                            third.open > second.close && 
                            third.close > firstMid) {
                            
                            this.addPatternMarker(i, 'Morning Star', 'bullish', 0.9);
                        }
                        
                        // Evening Star
                        if (firstIsBullish && 
                            secondBody <= (second.high - second.low) * 0.3 && 
                            thirdIsBearish && 
                            third.open < second.close && 
                            third.close < firstMid) {
                            
                            this.addPatternMarker(i, 'Evening Star', 'bearish', 0.9);
                        }
                    }
                }
                
                // Three White Soldiers / Three Black Crows
                if (firstIsBullish && secondIsBullish && thirdIsBullish &&
                    first.close < second.open && second.close < third.open &&
                    firstBody > 0 && secondBody > 0 && thirdBody > 0) {
                    
                    this.addPatternMarker(i, 'Three White Soldiers', 'bullish', 0.85);
                }
                
                if (firstIsBearish && secondIsBearish && thirdIsBearish &&
                    first.close > second.open && second.close > third.open &&
                    firstBody > 0 && secondBody > 0 && thirdBody > 0) {
                    
                    this.addPatternMarker(i, 'Three Black Crows', 'bearish', 0.85);
                }
                
                // Three Inside Up/Down
                if (firstIsBearish && 
                    secondBody <= firstBody * 0.7 && 
                    second.open < first.close && 
                    second.close > firstMid && 
                    thirdIsBullish && 
                    third.close > second.close) {
                    
                    this.addPatternMarker(i, 'Three Inside Up', 'bullish', 0.75);
                }
                
                if (firstIsBullish && 
                    secondBody <= firstBody * 0.7 && 
                    second.open > first.close && 
                    second.close < firstMid && 
                    thirdIsBearish && 
                    third.close < second.close) {
                    
                    this.addPatternMarker(i, 'Three Inside Down', 'bearish', 0.75);
                }
            }
        }

        detectComplexPatterns() {
            // Head and Shoulders / Inverse Head and Shoulders
            for (let i = 5; i < this.data.length; i++) {
                const leftShoulder = this.data[i-4];
                const leftShoulderHigh = leftShoulder.high;
                
                const head = this.data[i-2];
                const headHigh = head.high;
                
                const rightShoulder = this.data[i];
                const rightShoulderHigh = rightShoulder.high;
                
                const necklineStart = this.data[i-3];
                const necklineEnd = this.data[i-1];
                
                // Head and Shoulders
                if (headHigh > leftShoulderHigh && 
                    headHigh > rightShoulderHigh && 
                    Math.abs(leftShoulderHigh - rightShoulderHigh) <= leftShoulderHigh * 0.01 &&
                    necklineStart.low < necklineEnd.low) {
                    
                    this.addPatternMarker(i, 'Head & Shoulders', 'bearish', 0.9);
                }
                
                // Inverse Head and Shoulders
                const leftShoulderLow = leftShoulder.low;
                const headLow = head.low;
                const rightShoulderLow = rightShoulder.low;
                
                if (headLow < leftShoulderLow && 
                    headLow < rightShoulderLow && 
                    Math.abs(leftShoulderLow - rightShoulderLow) <= leftShoulderLow * 0.01 &&
                    necklineStart.high > necklineEnd.high) {
                    
                    this.addPatternMarker(i, 'Inverse H&S', 'bullish', 0.9);
                }
            }
            
            // Double Top/Bottom
            for (let i = 3; i < this.data.length; i++) {
                const firstTop = this.data[i-2];
                const secondTop = this.data[i];
                const trough = this.data[i-1];
                
                // Double Top
                if (Math.abs(firstTop.high - secondTop.high) <= firstTop.high * 0.01 &&
                    trough.low < firstTop.high * 0.98) {
                    
                    this.addPatternMarker(i, 'Double Top', 'bearish', 0.85);
                }
                
                // Double Bottom
                if (Math.abs(firstTop.low - secondTop.low) <= firstTop.low * 0.01 &&
                    trough.high > firstTop.low * 1.02) {
                    
                    this.addPatternMarker(i, 'Double Bottom', 'bullish', 0.85);
                }
            }
            
            // Triangles
            for (let i = 10; i < this.data.length; i++) {
                const highs = [];
                const lows = [];
                
                for (let j = 0; j < 5; j++) {
                    highs.push(this.data[i-j].high);
                    lows.push(this.data[i-j].low);
                }
                
                const maxHigh = Math.max(...highs);
                const minHigh = Math.min(...highs);
                const maxLow = Math.max(...lows);
                const minLow = Math.min(...lows);
                
                // Ascending Triangle
                if ((maxHigh - minHigh) <= maxHigh * 0.01 && 
                    (maxLow - minLow) >= maxLow * 0.03 &&
                    lows.sort((a,b) => a - b).every((val, idx, arr) => idx === 0 || val >= arr[idx-1])) {
                    
                    this.addPatternMarker(i, 'Ascending Triangle', 'bullish', 0.8);
                }
                
                // Descending Triangle
                if ((maxLow - minLow) <= maxLow * 0.01 && 
                    (maxHigh - minHigh) >= maxHigh * 0.03 &&
                    highs.sort((a,b) => b - a).every((val, idx, arr) => idx === 0 || val <= arr[idx-1])) {
                    
                    this.addPatternMarker(i, 'Descending Triangle', 'bearish', 0.8);
                }
                
                // Symmetrical Triangle
                if ((maxHigh - minHigh) >= maxHigh * 0.03 && 
                    (maxLow - minLow) >= maxLow * 0.03 &&
                    highs.sort((a,b) => b - a).every((val, idx, arr) => idx === 0 || val <= arr[idx-1]) &&
                    lows.sort((a,b) => a - b).every((val, idx, arr) => idx === 0 || val >= arr[idx-1])) {
                    
                    this.addPatternMarker(i, 'Symmetrical Triangle', 'neutral', 0.7);
                }
            }
            
            // Flags and Pennants
            for (let i = 8; i < this.data.length; i++) {
                const poleStart = this.data[i-7];
                const poleEnd = this.data[i-5];
                const flagStart = this.data[i-4];
                const flagEnd = this.data[i];
                
                // Bull Flag
                if (poleStart.close < poleStart.open && 
                    poleEnd.close > poleEnd.open && 
                    poleEnd.close > poleStart.close * 1.03 &&
                    flagStart.high < flagEnd.high &&
                    flagStart.low > flagEnd.low) {
                    
                    this.addPatternMarker(i, 'Bull Flag', 'bullish', 0.85);
                }
                
                // Bear Flag
                if (poleStart.close > poleStart.open && 
                    poleEnd.close < poleEnd.open && 
                    poleEnd.close < poleStart.close * 0.97 &&
                    flagStart.high > flagEnd.high &&
                    flagStart.low < flagEnd.low) {
                    
                    this.addPatternMarker(i, 'Bear Flag', 'bearish', 0.85);
                }
                
                // Pennant (similar but with converging trendlines)
                if (Math.abs(poleStart.close - poleEnd.close) >= poleStart.close * 0.05 &&
                    flagStart.high > flagEnd.high &&
                    flagStart.low < flagEnd.low) {
                    
                    const sentiment = poleEnd.close > poleStart.close ? 'bullish' : 'bearish';
                    this.addPatternMarker(i, 'Pennant', sentiment, 0.8);
                }
            }
        }

        addPatternMarker(candleIndex, patternName, sentiment, strength) {
            const candle = this.data[candleIndex];
            const marker = document.createElement('div');
            marker.className = 'pattern-marker';
            marker.style.backgroundColor = sentiment === 'bullish' ? '#26a69a' : 
                                        sentiment === 'bearish' ? '#ef5350' : '#9E9E9E';
            marker.style.border = '2px solid ' + (sentiment === 'bullish' ? '#1b5e20' : 
                                                sentiment === 'bearish' ? '#b71c1c' : '#424242');
            
            // Position the marker at the high or low depending on pattern type
            const isTopPattern = patternName.includes('Top') || patternName.includes('Shooting') || 
                                patternName.includes('Bearish') || patternName === 'Head & Shoulders';
            const isBottomPattern = patternName.includes('Bottom') || patternName.includes('Hammer') || 
                                patternName.includes('Bullish') || patternName === 'Inverse H&S';
            
            const yPos = isTopPattern ? candle.high : isBottomPattern ? candle.low : (candle.high + candle.low) / 2;
            
            // Convert to pixel coordinates
            const priceScale = chart.priceScale();
            const timeScale = chart.timeScale();
            
            const coordinate = chart.timeToCoordinate(candle.time);
            const priceCoordinate = priceScale.priceToCoordinate(yPos);
            
            if (coordinate === null || priceCoordinate === null) return;
            
            const container = document.getElementById('pattern-markers-container');
            marker.style.left = `${coordinate}px`;
            marker.style.top = `${priceCoordinate}px`;
            container.appendChild(marker);
            
            // Create info window
            const infoWindow = document.createElement('div');
            infoWindow.className = 'pattern-info-window';
            infoWindow.style.left = `${coordinate + 10}px`;
            infoWindow.style.top = `${priceCoordinate - 50}px`;
            
            infoWindow.innerHTML = `
                <h4>${patternName}</h4>
                <p>${new Date(candle.time * 1000).toLocaleString()}</p>
                <p class="strength ${sentiment}">${Math.round(strength * 100)}% strength</p>
            `;
            
            container.appendChild(infoWindow);
            
            // Show/hide on hover
            marker.addEventListener('mouseenter', () => {
                infoWindow.style.display = 'block';
            });
            
            marker.addEventListener('mouseleave', () => {
                infoWindow.style.display = 'none';
            });
            
            this.patternMarkers.push(marker);
            this.infoWindows.push(infoWindow);
        }
    }


    const patternDetector = new CandlestickPatternDetector(priceData);

    // Add pattern detection button
    const patternDetectionBtn = document.createElement('button');
    patternDetectionBtn.id = 'pattern-detection-btn';
    patternDetectionBtn.textContent = 'Detect Patterns';
    document.getElementById('indicator-toolbar').appendChild(patternDetectionBtn);
    
    patternDetectionBtn.addEventListener('click', () => {
        patternDetector.detectAllPatterns();
    });
    
    // Auto-detect patterns on load
    patternDetector.detectAllPatterns();
    
    // Update pattern markers when chart is scrolled/zoomed
    chart.subscribeVisibleLogicalRangeChange(() => {
        patternDetector.detectAllPatterns();
    });




    // Event listeners for drawing tools
    document.getElementById('cursor-btn').addEventListener('click', () => setActiveTool(null));
    document.getElementById('line-btn').addEventListener('click', () => setActiveTool('line'));
    document.getElementById('ray-btn').addEventListener('click', () => setActiveTool('ray'));
    document.getElementById('hline-btn').addEventListener('click', () => setActiveTool('horizontal'));
    document.getElementById('vline-btn').addEventListener('click', () => setActiveTool('vertical'));
    document.getElementById('trendline-btn').addEventListener('click', () => setActiveTool('trendline'));
    document.getElementById('fib-retracement-btn').addEventListener('click', () => setActiveTool('fib-retracement'));
    document.getElementById('rectangle-btn').addEventListener('click', () => setActiveTool('rectangle'));
    document.getElementById('ellipse-btn').addEventListener('click', () => setActiveTool('ellipse'));
    document.getElementById('arrow-btn').addEventListener('click', () => setActiveTool('arrow'));
    document.getElementById('gann-btn').addEventListener('click', () => setActiveTool('gann-fan'));
    
    document.getElementById('clear-btn').addEventListener('click', () => {
        drawings.forEach(drawing => {
            if (drawing.line) chart.removeSeries(drawing.line);
            if (drawing.rect) chart.removeShape(drawing.rect);
            if (drawing.ellipse) chart.removeShape(drawing.ellipse);
            if (drawing.fibRetracement) drawing.fibRetracement.forEach(s => chart.removeSeries(s));
            if (drawing.gannFan) drawing.gannFan.forEach(s => chart.removeSeries(s));
        });
        drawings = [];
    });

    // Chart event subscriptions
    chart.subscribeCrosshairMove(handleCrosshairMove);
    chart.subscribeClick(handleClick);

    // Modal event listeners
    document.getElementById('save-drawings-btn').addEventListener('click', () => {
        document.getElementById('drawings-modal-title').textContent = 'Save Drawings';
        document.getElementById('drawings-name').value = '';
        document.getElementById('drawings-description').value = '';
        document.getElementById('delete-drawings-btn').style.display = 'none';
        document.getElementById('confirm-drawings-btn').textContent = 'Save';
        drawingsModal.style.display = 'block';
        updateSavedDrawingsList();
    });

    document.getElementById('load-drawings-btn').addEventListener('click', () => {
        document.getElementById('drawings-modal-title').textContent = 'Load Drawings';
        document.getElementById('drawings-name').value = '';
        document.getElementById('drawings-description').value = '';
        document.getElementById('delete-drawings-btn').style.display = 'none';
        document.getElementById('confirm-drawings-btn').textContent = 'Load';
        drawingsModal.style.display = 'block';
        updateSavedDrawingsList();
    });

    document.getElementById('confirm-drawings-btn').addEventListener('click', () => {
        const action = document.getElementById('confirm-drawings-btn').textContent;
        const name = document.getElementById('drawings-name').value;
        const description = document.getElementById('drawings-description').value;

        if (action === 'Save') {
            saveDrawings(name, description);
        } else if (action === 'Load') {
            loadDrawings(name);
        }

        drawingsModal.style.display = 'none';
    });

    document.getElementById('delete-drawings-btn').addEventListener('click', () => {
        const name = document.getElementById('drawings-name').value;
        if (name) {
            deleteDrawings(name);
            updateSavedDrawingsList();
            drawingsModal.style.display = 'none';
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target == drawingsModal) {
            drawingsModal.style.display = 'none';
        }
    });

    return (
        <script>
            <div id="container">
                <div id="toolbar">
                    <div class="toolbar-section">
                        <span>Drawing Tools:</span>
                        <button id="cursor-btn" class="active">Cursor</button>
                        <button id="line-btn">Line</button>
                        <button id="ray-btn">Ray</button>
                        <button id="hline-btn">Horizontal</button>
                        <button id="vline-btn">Vertical</button>
                        <button id="trendline-btn">Trendline</button>
                        <button id="fib-retracement-btn">Fib Retracement</button>
                        <button id="rectangle-btn">Rectangle</button>
                        <button id="ellipse-btn">Ellipse</button>
                        <button id="arrow-btn">Arrow</button>
                        <button id="gann-btn">Gann Fan</button>
                        <button id="clear-btn">Clear All</button>
                    </div>
                    
                    <div class="timeframe-selector">
                        <select id="timeframe-select">
                            <option value="1">1m</option>
                            <option value="5">5m</option>
                            <option value="15">15m</option>
                            <option value="30">30m</option>
                            <option value="60">1h</option>
                            <option value="240">4h</option>
                            <option value="1D">1D</option>
                            <option value="1W">1W</option>
                        </select>
                        <button id="save-drawings-btn">Save Drawings</button>
                        <button id="load-drawings-btn">Load Drawings</button>
                    </div>
                </div>
            
                <div id="indicator-toolbar">
                    <div class="toolbar-section">
                        <span>Indicators:</span>
                        <button id="sma-btn">SMA</button>
                        <button id="ema-btn">EMA</button>
                        <button id="rsi-btn">RSI</button>
                        <button id="macd-btn">MACD</button>
                        <button id="bollinger-btn">Bollinger</button>
                        <button id="volume-btn">Volume</button>
                        <button id="atr-btn">ATR</button>
                        <button id="stochastic-btn">Stochastic</button>
                        <button id="elder-ray-btn">Elder Ray</button>
                        <button id="ttm-squeeze-btn">TTM Squeeze</button>
                        <button id="remove-indicators-btn">Remove Indicators</button>
                    </div>
                </div>
            
                <div id="advanced-toolbar">
                    <div class="toolbar-section">
                        <span>Advanced Tools:</span>
                        <button id="elliott-wave-btn" class="pattern-recognition-btn">Elliott Wave</button>
                        <button id="head-shoulders-btn" class="pattern-recognition-btn">Head & Shoulders</button>
                        <button id="double-top-btn" class="pattern-recognition-btn">Double Top/Bottom</button>
                        <button id="triangle-btn" class="pattern-recognition-btn">Triangles</button>
                        <button id="wedge-btn" class="pattern-recognition-btn">Wedges</button>
                        <button id="flags-btn" class="pattern-recognition-btn">Flags/Pennants</button>
                    </div>
                </div>
                <div id="pattern-markers-container"></div>
                <div id="chart-container">
                    <div id="volume-container"></div>
                    <div id="price-chart"></div>
                </div>
            </div>
            
            <div id="indicator-settings-modal" class="modal">
                <div class="modal-content">
                    <h3 id="indicator-modal-title">Indicator Settings</h3>
                    <div id="indicator-settings-form">
                        {/* <!-- Dynamic content will be inserted here --> */}
                    </div>
                    <div class="modal-buttons">
                        <button id="cancel-indicator-btn">Cancel</button>
                        <button id="apply-indicator-btn">Apply</button>
                    </div>
                </div>
            </div>

            <div id="drawings-modal" class="modal">
                <div class="modal-content">
                    <h3 id="drawings-modal-title">Drawing Management</h3>
                    <div id="drawings-modal-content">
                        <label for="drawings-name">Name:</label>
                        {/* <input type="text" id="drawings-name" placeholder="Enter drawing set name"> */}
                        <label for="drawings-description">Description:</label>
                        {/* <input type="text" id="drawings-description" placeholder="Optional description"> */}
                        <div id="saved-drawings-list"></div>
                    </div>
                    <div class="modal-buttons">
                        <button id="cancel-drawings-btn">Cancel</button>
                        <button id="confirm-drawings-btn">Confirm</button>
                        <button id="delete-drawings-btn" style="display: none;">Delete</button>
                    </div>
                </div>
            </div>
        </script>    
    );
};

export default Chart;