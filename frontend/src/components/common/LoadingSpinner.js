import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './LoadingSpinner.css';

/**
 * @typedef {Object} LoadingSpinnerProps
 * @property {'small'|'medium'|'large'} [size] - Size of the spinner
 * @property {string} [text] - Text to display below the spinner
 * @property {boolean} [fullPage] - Whether to display as a full-page overlay
 * @property {'circle'|'dots'|'pulse'|'bars'} [variant] - Spinner variant
 * @property {string} [color] - Custom color for the spinner
 * @property {boolean} [overlay] - Whether to show a background overlay
 * @property {number} [delay] - Delay in ms before showing the spinner
 * @property {boolean} [withProgress] - Whether to show a progress indicator
 * @property {string} [ariaLabel] - ARIA label for accessibility
 */

/**
 * Enhanced LoadingSpinner component with multiple variants and animations
 * @param {LoadingSpinnerProps} props - Component props
 */
const LoadingSpinner = ({
  size = 'medium',
  text = 'Loading...',
  fullPage = false,
  variant = 'circle',
  color,
  overlay = false,
  delay = 0,
  withProgress = false,
  ariaLabel = 'Loading...'
}) => {
  const [visible, setVisible] = useState(delay === 0);
  const [progress, setProgress] = useState(0);
  
  // Handle delay for showing the spinner
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);
  
  // Handle fake progress animation
  useEffect(() => {
    if (withProgress && visible) {
      const interval = setInterval(() => {
        setProgress(prev => {
          // Slow down progress as it gets closer to 90%
          const increment = prev < 30 ? 5 : prev < 60 ? 3 : prev < 80 ? 1 : 0.5;
          const newProgress = prev + increment;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [withProgress, visible]);
  
  // Complete progress when component unmounts
  useEffect(() => {
    return () => {
      if (withProgress) {
        setProgress(100);
      }
    };
  }, [withProgress]);
  
  if (!visible) {
    return null;
  }
  
  const spinnerClasses = `
    spinner 
    spinner-${size} 
    spinner-${variant} 
    ${fullPage ? 'spinner-fullpage' : ''} 
    ${overlay ? 'spinner-overlay' : ''}
  `;
  
  const customStyle = color ? { '--spinner-color': color } : {};
  
  const renderSpinnerContent = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="spinner-dots">
            <div></div><div></div><div></div>
          </div>
        );
      case 'pulse':
        return (
          <div className="spinner-pulse">
            <div></div>
          </div>
        );
      case 'bars':
        return (
          <div className="spinner-bars">
            <div></div><div></div><div></div><div></div><div></div>
          </div>
        );
      case 'circle':
      default:
        return (
          <div className="spinner-circle"></div>
        );
    }
  };
  
  return (
    <div 
      className={spinnerClasses} 
      style={customStyle}
      role="status"
      aria-live="polite"
      aria-busy={true}
      aria-label={ariaLabel}
    >
      <div className="spinner-container">
        <div className="spinner-announce" aria-hidden="true">
          {renderSpinnerContent()}
        </div>
        {text && (
          <p className="spinner-text" aria-hidden={!text}>
            {text}
          </p>
        )}
        
        {withProgress && (
          <div className="spinner-progress">
            <div 
              className="spinner-progress-bar" 
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
            <div className="spinner-progress-text" aria-hidden="true">
              {Math.round(progress)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Higher-order component that adds loading state to any component
 * @template T
 * @param {React.ComponentType<T>} WrappedComponent - Component to wrap
 * @param {Omit<LoadingSpinnerProps, 'isLoading'>} [options] - Loading options
 * @returns {React.FC<T & { isLoading?: boolean }>} Enhanced component with loading state
 */
export const withLoading = (WrappedComponent, options = {}) => {
  const WithLoadingComponent = ({ isLoading, ...props }) => {
    if (isLoading) {
      return <LoadingSpinner {...options} />;
    }
    return <WrappedComponent {...props} />;
  };

  // Copy static properties from WrappedComponent
  WithLoadingComponent.displayName = `WithLoading(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithLoadingComponent;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string,
  fullPage: PropTypes.bool,
  variant: PropTypes.oneOf(['circle', 'dots', 'pulse', 'bars']),
  color: PropTypes.string,
  overlay: PropTypes.bool,
  delay: PropTypes.number,
  withProgress: PropTypes.bool,
  ariaLabel: PropTypes.string,
};

LoadingSpinner.defaultProps = {
  size: 'medium',
  text: 'Loading...',
  fullPage: false,
  variant: 'circle',
  overlay: false,
  delay: 0,
  withProgress: false,
  ariaLabel: 'Loading...',
};

export default LoadingSpinner;