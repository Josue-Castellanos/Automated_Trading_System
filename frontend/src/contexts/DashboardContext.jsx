import React, { createContext, useContext, useReducer } from 'react';
import { useLocalStorage } from '../components/shared/hooks/useLocalStorage';

const DashboardContext = createContext();

const MAX_CHARTS_PER_LAYOUT = 4;

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_WIDGET': {
      if (state.widgets.length >= MAX_CHARTS_PER_LAYOUT) {
        console.warn(`Maximum of ${MAX_CHARTS_PER_LAYOUT} charts reached`);
        return state;
      }

      const newWidget = action.payload;
      return {
        ...state,
        widgets: [...state.widgets, newWidget],
        layouts: {
          ...state.layouts,
          lg: [...(state.layouts.lg || []), newWidget]
        }
      };
    }
      
    case 'REMOVE_WIDGET': {
      const widgetId = action.payload;
      const updatedWidgets = state.widgets.filter(w => w.i !== widgetId);
      
      return {
        ...state,
        widgets: updatedWidgets,
        layouts: {
          ...state.layouts,
          lg: updatedWidgets
        }
      };
    }
    
    case 'UPDATE_WIDGETS': {
      return {
        ...state,
        widgets: action.payload,
        layouts: {
          ...state.layouts,
          lg: action.payload
        }
      };
    }
    
    case 'UPDATE_LAYOUT': {
      const { breakpoint, layout } = action.payload;
      return {
        ...state,
        layouts: {
          ...state.layouts,
          [breakpoint]: layout
        }
      };
    }
    
    case 'SET_PRESET': {
      return {
        ...state,
        widgets: action.payload.widgets,
        layouts: action.payload.layouts
      };
    }
    
    default:
      return state;
  }
};

export const DashboardProvider = ({ children }) => {
  const [savedState, setSavedState] = useLocalStorage('dashboardState', {
    widgets: [],
    layouts: { lg: [] }
  });

  const [state, dispatch] = useReducer(dashboardReducer, savedState);

  React.useEffect(() => {
    setSavedState(state);
  }, [state, setSavedState]);

  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};