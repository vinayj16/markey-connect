import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SellerGuide.css'; // Ensure you have a corresponding CSS file for styling

const SellerGuide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('getting-started');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guideData, setGuideData] = useState(null);

  useEffect(() => {
    const fetchGuideData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API endpoint
        const response = await fetch('/api/vendor/guide');
        if (!response.ok) {
          throw new Error('Failed to fetch guide data');
        }
        const data = await response.json();
        setGuideData(data);
      } catch (err) {
        console.error('Error fetching guide data:', err);
        setError('Failed to load guide data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGuideData();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Scroll to top of section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSupportClick = () => {
    // TODO: Implement support chat or redirect to support page
    window.open('/support', '_blank');
  };

  if (loading) {
    return (
      <div className="seller-guide-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading guide data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="seller-guide-container">
        <div className="error-state">
          <span>⚠️</span>
          <p>{error}</p>
          <button 
            className="action-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-guide-container">
      <header className="guide-header">
        <h1>Seller Guide</h1>
        <button 
          className="return-dashboard-btn"
          onClick={() => handleNavigation('/vendor')}
        >
          Return to Dashboard
        </button>
      </header>

      <nav className="guide-navigation">
        <button 
          className={`nav-btn ${activeSection === 'getting-started' ? 'active' : ''}`}
          onClick={() => handleSectionChange('getting-started')}
        >
          Getting Started
        </button>
        <button 
          className={`nav-btn ${activeSection === 'key-steps' ? 'active' : ''}`}
          onClick={() => handleSectionChange('key-steps')}
        >
          Key Steps
        </button>
        <button 
          className={`nav-btn ${activeSection === 'resources' ? 'active' : ''}`}
          onClick={() => handleSectionChange('resources')}
        >
          Resources
        </button>
        <button 
          className={`nav-btn ${activeSection === 'best-practices' ? 'active' : ''}`}
          onClick={() => handleSectionChange('best-practices')}
        >
          Best Practices
        </button>
      </nav>

      <main className="guide-content">
        {activeSection === 'getting-started' && (
          <section className="getting-started">
            <h2>Getting Started</h2>
            <div className="start-cards">
              <div className="card">
                <div className="card-icon">🏪</div>
                <h3>Complete Your Store Profile</h3>
                <p>Set up your store name, logo, and branding to attract customers.</p>
                <button 
                  className="action-btn"
                  onClick={() => handleNavigation('/vendor/profile')}
                >
                  Set Up Store
                </button>
              </div>
              <div className="card">
                <div className="card-icon">📦</div>
                <h3>Add Your First Product</h3>
                <p>Create detailed product listings with photos, descriptions, and pricing.</p>
                <button 
                  className="action-btn"
                  onClick={() => handleNavigation('/vendor/products/add')}
                >
                  Add Product
                </button>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'key-steps' && (
          <section className="key-steps">
            <h2>Key Steps</h2>
            <div className="steps-container">
              <ol>
                <li>
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>Complete Account Setup</h3>
                    <p>Finish setting up your bank account and payment information.</p>
                    <button 
                      className="action-btn"
                      onClick={() => handleNavigation('/vendor/settings/payment')}
                    >
                      Set Up Account
                    </button>
                  </div>
                </li>
                <li>
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>Create Your Store</h3>
                    <p>Set up your store profile and branding to attract customers.</p>
                    <button 
                      className="action-btn"
                      onClick={() => handleNavigation('/vendor/profile')}
                    >
                      Create Store
                    </button>
                  </div>
                </li>
                <li>
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h3>Add Products</h3>
                    <p>Create listings with photos, descriptions, and pricing.</p>
                    <button 
                      className="action-btn"
                      onClick={() => handleNavigation('/vendor/products/add')}
                    >
                      Add Products
                    </button>
                  </div>
                </li>
                <li>
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <h3>Set Up Shipping</h3>
                    <p>Configure your shipping options and rates.</p>
                    <button 
                      className="action-btn"
                      onClick={() => handleNavigation('/vendor/settings/shipping')}
                    >
                      Configure Shipping
                    </button>
                  </div>
                </li>
              </ol>
            </div>
          </section>
        )}

        {activeSection === 'resources' && (
          <section className="helpful-resources">
            <h2>Helpful Resources</h2>
            <div className="resource-cards">
              <div className="card">
                <div className="card-icon">🎥</div>
                <h3>Video Tutorials</h3>
                <p>Watch step-by-step guides on setting up your store and adding products.</p>
                <button 
                  className="action-btn"
                  onClick={() => window.open('/tutorials', '_blank')}
                >
                  Watch Videos
                </button>
              </div>
              <div className="card">
                <div className="card-icon">📚</div>
                <h3>Documentation</h3>
                <p>Detailed articles on our marketplace and how to succeed as a seller.</p>
                <button 
                  className="action-btn"
                  onClick={() => window.open('/docs', '_blank')}
                >
                  Read Docs
                </button>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'best-practices' && (
          <section className="best-practices">
            <h2>Best Practices</h2>
            <div className="practice-cards">
              <div className="card">
                <div className="card-icon">📸</div>
                <h3>Use High-Quality Images</h3>
                <p>Increases conversion by 45%</p>
                <button 
                  className="action-btn"
                  onClick={() => window.open('/guide/images', '_blank')}
                >
                  Learn More
                </button>
              </div>
              <div className="card">
                <div className="card-icon">✍️</div>
                <h3>Write Detailed Descriptions</h3>
                <p>Reduces return rates by 35%</p>
                <button 
                  className="action-btn"
                  onClick={() => window.open('/guide/descriptions', '_blank')}
                >
                  Learn More
                </button>
              </div>
              <div className="card">
                <div className="card-icon">💰</div>
                <h3>Set Competitive Prices</h3>
                <p>Improves visibility by 60%</p>
                <button 
                  className="action-btn"
                  onClick={() => window.open('/guide/pricing', '_blank')}
                >
                  Learn More
                </button>
              </div>
              <div className="card">
                <div className="card-icon">💬</div>
                <h3>Respond Quickly to Customers</h3>
                <p>Builds trust and loyalty</p>
                <button 
                  className="action-btn"
                  onClick={() => window.open('/guide/customer-service', '_blank')}
                >
                  Learn More
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="guide-footer">
        <div className="need-help">
          <h2>Need Help?</h2>
          <p>Our support team is available 24/7 to assist with any questions.</p>
          <button 
            className="contact-support-btn"
            onClick={handleSupportClick}
          >
            Contact Support
          </button>
        </div>
      </footer>
    </div>
  );
};

export default SellerGuide;
