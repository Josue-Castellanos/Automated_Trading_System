import React, { useState, useRef, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import './WidgetFrame.css';

export const WidgetFrame = ({ title, children, onRemove, dropdownContent }) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const headerRef = useRef(null);
  const frameRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsHeaderVisible(true);
  };

  const handleMouseLeave = () => {
    // Only hide if not interacting with dropdowns
    if (!isInteracting) {
      timeoutRef.current = setTimeout(() => {
        setIsHeaderVisible(false);
      }, 500); 
    }
  };

  // Track clicks anywhere in the document
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (frameRef.current && !frameRef.current.contains(e.target)) {
        // Clicked outside the widget - hide header
        setIsHeaderVisible(false);
        setIsInteracting(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  return (
    <div 
      ref={frameRef}
      className="widget-frame"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Invisible trigger area at top */}
      <div className="widget-header-trigger" />
      {/* Slide-down header */}
      <div 
        ref={headerRef}
        className={`widget-header ${isHeaderVisible ? 'visible' : ''}`}
        onMouseEnter={() => {
          setIsInteracting(true);
          handleMouseEnter();
        }}
        onMouseLeave={() => setIsInteracting(false)}  
      >
        {dropdownContent && (
          <div className="widget-header-main">
            {/* Add menu open/close handlers to dropdown content */}
            {React.cloneElement(dropdownContent, {
              onMenuOpen: () => setIsInteracting(true),
              onMenuClose: () => {
                setIsInteracting(false);
                if (!headerRef.current?.matches(':hover')) {
                  setIsHeaderVisible(false);
                }
              }
            })}
          </div>
        )}
        <div className="widget-actions">
          {onRemove && (
            <IconButton size="small" onClick={onRemove} sx={{ color: 'inherit' }}>
              <Close fontSize="small" />
            </IconButton>
          )}
        </div>
      </div>
      {/* Content area */}
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};