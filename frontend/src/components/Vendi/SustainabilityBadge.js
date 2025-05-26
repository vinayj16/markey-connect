import React, { useState, useEffect } from 'react';
import { FaLeaf, FaRecycle, FaUsers, FaGlobeAmericas, FaTimes } from 'react-icons/fa';
import './SustainabilityBadge.css';

const SustainabilityBadge = ({ product }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (!product.sustainability_info) return null;
  
  const { 
    eco_friendly, 
    sustainable_materials, 
    carbon_footprint, 
    recyclable_packaging,
    ethical_labor,
    sustainability_score,
    certifications = []
  } = product.sustainability_info;
  
  const toggleDetails = (e) => {
    if (e) e.stopPropagation();
    setShowDetails(!showDetails);
  };
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowDetails(false);
    }
  };
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };
  
  const getScoreRating = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  };
  
  const scoreClass = getScoreColor(sustainability_score);
  
  return (
    <div className="sustainability-badge">
      <div 
        className={`badge-container ${scoreClass}`}
        onClick={toggleDetails}
        role="button"
        tabIndex={0}
        aria-expanded={showDetails}
        aria-label="View sustainability details"
      >
        <FaLeaf className="eco-icon" />
        <div className="badge-content">
          <span className="badge-label">Sustainability</span>
          <span className="badge-score">{sustainability_score}/100</span>
        </div>
      </div>
      
      {showDetails && (
        <>
          <div className="sustainability-details-backdrop" onClick={handleBackdropClick} />
          <div className="sustainability-details">
            <div className="details-header">
              <h3>Sustainability Information</h3>
              <button 
                className="close-details" 
                onClick={toggleDetails}
                aria-label="Close sustainability details"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="sustainability-score-details">
              <div className={`score-circle ${scoreClass}`}>
                <span>{sustainability_score}</span>
              </div>
              <div className="score-label">
                <p>Sustainability Score</p>
                <p className={`score-rating ${scoreClass}`}>
                  {getScoreRating(sustainability_score)}
                </p>
              </div>
            </div>
            
            <div className="sustainability-metrics">
              <div className="metric">
                <FaLeaf className="metric-icon" />
                <div className="metric-details">
                  <h4>Materials</h4>
                  <p>{sustainable_materials || 'Information not available'}</p>
                </div>
              </div>
              
              <div className="metric">
                <FaGlobeAmericas className="metric-icon" />
                <div className="metric-details">
                  <h4>Carbon Footprint</h4>
                  <p>{carbon_footprint ? `${carbon_footprint} kg CO₂e` : 'Information not available'}</p>
                </div>
              </div>
              
              <div className="metric">
                <FaRecycle className="metric-icon" />
                <div className="metric-details">
                  <h4>Packaging</h4>
                  <p>{recyclable_packaging ? 'Recyclable packaging' : 'Standard packaging'}</p>
                </div>
              </div>
              
              <div className="metric">
                <FaUsers className="metric-icon" />
                <div className="metric-details">
                  <h4>Labor Practices</h4>
                  <p>{ethical_labor ? 'Ethically produced' : 'Information not available'}</p>
                </div>
              </div>
            </div>
            
            {certifications.length > 0 && (
              <div className="certifications">
                <h4>Certifications</h4>
                <div className="certification-badges">
                  {certifications.map((cert, index) => (
                    <div key={index} className="certification-badge">
                      <img src={cert.icon_url} alt={cert.name} />
                      <span>{cert.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="sustainability-footer">
              <p>
                By choosing products with higher sustainability scores, you're supporting 
                environmentally responsible practices.
              </p>
              <a 
                href="/vendi/sustainability-initiative" 
                className="learn-more"
                aria-label="Learn more about our sustainability initiative"
              >
                Learn more about our sustainability initiative
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SustainabilityBadge;