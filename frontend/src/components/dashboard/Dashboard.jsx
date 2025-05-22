import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { ChartWidget } from '../widgets/ChartWidget/ChartWidget';
import { Toolbox } from '../toolbox/Toolbox';
import './Dashboard.css';
import { useDashboard } from '../../contexts/DashboardContext';

const ResponsiveGridLayout = WidthProvider(Responsive);

export const Dashboard = () => {
  const { state, dispatch } = useDashboard();

  const onLayoutChange = (layout, allLayouts) => {
    Object.entries(allLayouts).forEach(([breakpoint, layout]) => {
      dispatch({
        type: 'UPDATE_LAYOUT',
        payload: { breakpoint, layout }
      });
    });
  };

  const addWidget = (widgetType) => {
    if (state.widgets.length >= 4) return;
    
    const widgetCount = state.widgets.length + 1;
    let newWidget;
    
    switch(widgetCount) {
      case 1:
        newWidget = {
          i: `${widgetType}-${Date.now()}`,
          type: widgetType,
          x: 0,
          y: 0,
          w: 12,
          h: 23.65
        };
        break;
      case 2:
        newWidget = {
          i: `${widgetType}-${Date.now()}`,
          type: widgetType,
          x: 0,
          y: 12,
          w: 12,
          h: 12
        };
        // Resize first widget
        const updatedWidgets = state.widgets.map(w => ({
          ...w,
          w: 12,
          h: 12
        }));
        dispatch({ type: 'UPDATE_WIDGETS', payload: updatedWidgets });
        break;
      case 3:
        newWidget = {
          i: `${widgetType}-${Date.now()}`,
          type: widgetType,
          x: 6,
          y: 12,
          w: 6,
          h: 12
        };
        // Resize existing widgets
        const updatedWidgets3 = state.widgets.map((w, i) => ({
          ...w,
          w: i === 0 ? 12 : 6,
          h: 12
        }));
        dispatch({ type: 'UPDATE_WIDGETS', payload: updatedWidgets3 });
        break;
      case 4:
        newWidget = {
          i: `${widgetType}-${Date.now()}`,
          type: widgetType,
          x: 6,
          y: 12,
          w: 6,
          h: 12
        };
        // Resize existing widgets
        const updatedWidgets4 = state.widgets.map((w, i) => ({
          ...w,
          x: i === 0 ? 0 : i === 1 ? 6 : i === 2 ? 0 : 0,
          y: i === 0 ? 0 : i === 1 ? 0 : i === 2 ? 12 : 0,
          w: i === 0 ? 6 : 6,
          h: 12
        }));
        dispatch({ type: 'UPDATE_WIDGETS', payload: updatedWidgets4 });
        break;
      default:
        return;
    }
    
    dispatch({ type: 'ADD_WIDGET', payload: newWidget });
  };

  const removeWidget = (widgetId) => {
    const widgetCount = state.widgets.length;
    if (widgetCount <= 1) return;
    
    // After removal, adjust remaining widgets
    const newCount = widgetCount - 1;
    let updatedWidgets = state.widgets.filter(w => w.i !== widgetId);
    
    switch(newCount) {
      case 1:
        updatedWidgets = updatedWidgets.map(w => ({
          ...w,
          x: 0,
          w: 12,
          h: 12
        }));
        break;
      case 2:
        updatedWidgets = updatedWidgets.map((w, i) => ({
          ...w,
          x: i === 0 ? 0 : 6,
          w: 6,
          h: 12
        }));
        break;
      case 3:
        updatedWidgets = updatedWidgets.map((w, i) => ({
          ...w,
          x: i === 0 ? 0 : i === 1 ? 8 : 4,
          w: i === 0 ? 8 : 4,
          h: 12
        }));
        break;
      default:
        break;
    }
    
    dispatch({ type: 'UPDATE_WIDGETS', payload: updatedWidgets });
    dispatch({ type: 'REMOVE_WIDGET', payload: widgetId });
  };

  const renderWidget = (widget) => {
    return <ChartWidget 
      key={widget.i} 
      onRemove={() => removeWidget(widget.i)} 
      widgetType={widget.type}
    />;
  };

  return (
    <div className="dashboard">
      <Toolbox 
        addWidget={addWidget} 
        canAdd={state.widgets.length < 4}
        canRemove={state.widgets.length > 1}
      />
      
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: state.widgets }}
        breakpoints={{ lg: 1200 }}
        cols={{ lg: 12 }}
        rowHeight={30}
        onLayoutChange={onLayoutChange}
        isDraggable={false}
        isResizable={false}
        isDroppable={false}
      >
        {state.widgets.map(widget => (
          <div key={widget.i} data-grid={{...widget}}>
            {renderWidget(widget)}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};