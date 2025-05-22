import React from 'react';
import { 
  TrendingUp, 
  BarChart as ShowChart, 
  Grid as GridOn, 
  Weight as LineWeight, 
  Crop as CropFree, 
  Delete,
  Settings,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  GitFork,
  Layers,
 } from 'lucide-react';


export const DrawingToolbar = ({
  selectedTool,
  onSelectTool,
  onDeleteSelected,
  hasSelectedDrawing,
  onCustomizeDrawing 
}) => {
  const tools = [
    { id: 'trendLine', icon: TrendingUp, title: 'Trend Line' },
    { id: 'rayLine', icon: ArrowRight, title: 'Ray Line' },
    { id: 'horizontalRay', icon: ArrowLeft, title: 'Horizontal Ray' },
    { id: 'verticalLine', icon: ArrowDown, title: 'Vertical Line' },
    { id: 'priceLevel', icon: ShowChart, title: 'Price Level' },
    { id: 'channel', icon: Layers, title: 'Channel' },
    { id: 'pitchfork', icon: GitFork, title: 'Andrews Pitchfork' },
    { id: 'fibRetracement', icon: GridOn, title: 'Fibonacci Retracement' },
    { id: 'fibExtension', icon: LineWeight, title: 'Fibonacci Extension' },
    { id: 'rectangle', icon: CropFree, title: 'Rectangle' }
  ];

  return (
    <div className="drawing-toolbar">
      <div className="tool-group">
        {tools.map(tool => (
            <button 
              key={tool.id}
              className={`tool-button ${selectedTool === tool.id ? 'active' : ''}`}
              onClick={() => onSelectTool(selectedTool === tool.id ? null : tool.id)}
              title={tool.title}
            >
              <tool.icon size={18} />
            </button>
          ))}
    </div>
    <div className="tool-group">
        {hasSelectedDrawing && (
          <button 
            className="tool-button customize-button"
            onClick={onCustomizeDrawing}
            title="Customize Drawing"
          >
            <Settings size={18} />
          </button>
        )}
        <button 
          className={`tool-button delete-button ${!hasSelectedDrawing ? 'disabled' : ''}`}
          onClick={onDeleteSelected}
          disabled={!hasSelectedDrawing}
          title="Delete Selected"
        >
          <Delete size={18} />
        </button>
      </div>
    </div>
  );
};