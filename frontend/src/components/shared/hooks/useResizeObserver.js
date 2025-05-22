import { useEffect, useRef } from 'react';

export const useResizeObserver = (callback, elementRef) => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!elementRef.current) return;
    
    const observer = new ResizeObserver(entries => {
      if (entries.length > 0) {
        callbackRef.current(entries[0]);
      }
    });
    
    observer.observe(elementRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [elementRef]);
};