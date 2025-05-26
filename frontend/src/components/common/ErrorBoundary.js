import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { logError } from '../../utils/errorHandling';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error, errorInfo) {
    // Prevent infinite loops in case of errors in the error boundary itself
    if (this.state.error === error) {
      return;
    }

    // Log the error with component context
    const componentName = this.props.componentName || 'ErrorBoundary';
    logError(error, errorInfo, componentName);
    
    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
      lastErrorTime: Date.now()
    }));
  }
  


  resetError = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  }
  
  goToHomePage = () => {
    // Reset error state before navigating
    this.resetError();
    // Use React Router navigation instead of direct window.location
    if (this.props.navigate) {
      this.props.navigate('/');
    } else {
      window.location.href = '/';
    }
  }
  
  render() {
    const { 
      fallback, 
      showDetails = process.env.NODE_ENV === 'development',
      showHomeButton = true,
      customMessage,
      children,
      componentName,
      ...restProps 
    } = this.props;
    
    const { hasError, error, errorInfo, errorCount } = this.state;
    
    // If a custom fallback component is provided, use it
    if (hasError && fallback) {
      return fallback(error, this.resetError);
    }
    
    if (hasError) {
      // Default error UI
      return (
        <div className="error-boundary" role="alert">
          <div className="error-container">
            <div className="error-icon" aria-hidden="true">⚠️</div>
            <h2>{customMessage || 'Oops! Something went wrong'}</h2>
            <p>We're sorry, but there was an error loading this component.</p>
            
            {/* Show different messages based on error count */}
            {errorCount > 1 && (
              <div className="error-persistence-warning">
                <p>This error has occurred {errorCount} times. You may want to try a different action.</p>
              </div>
            )}
            
            {showDetails && error && (
              <div className="error-details">
                <details>
                  <summary>Error Details (for developers)</summary>
                  <p className="error-message">{error.toString()}</p>
                  {error.stack && (
                    <pre className="stack-trace">
                      {error.stack}
                    </pre>
                  )}
                  {errorInfo?.componentStack && (
                    <>
                      <h4>Component Stack:</h4>
                      <pre className="stack-trace">
                        {errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </details>
              </div>
            )}
            
            <div className="error-actions">
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
                aria-label="Reload the page"
              >
                Reload Page
              </button>
              <button 
                onClick={this.resetError} 
                className="btn btn-outline"
                aria-label="Try again"
              >
                Try Again
              </button>
              {showHomeButton && (
                <Link 
                  to="/" 
                  className="btn btn-secondary"
                  onClick={this.resetError}
                  aria-label="Go to home page"
                >
                  Go to Home
                </Link>
              )}
            </div>
            
            {/* Hidden error details for automated testing */}
            <div style={{ display: 'none' }} data-testid="error-message">
              {error?.message}
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  showDetails: PropTypes.bool,
  showHomeButton: PropTypes.bool,
  customMessage: PropTypes.string,
  componentName: PropTypes.string,
  navigate: PropTypes.func, // Provided by React Router when using useNavigate
};

ErrorBoundary.defaultProps = {
  fallback: null,
  showDetails: process.env.NODE_ENV === 'development',
  showHomeButton: true,
  customMessage: '',
  componentName: 'Unknown',
  navigate: null,
};

// Export a hook for functional components to use
export const useErrorBoundary = () => {
  const [error, setError] = React.useState(null);
  
  const handleError = (error, errorInfo) => {
    console.error('Error caught by useErrorBoundary:', error, errorInfo);
    setError({ error, errorInfo });
    // You can also log the error to your error tracking service here
  };
  
  const resetError = () => setError(null);
  
  return { error: error?.error, errorInfo: error?.errorInfo, handleError, resetError };
};

export default ErrorBoundary;