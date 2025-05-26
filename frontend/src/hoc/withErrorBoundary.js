import React from 'react';
import ErrorBoundary from '../components/common/ErrorBoundary';

/**
 * Higher-Order Component that wraps a component with ErrorBoundary
 * @param {React.ComponentType} WrappedComponent - The component to wrap
 * @param {Object} errorBoundaryProps - Props to pass to the ErrorBoundary
 * @param {string} errorBoundaryProps.fallback - Custom fallback component
 * @param {Function} errorBoundaryProps.onError - Error callback function
 * @param {string} errorBoundaryProps.errorMessage - Custom error message
 * @param {boolean} errorBoundaryProps.resetOnPropsChange - Whether to reset on props change
 * @returns {React.ComponentType} - The wrapped component
 */
const withErrorBoundary = (
  WrappedComponent,
  {
    fallback = null,
    onError = null,
    errorMessage = 'Something went wrong',
    resetOnPropsChange = true,
    ...restProps
  } = {}
) => {
  class WithErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        hasError: false,
        error: null,
        errorInfo: null
      };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      this.setState({ errorInfo });
      
      // Log error to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error caught by ErrorBoundary:', error);
        console.error('Error Info:', errorInfo);
      }

      // Call onError callback if provided
      if (typeof onError === 'function') {
        onError(error, errorInfo);
      }

      // Log error to error tracking service in production
      if (process.env.NODE_ENV === 'production') {
        // TODO: Implement error tracking service integration
        // Example: Sentry.captureException(error);
      }
    }

    componentDidUpdate(prevProps) {
      // Reset error state when props change if resetOnPropsChange is true
      if (resetOnPropsChange && this.state.hasError) {
        const propsChanged = Object.keys(this.props).some(
          key => this.props[key] !== prevProps[key]
        );
        
        if (propsChanged) {
          this.setState({ hasError: false, error: null, errorInfo: null });
        }
      }
    }

    render() {
      const { hasError, error, errorInfo } = this.state;

      if (hasError) {
        return (
          <ErrorBoundary
            fallback={fallback}
            error={error}
            errorInfo={errorInfo}
            errorMessage={errorMessage}
            {...restProps}
          />
        );
      }

      return <WrappedComponent {...this.props} />;
    }
  }

  // Set a display name for the HOC for better debugging
  const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithErrorBoundary.displayName = `withErrorBoundary(${wrappedComponentName})`;

  // Copy static methods from WrappedComponent
  WithErrorBoundary.getDerivedStateFromProps = WrappedComponent.getDerivedStateFromProps;
  WithErrorBoundary.getDerivedStateFromError = WrappedComponent.getDerivedStateFromError;
  WithErrorBoundary.contextType = WrappedComponent.contextType;

  return WithErrorBoundary;
};

export default withErrorBoundary;
