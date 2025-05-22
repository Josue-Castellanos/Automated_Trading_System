export class DrawingManager {
    constructor(chart = null) {
        this.chart = chart;
        this.drawings = [];
        this.selectedDrawingId = null;
        this.prevSelected = null;
        this.activeToolType = null;
        this.startPoint = null;
        this.midPoint = null; // Added for fibonacci extension
        this.isDrawing = false;
        this.isHovering = false;
        this.isUpdatingLine = false;
        this.isDragging = false;
        this.dragStartPoint = null;
        this.dragStartData = null;
        this.selectedPointIndex = null;
        this.hoverThreshold = 0.002;
        this.lastCrosshairPosition = null;
        this.isUpdatingFibLevels = false;
        this.isProcessingClick = false;
        this.isRemovingSeries = false;
        this.isLoadingDrawings = false;
        this.drawingPhase = 0; // For multi-phase drawings like fib extension
        this.domElement = null; // Reference to the chart's DOM element
        
        // Default colors with opacity support
        this.colors = {
        trendLine: 'rgba(30, 144, 255, 0.8)', // dodgerblue
        priceLevel: 'rgba(38, 166, 154, 0.8)', // #26a69a
        fibRetracement: 'rgba(155, 125, 255, 0.8)', // #9B7DFF
        fibExtension: 'rgba(251, 104, 12, 0.8)', // #FB680C
        rectangle: 'rgba(255, 255, 255, 0.7)',
        selected: 'rgba(255, 165, 0, 0.8)', // orange
        pitchfork: 'rgba(255, 99, 71, 0.8)', // tomato
        channel: 'rgba(50, 205, 50, 0.8)', // limegreen
        rayLine: 'rgba(238, 130, 238, 0.8)', // violet
        horizontalRay: 'rgba(255, 215, 0, 0.8)', // gold
        verticalLine: 'rgba(135, 206, 235, 0.8)' // skyblue
        };
        
        // Fibonacci levels with labels
        this.fibRetracement = [
        { level: 0, label: '0%' },
        { level: 0.236, label: '23.6%' },
        { level: 0.382, label: '38.2%' },
        { level: 0.5, label: '50%' },
        { level: 0.618, label: '61.8%' },
        { level: 0.786, label: '78.6%' },
        { level: 1, label: '100%' }
        ];
        
        this.fibExtension = [
        { level: 0, label: '0%' },
        { level: 0.618, label: '61.8%' },
        { level: 1, label: '100%' },
        { level: 1.618, label: '161.8%' },
        { level: 2.618, label: '261.8%' },
        { level: 3.618, label: '361.8%' },
        { level: 4.236, label: '423.6%' }
        ];
    }

    setChart(chart) {
        this.chart = chart;
        if (chart) {
        this.domElement = chart.chartElement?.parentElement || null;
        }
    }

    setActiveTool(toolType) {
        this.activeToolType = toolType;
        this.drawingPhase = 0;
        if (toolType === null) {
        this.endDrawing();
        }
    }

    setColor(toolType, color) {
        if (this.colors.hasOwnProperty(toolType)) {
        this.colors[toolType] = color;
        }
    }

    setFibLevels(type, levels) {
        if (type === 'fibRetracement') {
        this.fibRetracement = levels.map(level => ({
            level: parseFloat(level),
            label: `${(level * 100).toFixed(1)}%`
        }));
        } else if (type === 'fibExtension') {
        this.fibExtension = levels.map(level => ({
            level: parseFloat(level),
            label: `${(level * 100).toFixed(1)}%`
        }));
        }
    }

    getActiveTool() {
        return this.activeToolType;
    }

    getSelectedDrawingId() {
        return this.selectedDrawingId;
    }

    hasSelectedDrawing() {
        return this.selectedDrawingId !== null;
    }

    handleClick(time, price) {
        if (!this.chart || !this.activeToolType || this.isUpdatingLine) return;
        
        if (this.isHovering && !this.isDrawing) {
            this.startDragging(time, price);
            return;
        }
        
        if (this.activeToolType === 'fibExtension') {
            this.handleFibExtensionClick(time, price);
        } 
        else if (!this.isDrawing) {
            this.startDrawing(time, price);
        } 
        else {
            this.completeDrawing(time, price);
        }
    } 

    handleFibExtensionClick(time, price) {
        if (this.isUpdatingLine) return;
        try {   
            
            this.isUpdatingLine = true;

        if (this.drawingPhase === 0) {
            this.startDrawing(time, price);
            this.drawingPhase = 1;
        } else if (this.drawingPhase === 1) {
            this.midPoint = { time, value: price };
            this.drawingPhase = 2;
            
            // Update preview with mid point
            const drawing = this.drawings.find(d => d.id === this.selectedDrawingId);
            if (drawing) {
            drawing.points = [this.startPoint, this.midPoint];
            drawing.series.setData(drawing.points);
            }
        } else {
            this.completeDrawing(time, price);
            this.drawingPhase = 0;
            this.midPoint = null;
        }
        } finally {
        this.isUpdatingLine = false;
        }
    }

    handleCrosshairMove(time, price) {
        if (!this.chart || this.isUpdatingLine) return;
    
        this.lastCrosshairPosition = { x: time, y: price };
        
        if (this.isDrawing && this.startPoint) {
            if (this.activeToolType === 'fibExtension' && this.drawingPhase === 2) {
                this.updateFibExtensionPreview(time, price);
            } else {
                this.updateDrawingPreview(time, price);
            }
        } 
        else if (this.isDragging && this.dragStartPoint && this.selectedDrawingId) {
            this.updateDraggedDrawing(time, price);
        } 
        else {
            this.handleHoverEffect(time, price);
        }
    }

    // New method to handle hover effects
    handleHoverEffect(time, price) {
        if (this.activeToolType) return; // Don't check hover when a tool is active
        
        let foundHoveredDrawing = false;
        
        for (const drawing of this.drawings) {
            if (drawing.id.includes('_fib_')) continue;
        
        const isHovered = this.isDrawingHovered(drawing, time, price);
        
        if (isHovered && !foundHoveredDrawing) {
            foundHoveredDrawing = true;
            
            if (!drawing.isHovered) {
            this.startHover(drawing);
            }
        } else if (!isHovered && drawing.isHovered) {
            this.endHover(drawing);
        }
        }
        
        // // If we're not hovering over any drawing anymore
        // if (!foundHoveredDrawing && this.isHovering) {
        // this.isHovering = false;
        // if (this.domElement) {
        //     this.domElement.style.cursor = 'default';
        // }
        // if (this.chart) {
        //     this.chart.applyOptions({ handleScroll: true, handleScale: true });
        // }
        // }
    }
    
    // Start hover state for a drawing
    startHover(drawing) {
        drawing.isHovered = true;
        this.isHovering = true;
        this.selectedDrawingId = drawing.id;
        
        // Store original color if not already stored
        if (!drawing.originalColor) {
        drawing.originalColor = drawing.color || this.getDefaultColor(drawing.type);
        }
        
        // Apply hover styling
        drawing.series.applyOptions({ color: this.colors.selected });
        
        // Update cursor and chart options
        if (this.domElement) {
        this.domElement.style.cursor = 'pointer';
        }
        if (this.chart) {
        this.chart.applyOptions({ handleScroll: false, handleScale: false });
        }
    }
    
    // End hover state for a drawing
    endHover(drawing) {
        drawing.isHovered = false;
        this.isHovering = false;
        
        // Restore original color
        const originalColor = drawing.originalColor || this.getDefaultColor(drawing.type);
        drawing.series.applyOptions({ color: originalColor });
        
        // Clear selected ID if it matches this drawing
        if (this.selectedDrawingId === drawing.id && !this.isDragging) {
        this.selectedDrawingId = null;
        }
    }

    updateFibExtensionPreview(time, price) {
        if (!this.startPoint || !this.midPoint || !this.selectedDrawingId || this.isUpdatingLine) return;
        try {
        this.isUpdatingLine = true;
        const drawing = this.drawings.find(d => d.id === this.selectedDrawingId);
        if (!drawing) return;
        
        // Calculate extension points
        const points = [
            this.startPoint,
            this.midPoint,
            { time, value: price }
        ];
        
        drawing.points = points;
        drawing.series.setData(points);
        this.updateFibonacciLevels(drawing);
        } finally {
        this.isUpdatingLine = false;
        }
    }

    deleteSelected() {
        if (!this.selectedDrawingId || !this.chart || this.isRemovingSeries) return;
        
        try {
        this.isRemovingSeries = true;
        const index = this.drawings.findIndex(d => d.id === this.selectedDrawingId);
        if (index !== -1) {
            try {
            this.chart.removeSeries(this.drawings[index].series);
            this.drawings.splice(index, 1);
            this.selectedDrawingId = null;
            } catch (error) {
            console.error('Error removing series:', error);
            }
        }
        } finally {
        this.isRemovingSeries = false;
        }
    }

    clearAll() {
        if (!this.chart || this.isRemovingSeries) return;
        
        try {
        this.isRemovingSeries = true;
        this.drawings.forEach(drawing => {
            try {
            this.chart?.removeSeries(drawing.series);
            } catch (error) {
            console.error('Error removing series:', error);
            }
        });
        
        this.drawings = [];
        this.selectedDrawingId = null;
        } finally {
        this.isRemovingSeries = false;
        }
    }

    generateId() {
        return Math.random().toString(36).substring(2, 9);
    }

    startDrawing(time, price) {
        if (this.isUpdatingLine) return;
        
        try {
        this.isUpdatingLine = true;
        this.isDrawing = true;
        this.startPoint = { time, value: price };
        
        const previewId = this.generateId();
        const previewSeries = this.createDrawingSeries(this.activeToolType);
        
        if (previewSeries) {
            const newDrawing = {
            id: previewId,
            type: this.activeToolType,
            series: previewSeries,
            points: [{ time, value: price }],
            isSelected: true,
            isHovered: false,
            color: this.getDefaultColor(this.activeToolType)
            };
            
            if (this.activeToolType === 'fibRetracement') {
            newDrawing.fibLevels = this.fibRetracement;
            } else if (this.activeToolType === 'fibExtension') {
            newDrawing.fibLevels = this.fibExtension;
            }
            
            this.drawings.push(newDrawing);
            this.selectedDrawingId = previewId;
        }
        } finally {
        this.isUpdatingLine = false;
        }
    }

    updateDrawingPreview(time, price) {
        if (this.isUpdatingLine) return;
        
        try {
        this.isUpdatingLine = true;
        if (!this.startPoint || !this.selectedDrawingId) return;
        
        const drawing = this.drawings.find(d => d.id === this.selectedDrawingId);
        if (!drawing) return;
        
        const updatedPoints = this.getUpdatedPoints(drawing.type, this.startPoint, { time, value: price });
        drawing.points = updatedPoints;
        
        if (drawing.type === 'fibRetracement') {
            this.updateFibonacciLevels(drawing);
        } else {
            drawing.series.setData(drawing.points);
        }
        } finally {
        this.isUpdatingLine = false;
        }
    }

    completeDrawing(time, price) {
        if (!this.startPoint || !this.selectedDrawingId || !this.activeToolType || this.isUpdatingLine) return;
        
        try {
        this.isUpdatingLine = true;
        const drawing = this.drawings.find(d => d.id === this.selectedDrawingId);
        if (!drawing) return;
        
        let updatedPoints;
        if (drawing.type === 'fibExtension' && this.midPoint) {
            updatedPoints = [this.startPoint, this.midPoint, { time, value: price }];
        } else {
            updatedPoints = this.getUpdatedPoints(drawing.type, this.startPoint, { time, value: price });
        }
        
        drawing.points = updatedPoints;
        
        if (drawing.type === 'fibRetracement' || drawing.type === 'fibExtension') {
            this.updateFibonacciLevels(drawing);
        } else {
            drawing.series.setData(updatedPoints);
        }
        
        this.isDrawing = false;
        this.startPoint = null;
        this.midPoint = null;
        } finally {
        this.isUpdatingLine = false;
        }
    }

    getUpdatedPoints(type, startPoint, endPoint) {
        switch (type) {
        case 'trendLine':
        case 'fibRetracement':
        case 'rayLine':
            return [startPoint, endPoint];
        
        case 'horizontalRay':
            return [
            { time: startPoint.time, value: endPoint.value },
            { time: endPoint.time, value: endPoint.value }
            ];
        
        case 'verticalLine':
            return [
            { time: endPoint.time, value: startPoint.value },
            { time: endPoint.time, value: endPoint.value }
            ];
        
        case 'channel':
            const width = Math.abs(endPoint.value - startPoint.value);
            return [
            startPoint,
            endPoint,
            { time: endPoint.time, value: endPoint.value + width },
            { time: startPoint.time, value: startPoint.value + width }
            ];
        
        case 'pitchfork':
            const midPoint = {
            time: (startPoint.time + endPoint.time) / 2,
            value: (startPoint.value + endPoint.value) / 2
            };
            return [startPoint, midPoint, endPoint];
        
        case 'rectangle':
            return [
            { time: startPoint.time, value: startPoint.value },
            { time: startPoint.time, value: endPoint.value },
            { time: endPoint.time, value: endPoint.value },
            { time: endPoint.time, value: startPoint.value },
            { time: startPoint.time, value: startPoint.value }
            ];
        
        default:
            return [startPoint, endPoint];
        }
    }

    createDrawingSeries(type) {
        if (!this.chart) return null;
        
        const color = this.getDefaultColor(type);
        const baseOptions = {
        color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false
        };
        
        switch (type) {
        case 'trendLine':
        case 'rayLine':
        case 'horizontalRay':
        case 'verticalLine':
            return this.chart.addLineSeries(baseOptions);
        
        case 'pitchfork':
        case 'channel':
            return this.chart.addLineSeries({
            ...baseOptions,
            lineStyle: 2,
            lineWidth: 1
            });
        
        case 'fibRetracement':
        case 'fibExtension':
            return this.chart.addLineSeries({
            ...baseOptions,
            lineWidth: 1
            });
        
        case 'rectangle':
            return this.chart.addLineSeries({
            ...baseOptions,
            lineWidth: 1,
            lineType: 2
            });
        
        default:
            return null;
        }
    }

    getDefaultColor(type) {
        return this.colors[type] || 'white';
    }

    updateFibonacciLevels(drawing) {
        if (this.isUpdatingFibLevels) return;
        
        try {
        this.isUpdatingFibLevels = true;
        
        if (!this.chart || !drawing.fibLevels || drawing.points.length < 2) return;
        
        // Remove existing fib level series
        const fibLevelIds = new Set();
        this.drawings = this.drawings.filter(d => {
            if (d.id.startsWith(drawing.id + '_fib_')) {
            fibLevelIds.add(d.id);
            try {
                this.chart?.removeSeries(d.series);
            } catch (error) {
                console.error('Error removing fib series:', error);
            }
            return false;
            }
            return true;
        });
        
        // Update base line
        drawing.series.setData(drawing.points);
        
        let start, end;
        if (drawing.type === 'fibExtension' && drawing.points.length === 3) {
            // For extension, use all three points
            start = drawing.points[0];
            const pivot = drawing.points[1];
            end = drawing.points[2];
            
            // Calculate the projected price based on the three points
            const initialMove = pivot.value - start.value;
            const projectedMove = initialMove * (end.value > pivot.value ? 1 : -1);
            
            drawing.fibLevels.forEach(({ level, label }) => {
            const value = pivot.value + (projectedMove * level);
            this.createFibLevel(drawing, level, label, pivot, end, value);
            });
        } else {
            // For retracement, use two points
            start = drawing.points[0];
            end = drawing.points[1];
            const priceDiff = end.value - start.value;
            
            drawing.fibLevels.forEach(({ level, label }) => {
            const value = end.value - (priceDiff * level);
            this.createFibLevel(drawing, level, label, start, end, value);
            });
        }
        } finally {
        this.isUpdatingFibLevels = false;
        }
    }

    createFibLevel(drawing, level, label, start, end, value) {
        const levelId = `${drawing.id}_fib_${level}`;
        
        const levelSeries = this.chart?.addLineSeries({
        color: drawing.color,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: true,
        title: label,
        lineType: 1
        });
        
        if (levelSeries) {
        levelSeries.setData([
            { time: start.time, value },
            { time: end.time, value }
        ]);
        
        this.drawings.push({
            id: levelId,
            type: drawing.type,
            series: levelSeries,
            points: [
            { time: start.time, value },
            { time: end.time, value }
            ],
            isSelected: false,
            isHovered: false,
            color: drawing.color
        });
        }
    }


    isDrawingHovered(drawing, time, price) {
        if (drawing.points.length < 2) return false;
        
        const pointTolerance = 0.5; // Half a candle width for time
        const priceTolerance = this.getPriceTolerance(price);

        for (let i = 0; i < drawing.points.length; i++) {
        const point = drawing.points[i];
        if (Math.abs(time - point.time) < pointTolerance && 
            Math.abs(price - point.value) < priceTolerance) {
            this.selectedPointIndex = i;
            return true;
        }
        }
        
        switch (drawing.type) {
        case 'trendLine':
        case 'fibRetracement':
        case 'fibExtension':
            return this.isOnLineSegment(drawing.points[0], drawing.points[1], time, price, priceTolerance);
        
        case 'rayLine':
            return this.isOnLineSegment(drawing.points[0], drawing.points[1], time, price, priceTolerance, true);

        case 'horizontalRay':
            return this.isOnHorizontalLine(drawing.points[0].value, drawing.points[1].time, time, price, priceTolerance);
        
        case 'verticalLine':
            return this.isOnVerticalLine(drawing.points[0].time, drawing.points[0].value, time, price, pointTolerance);
        
        case 'rectangle':        
            return this.isInRectangle(drawing.points, time, price, pointTolerance, priceTolerance);

        case 'channel':
        case 'pitchfork':
            return this.isOnMultiSegmentLine(drawing.points, time, price, priceTolerance);
        
        default:
            return false;
        }
    }

    // Helper methods
    getPriceTolerance(price) {
        // Dynamic tolerance based on price scale
        return price * this.hoverThreshold; // 0.2% of price
    }

    isOnLineSegment(p1, p2, time, price, tolerance, isRay=false) {
        // Check if point is within the segment bounds first
        const minTime = Math.min(p1.time, p2.time);
        const maxTime = Math.max(p1.time, p2.time);
        const minPrice = Math.min(p1.value, p2.value);
        const maxPrice = Math.max(p1.value, p2.value);
        
        // Quick bounds check
        if (time < minTime - 1 || 
            (!isRay && time > maxTime + 1) ||
            price < minPrice - tolerance ||
            price > maxPrice + tolerance) {
            return false;
        }
        
        // Calculate distance from point to line segment
        if (Math.abs(p2.time - p1.time) < 0.0001) { // Vertical line
            return Math.abs(time - p1.time) < 1;
        }
        
        const slope = (p2.value - p1.value) / (p2.time - p1.time);
        const intercept = p1.value - slope * p1.time;
        const expectedPrice = slope * time + intercept;
        
        // Check if within tolerance
        if (Math.abs(price - expectedPrice) > tolerance) {
            return false;
        }
        
        // Check if within segment bounds
        return (time >= minTime && (isRay || time <= maxTime));
    }

    isOnHorizontalLine(linePrice, lineTime, cursorTime, cursorPrice, tolerance) {
        return Math.abs(cursorPrice - linePrice) < tolerance && 
            cursorTime >= lineTime;
    }

    isOnVerticalLine(lineTime, linePrice, cursorTime, cursorPrice, tolerance) {
        return Math.abs(cursorTime - lineTime) < 1 && 
            Math.abs(cursorPrice - linePrice) < tolerance;
    }

    isInRectangle(points, time, price, timeTol, priceTol) {
        if (points.length < 4) return false;
        
        const minTime = Math.min(...points.map(p => p.time)) - timeTol;
        const maxTime = Math.max(...points.map(p => p.time)) + timeTol;
        const minPrice = Math.min(...points.map(p => p.value)) - priceTol;
        const maxPrice = Math.max(...points.map(p => p.value)) + priceTol;
        
        return time >= minTime && time <= maxTime && 
            price >= minPrice && price <= maxPrice;
    }

    isOnMultiSegmentLine(points, time, price, tolerance) {
        for (let i = 0; i < points.length - 1; i++) {
            if (this.isOnLineSegment(
                points[i], 
                points[i + 1], 
                time, 
                price, 
                tolerance
            )) {
                return true;
            }
        }
        return false;
    }

    startDragging(time, price) {    
        if (!this.selectedDrawingId) return;
        
        this.isDragging = true;
        this.dragStartPoint = { x: time, y: price };
        
        const drawing = this.drawings.find(d => d.id === this.selectedDrawingId);
        if (drawing) {

        this.dragStartData = [...drawing.points];
        }
    }

    updateDraggedDrawing(time, price) {
        if (!this.isDragging || !this.dragStartPoint || !this.dragStartData || !this.selectedDrawingId || this.isUpdatingLine) return;
        
        try {
        this.isUpdatingLine = true;

        const drawing = this.drawings.find(d => d.id === this.selectedDrawingId);
        if (!drawing) return;
        
        const deltaX = time - this.dragStartPoint.x;
        const deltaY = price - this.dragStartPoint.y;
        
        let newPoints;
        
        if (this.selectedPointIndex !== null) {
            newPoints = [...this.dragStartData];
            newPoints[this.selectedPointIndex] = {
                time: this.dragStartData[this.selectedPointIndex].time + deltaX,
                value: this.dragStartData[this.selectedPointIndex].value + deltaY
            };
            
            if (drawing.type === 'rectangle' && newPoints.length >= 5) {
            this.updateRectanglePoints(newPoints);
            } else if (drawing.type === 'channel' || drawing.type === 'pitchfork') {
            this.updateMultiPointDrawing(drawing.type, newPoints);
            }
        } else {
            newPoints = this.dragStartData.map(point => ({
            time: point.time + deltaX,
            value: point.value + deltaY
            }));
        }
        
        drawing.points = newPoints;
        drawing.series.setData(newPoints);
        
        if ((drawing.type === 'fibRetracement' || drawing.type === 'fibExtension') && drawing.fibLevels) {
            this.updateFibonacciLevels(drawing);
        }
        } finally {
        this.isUpdatingLine = false;
        }
    }

    updateRectanglePoints(points) {
        if (this.selectedPointIndex === 0 || this.selectedPointIndex === 4) {
        points[1].time = points[0].time;
        points[4].time = points[0].time;
        points[3].value = points[0].value;
        points[4].value = points[0].value;
        } else if (this.selectedPointIndex === 1) {
        points[0].time = points[1].time;
        points[4].time = points[1].time;
        points[2].value = points[1].value;
        } else if (this.selectedPointIndex === 2) {
        points[1].time = points[2].time;
        points[3].time = points[2].time;
        points[1].value = points[2].value;
        } else if (this.selectedPointIndex === 3) {
        points[0].time = points[3].time;
        points[4].time = points[3].time;
        points[0].value = points[3].value;
        points[4].value = points[3].value;
        }
    }

    updateMultiPointDrawing(type, points) {
        if (type === 'channel') {
        const width = Math.abs(points[1].value - points[0].value);
        points[2].value = points[1].value + width;
        points[3].value = points[0].value + width;
        } else if (type === 'pitchfork') {
        points[1].time = (points[0].time + points[2].time) / 2;
        points[1].value = (points[0].value + points[2].value) / 2;
        }
    }

    endDrawing() {
        this.isDrawing = false;
        this.startPoint = null;
        this.midPoint = null;
        this.drawingPhase = 0;
    }

    endDragging() {
        this.isDragging = false;
        this.dragStartPoint = null;
        this.dragStartData = null;
        this.selectedPointIndex = null;
    }

    serializeDrawings() {
        return this.drawings
        .filter(d => !d.id.includes('_fib_'))
        .map(drawing => ({
            id: drawing.id,
            type: drawing.type,
            points: drawing.points,
            color: drawing.color,
            fibLevels: drawing.fibLevels
        }));
    }

    loadDrawings(serializedDrawings) {
        if (!this.chart || this.isLoadingDrawings) return;
        
        try {
        this.isLoadingDrawings = true;
        this.isUpdatingLine = true;
        
        this.clearAll();
        
        serializedDrawings.forEach(data => {
            const series = this.createDrawingSeries(data.type);
            if (series) {
            const drawing = {
                id: data.id || this.generateId(),
                type: data.type,
                series,
                points: data.points,
                isSelected: false,
                isHovered: false,
                color: data.color || this.getDefaultColor(data.type),
                fibLevels: data.fibLevels
            };
            
            series.setData(data.points);
            this.drawings.push(drawing);
            
            if ((data.type === 'fibRetracement' || data.type === 'fibExtension') && data.fibLevels) {
                drawing.fibLevels = data.fibLevels;
                this.updateFibonacciLevels(drawing);
            }
            }
        });
        } finally {
        this.isLoadingDrawings = false;
        this.isUpdatingLine = false;
        }
    }
    }