import { Dashboard } from './components/dashboard/Dashboard';
import { DashboardProvider } from './contexts/DashboardContext';
import './styles/base.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./pages/Home"
import Login from "./pages/Login"
import React from "react";
import TrendAdvisorPage from './components/diamond/TrendAdvisor';

function App() {
    return (
        <BrowserRouter>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<DashboardProvider><Dashboard /></DashboardProvider>} />
            <Route path="/diamond" element={<TrendAdvisorPage />} />
            <Route path="/login" element={<Login />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;