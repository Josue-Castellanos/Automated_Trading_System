import { useState, useRef } from 'react';
import { motion } from 'framer-motion'
import { FiArrowRight, FiCheck, FiBarChart2, FiTrendingUp, FiPieChart, FiX, FiUser, FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { AnimatedSection, FeatureCard } from '../animation/Animation';
import '../styles/home.css';

const Home = () => {
    const [email, setEmail] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginForm, setLoginForm] = useState({
      email: '',
      password: ''
    });
    const registerRef = useRef(null)

    const handleLoginClick = () => {
        setShowLoginModal(true);
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    };

    const handleCloseModal = () => {
        setShowLoginModal(false);
     document.body.style.overflow = 'auto'; // Re-enable scrolling
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        // Add your authentication logic here
        console.log('Login submitted:', loginForm);
        handleCloseModal();
    };

    const features = [
        {
            icon: <FiBarChart2 className="feature-icon" />,
            title: "Advanced Charting",
            description: "Professional trading tools with 100+ indicators"
        },
        {
            icon: <FiTrendingUp className="feature-icon" />,
            title: "AI-Powered Signals",
            description: "Machine learning identifies high-probability trades"
        },
        {
            icon: <FiPieChart className="feature-icon" />,
            title: "Multi-Timeframe Analysis",
            description: "Sync your charts across all timeframes"
        }
    ];

    const scrollToRegister = () => {
        registerRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="algochart-landing" style={{ overflowX: 'hidden' }}>
            {/* Navigation */}
            <nav className="nav-container">
                <Link to="/" className="logo-wrapper">
                    <div className="logo-mark"></div>
                    <span className="logo-text">AlgoChart</span>
                </Link>
                
                <div className="nav-links">
                    <Link to="/dashboard">Dashboard</Link>
                    <a href="#register" onClick={(e) => {
                        e.preventDefault();
                        scrollToRegister();
                    }}>Pricing</a>
                    <Link to="/diamond">Diamond</Link>
                </div>
                
                <div className="nav-buttons">
                    <button className="nav-button login" onClick={handleLoginClick}>
                        Login
                    </button>
                    <a className="nav-button primary" href="#register" onClick={(e) => {
                        e.preventDefault();
                        scrollToRegister();
                    }}>Get AlgoChart</a>
                </div>
            </nav>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="login-modal-overlay">
                    <div className="login-modal">
                        <button className="close-modal" onClick={handleCloseModal}>
                            <FiX />
                        </button>
                        
                        <div className="modal-header">
                            <h3>Sign in to AlgoChart</h3>
                            <p>Access your chart dashboard and tools</p>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="login-form">
                            <div className="input-group">
                                <FiUser className="input-icon" />
                                <input
                                type="email"
                                name="email"
                                placeholder="Email address"
                                value={loginForm.email}
                                onChange={handleInputChange}
                                required
                                />
                            </div>
                            
                            <div className="input-group">
                                <FiLock className="input-icon" />
                                <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={loginForm.password}
                                onChange={handleInputChange}
                                required
                                />
                            </div>

                            <div className="form-options">
                                <label className="remember-me">
                                    <input type="checkbox" />
                                        Remember me
                                </label>
                                <a href="#forgot-password" className="forgot-password">
                                    Forgot password?
                                </a>
                            </div>

                        <button type="submit" className="login-submit">
                            Sign In
                        </button>

                        <div className="social-login">
                            <p>Or continue with</p>
                            <div className="social-buttons">
                                <button type="button" className="social-button google">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
                                </button>
                                <button type="button" className="social-button apple">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" />
                                </button>
                            </div>
                        </div>

                            <div className="signup-link">
                                Don't have an account? <a href="#signup">Sign up</a>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <AnimatedSection>
                <div className="hero-section">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}>
                        <h1>
                            The Most Advanced <span className="highlight">Trading Tools</span> For Serious Traders
                        </h1>
                        <p className="hero-subtext">
                            Join thousands of traders using our AI-powered indicators and charting tools to find better entries and exits.
                        </p>
                        <div className="signup-form">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="email-input"
                            />
                            <Link to="/signup" className="cta-button"> 
                                Start Free Trial
                                <FiArrowRight className="arrow-icon" />
                            </Link>
                        </div>
                        <div className="benefits">
                            <span className="benefit-item"><FiCheck className="check-icon" /> No credit card required</span>
                            <span className="benefit-item"><FiCheck className="check-icon" /> 7-day free trial</span>
                        </div>
                    </motion.div>
                    <motion.div
                        className="hero-image"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}>
                        <div className="image-container">
                            <img 
                                src="/hero-image-2.png" 
                                alt="AlgoChart Dashboard" 
                            />
                        </div>
                    </motion.div>
                </div>
            </AnimatedSection>

            {/* Logos Section */}
            <section className="logos-section">
                <p className="logos-title">TRUSTED BY TRADERS AT</p>
                <div className="logos-grid">
                    <a href="https://www.bloomberg.com/" target="_blank" rel="noopener noreferrer" className="logo-item">Bloomberg</a>
                    <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="logo-item">TradingView</a>
                    <a href="https://www.binance.com/" target="_blank" rel="noopener noreferrer" className="logo-item">Binance</a>
                    <a href="https://www.etoro.com/" target="_blank" rel="noopener noreferrer" className="logo-item">eToro</a>
                    <a href="https://www.forex.com/" target="_blank" rel="noopener noreferrer" className="logo-item">Forex.com</a>
                </div>
            </section>

            {/* Features Section */}
            <AnimatedSection delay={1}>
                <div className="features-section">
                    <div className="section-header">
                        <h2>Powerful Features For Smarter Trading</h2>
                        <p>
                            Our tools are designed to give you an edge in the markets with actionable insights.
                        </p>
                    </div>
                    
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <FeatureCard 
                                key={index}
                                index={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                            />
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* Register/Pricing Section */}
            <AnimatedSection>
                <div className="register-section" ref={registerRef} id="register">
                    <div className="section-header">
                        <h2>Get Your All-Inclusive Membership Now</h2>
                        <p className="discount-badge">Our Most Popular Yearly Plan is 40% OFF</p>
                    </div>

                    <div className="pricing-toggle">
                        <button className="pricing-option">Monthly</button>
                        <button className="pricing-option active">Yearly</button>
                    </div>

                    <div className="pricing-grid">
                        {/* Pro Plan */}
                        <motion.div
                            className="pricing-card"
                            whileHover={{ y: -10 }}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            >
                            <h3>AlgoChart Pro</h3>
                            <div className="price">$10<small>/mo</small></div>
                            <p className="plan-description">
                                AlgoChart Pro offers everything you need for smart, effective trading.
                            </p>
                            <ul className="features-list">
                                <li><FiCheck className="feature-check" /> Full kit with our four main indicators</li>
                                <li><FiCheck className="feature-check" /> Five weekly trading strategy sessions</li>
                                <li><FiCheck className="feature-check" /> Daily market insights from experts</li>
                                <li><FiCheck className="feature-check" /> Discord community access</li>
                                <li><FiCheck className="feature-check" /> Regular updates on new features</li>
                            </ul>
                            <button className="purchase-button">Get Started</button>
                        </motion.div>

                        {/* Plus Plan */}
                        <motion.div
                            className="pricing-card"
                            whileHover={{ y: -10 }}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            >
                            <div className="popular-badge">Most Popular</div>
                            <h3>AlgoChart Plus</h3>
                            <div className="price">$117<small>/mo</small></div>
                            <p className="plan-description">
                                AlgoChart Plus adds more features for those seeking an extra boost of power.
                            </p>
                            <ul className="features-list">
                                <li><FiCheck className="feature-check" /> Everything from Pro, and more:</li>
                                <li><FiCheck className="feature-check" /> Two extra indicators, 12+ new features</li>
                                <li><FiCheck className="feature-check" /> All 10+ influencer indicators</li>
                                <li><FiCheck className="feature-check" /> Weekly TA Plus classes</li>
                                <li><FiCheck className="feature-check" /> Create your own custom signals</li>
                                <li><FiCheck className="feature-check" /> Early access to all of our indicators</li>
                            </ul>
                            <button className="purchase-button primary">Upgrade Now</button>
                        </motion.div>
                    </div>
                </div>
            </AnimatedSection>

            {/* CTA Section */}
          
            <div className="cta-section">
                <h2>Ready to Transform Your Trading?</h2>
                <p>
                Join thousands of traders who are already using AlgoChart to find better trading opportunities.
                </p>
                <Link to="/signup" className="cta-button secondary">Start Your Free Trial Now</Link>
            </div>
           

            {/* Footer */}
            <footer className="footer">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="logo-wrapper">
                        <div className="logo-mark"></div>
                        <span className="logo-text">AlgoChart</span>
                        </Link>
                        <p>Advanced trading tools for serious traders.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Product</h4>
                        <ul>
                        <li><Link to="/features">Features</Link></li>
                        <li><Link to="/pricing">Pricing</Link></li>
                        <li><Link to="/integrations">Integrations</Link></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Resources</h4>
                        <ul>
                        <li><Link to="/blog">Blog</Link></li>
                        <li><Link to="/help">Help Center</Link></li>
                        <li><Link to="/tutorials">Tutorials</Link></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Company</h4>
                        <ul>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/careers">Careers</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} AlgoChart. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;