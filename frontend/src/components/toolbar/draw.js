export class DrawingManager {
  constructor(chart = null) {
    this.chart = chart;
    this.drawings = [];
    this.selectedDrawingId = null;
    this.activeToolType = null;
    this.startPoint = null;
    this.isDrawing = false;
    this.isHovering = false;
    this.isUpdatingLine = false;
    this.isDragging = false;
    this.dragStartPoint = null;
    this.dragStartData = null;
    this.selectedPointIndex = null;
    this.hoverThreshold = 0.01;
    this.lastCrosshairPosition = null;
    this.isUpdatingFibLevels = false;
    this.isProcessingClick = false;
    this.isRemovingSeries = false;
    this.isLoadingDrawings = false;
    
    // Default colors
    this.colors = {
      trendLine: 'dodgerblue',
      priceLevel: '#26a69a',
      fibRetracement: '#9B7DFF',
      fibExtension: '#FB680C',
      rectangle: 'rgba(255, 255, 255, 0.7)',
      selected: 'orange'
    };
    
    // Fibonacci levels
    this.fibRetracement = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
    this.fibExtension = [0, 0.618, 1, 1.618, 2.618, 3.618, 4.236];
  }

  setChart(chart) {
    this.chart = chart;
  }

  setActiveTool(toolType) {
    this.activeToolType = toolType;
    if (toolType === null) {
      this.endDrawing();
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
    
    try {      
      if (this.isHovering && !this.isDrawing && this) {
        this.startDragging(time, price);
        return;
      }
      
      if (!this.isDrawing) {
        this.startDrawing(time, price);
      } else {
        this.completeDrawing(time, price);
      }
    } finally {
      this.isProcessingClick = false;
    }
  }

  handleCrosshairMove(time, price, logical) {
    if (!this.chart || this.isUpdatingLine) return;
    
    this.lastCrosshairPosition = { x: time, y: price };
    
    if (this.isDrawing && this.startPoint) {
      this.updateDrawingPreview(time, price);
    } else if (this.isDragging && this.dragStartPoint && this.selectedDrawingId) {
      this.updateDraggedDrawing(time, price);
    } else if (!this.activeToolType) {
      this.checkHoverState(time, price);
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
      
      if (drawing.type === 'fibRetracement' || drawing.type === 'fibExtension') {
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
      
      const updatedPoints = this.getUpdatedPoints(drawing.type, this.startPoint, { time, value: price });
      drawing.points = updatedPoints;
      
      if (drawing.type === 'fibRetracement' || drawing.type === 'fibExtension') {
        this.updateFibonacciLevels(drawing);
      } else {
        drawing.series.setData(updatedPoints);
      }
      
      this.isDrawing = false;
      this.startPoint = null;
    } finally {
      this.isUpdatingLine = false;
    }
  }

  getUpdatedPoints(type, startPoint, endPoint) {
    switch (type) {
      case 'trendLine':
      case 'fibRetracement':
      case 'fibExtension':
        return [startPoint, endPoint];
      
      case 'priceLevel':
        return [
          { time: startPoint.time, value: endPoint.value },
          { time: endPoint.time, value: endPoint.value }
        ];
      
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
    
    switch (type) {
      case 'trendLine':
      case 'priceLevel':
        return this.chart.addLineSeries({
          color,
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false
        });
      
      case 'fibRetracement':
      case 'fibExtension':
        return this.chart.addLineSeries({
          color,
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false
        });
      
      case 'rectangle':
        return this.chart.addLineSeries({
          color,
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          lineType: 2
        });
      
      default:
        return null;
    }
  }

  getDefaultColor(type) {
    switch (type) {
      case 'trendLine': return this.colors.trendLine;
      case 'priceLevel': return this.colors.priceLevel;
      case 'fibRetracement': return this.colors.fibRetracement;
      case 'fibExtension': return this.colors.fibExtension;
      case 'rectangle': return this.colors.rectangle;
      default: return 'white';
    }
  }

  updateFibonacciLevels(drawing) {
    if (this.isUpdatingFibLevels) return;
    
    try {
      this.isUpdatingFibLevels = true;
      this.isUpdatingLine = true;
      
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
      drawing.series.setData([drawing.points[0], drawing.points[1]]);
      
      const start = drawing.points[0];
      const end = drawing.points[1];
      const priceDiff = end.value - start.value;
      
      // Create new level series
      drawing.fibLevels.forEach(level => {
        const value = drawing.type === 'fibRetracement'
          ? end.value - (priceDiff * level)
          : start.value + (priceDiff * level);
        
        const levelId = `${drawing.id}_fib_${level}`;
        
        // Skip if this level series already exists
        if (fibLevelIds.has(levelId)) return;
        
        const levelSeries = this.chart?.addLineSeries({
          color: drawing.color,
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: true,
          title: level.toString(),
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
            color: drawing.color
          });
        }
      });
    } finally {
      this.isUpdatingFibLevels = false;
      this.isUpdatingLine = false;
    }
  }

  checkHoverState(time, price) {
    if (this.isUpdatingLine || this.activeToolType) return;
    
    try {
      this.isUpdatingLine = true;
      let isHoveringAny = false;
      
      for (const drawing of this.drawings) {
        if (drawing.id.includes('_fib_')) continue;
        
        const isHovered = this.isDrawingHovered(drawing, time, price);
        
        if (isHovered && !isHoveringAny) {
          isHoveringAny = true;
          this.isHovering = true;
          
          if (this.selectedDrawingId !== drawing.id) {
            if (this.selectedDrawingId) {
              const prevSelected = this.drawings.find(d => d.id === this.selectedDrawingId);
              if (prevSelected) {
                prevSelected.isSelected = false;
                prevSelected.series.applyOptions({ 
                  color: this.getDefaultColor(prevSelected.type)
                });
              }
            }
            
            this.selectedDrawingId = drawing.id;
            drawing.isSelected = true;
            drawing.series.applyOptions({ color: this.colors.selected });
          }
        }
      }
      
      if (!isHoveringAny && this.isHovering) {
        this.isHovering = false;
      }
    } finally {
      this.isUpdatingLine = false;
    }
  }

  isDrawingHovered(drawing, time, price) {
    if (drawing.points.length < 2) return false;
    
    for (let i = 0; i < drawing.points.length; i++) {
      const point = drawing.points[i];
      const isOnPoint = 
        Math.abs(time - point.time) < (drawing.type === 'rectangle' ? 5 : 2) && 
        Math.abs((price - point.value) / price) < this.hoverThreshold;
      
      if (isOnPoint) {
        this.selectedPointIndex = i;
        return true;
      }
    }
    
    if (drawing.type === 'trendLine' || drawing.type === 'priceLevel') {
      const p1 = drawing.points[0];
      const p2 = drawing.points[1];
      
      if (drawing.type === 'priceLevel' && Math.abs((price - p1.value) / price) < this.hoverThreshold) {
        return true;
      }
      
      if (drawing.type === 'trendLine') {
        const m = (p2.value - p1.value) / (p2.time - p1.time);
        const b = p1.value - m * p1.time;
        const expectedY = m * time + b;
        
        if (Math.abs((price - expectedY) / price) < this.hoverThreshold) {
          return true;
        }
      }
    }
    
    if (drawing.type === 'rectangle' && drawing.points.length >= 4) {
      const minX = Math.min(...drawing.points.map(p => p.time));
      const maxX = Math.max(...drawing.points.map(p => p.time));
      const minY = Math.min(...drawing.points.map(p => p.value));
      const maxY = Math.max(...drawing.points.map(p => p.value));
      
      if (time >= minX && time <= maxX && price >= minY && price <= maxY) {
        return true;
      }
    }
    
    return false;
  }

  startDragging(time, price) {
    if (this.isUpdatingLine) return;
    
    try {
      this.isUpdatingLine = true;
      if (!this.selectedDrawingId) return;
      
      this.isDragging = true;
      this.dragStartPoint = { x: time, y: price };
      
      const drawing = this.drawings.find(d => d.id === this.selectedDrawingId);
      if (drawing) {
        this.dragStartData = [...drawing.points];
      }
    } finally {
      this.isUpdatingLine = false;
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
          if (this.selectedPointIndex === 0 || this.selectedPointIndex === 4) {
            newPoints[1].time = newPoints[0].time;
            newPoints[4].time = newPoints[0].time;
            newPoints[3].value = newPoints[0].value;
            newPoints[4].value = newPoints[0].value;
          } else if (this.selectedPointIndex === 1) {
            newPoints[0].time = newPoints[1].time;
            newPoints[4].time = newPoints[1].time;
            newPoints[2].value = newPoints[1].value;
            newPoints[1].value = newPoints[1].value;
          } else if (this.selectedPointIndex === 2) {
            newPoints[1].time = newPoints[2].time;
            newPoints[3].time = newPoints[2].time;
            newPoints[1].value = newPoints[2].value;
            newPoints[2].value = newPoints[2].value;
          } else if (this.selectedPointIndex === 3) {
            newPoints[0].time = newPoints[3].time;
            newPoints[4].time = newPoints[3].time;
            newPoints[0].value = newPoints[3].value;
            newPoints[4].value = newPoints[3].value;
          }
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

  endDrawing() {
    this.isDrawing = false;
    this.startPoint = null;
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