import React, { useState, useEffect } from 'react';
import '../styles/performance_tracker.css';
import axios from 'axios';

export const PerformanceTracker = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/performance/');
        
        if (response.data.status === 'success') {
          setPerformanceData(response.data.performance);
        } else {
          setError(response.data.message || 'Failed to load performance data');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  if (loading) {
    return (
      <div className="performance-tracker-container">
        <div className="loading-spinner">Loading performance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="performance-tracker-container">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="performance-tracker-container">
      <h1 className="page-title">Automated Trading System</h1>
      
      <div className="tracker-container">
        <h1 className="tracker-title">
          <i className="fas fa-briefcase"></i> Trading Options Tracker
        </h1>
        
        {performanceData.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Date</th>
                <th>Tgt$</th>
                <th>Tgt$Balance</th>
                <th>Pos$</th>
                <th>Pos#</th>
                <th>Pos%</th>
                <th>Act$-Adj$</th>
                <th>Act$Gain</th>
                <th>Act%Gain</th>
                <th>Act$Balance</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((record, index) => (
                <tr key={index}>
                  <td>{record.day}</td>
                  <td>{record.date}</td>
                  <td className={record.adj__gain >= 0 ? 'highlight-positive' : 'highlight-negative'}>
                    {record.adj__gain}
                  </td>
                  <td>{record.adj__balance}</td>
                  <td>{record.pos__size}</td>
                  <td>{record.pos_open}</td>
                  <td>{record.pos_tgt}%</td>
                  <td className={record.act__adj__ >= 0 ? 'highlight-positive' : 'highlight-negative'}>
                    {record.act__adj__}
                  </td>
                  <td className={record.act__gain >= 0 ? 'highlight-positive' : 'highlight-negative'}>
                    {record.act__gain}
                  </td>
                  <td className={record.act_gain >= 0 ? 'highlight-positive' : 'highlight-negative'}>
                    {record.act_gain}%
                  </td>
                  <td>{record.act__balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">No performance data available</div>
        )}
      </div>
    </div>
  );
};

export default PerformanceTracker;