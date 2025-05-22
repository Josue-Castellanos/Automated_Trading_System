import React from 'react';
import './WatchlistWidget.css';

export const WatchlistWidget = () => {
  const watchlist = [
    { symbol: 'AAPL', price: 146.32, change: 1.05, changePercent: 0.72 },
    { symbol: 'TSLA', price: 209.75, change: -2.50, changePercent: -1.18 },
    { symbol: 'MSFT', price: 303.15, change: 3.20, changePercent: 1.07 }
  ];

  return (
    <div className="watchlist-widget">
      <div className="widget-header">
        <h3>Watchlist</h3>
      </div>
      <div className="watchlist-container">
        <div className="watchlist-header">
          <span>Symbol</span>
          <span>Price</span>
          <span>Change</span>
        </div>
        {watchlist.map((item, index) => (
          <div key={`watchlist-${index}`} className="watchlist-row">
            <span>{item.symbol}</span>
            <span>{item.price.toFixed(2)}</span>
            <span className={item.change >= 0 ? 'positive' : 'negative'}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};