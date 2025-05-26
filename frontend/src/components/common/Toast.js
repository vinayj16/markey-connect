import React, { useState, useEffect, useRef, useCallback, useContext, createContext, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  FiX, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiInfo, 
  FiAlertTriangle, 
  FiClock, 
  FiLoader,
  FiPause,
  FiPlay
} from 'react-icons/fi';
import './Toast.css';

// TypeScript types for JSDoc
/**
 * @typedef {import('./Toast.types').ToastType} ToastType
 * @typedef {import('./Toast.types').ToastPosition} ToastPosition
 * @typedef {import('./Toast.types').ToastAction} ToastAction
 * @typedef {import('./Toast.types').ToastOptions} ToastOptions
 * @typedef {import('./Toast.types').ToastProps} ToastProps
 * @typedef {import('./Toast.types').ToastContainerProps} ToastContainerProps
 * @typedef {import('./Toast.types').ToastContextType} ToastContextType
 */

/**
 * @typedef {Object} ToastAction
 * @property {string} text - Display text for the action button
 * @property {() => void} onClick - Callback when the action is clicked
 * @property {string} [ariaLabel] - ARIA label for the action button
 * @property {boolean} [closeOnClick=true] - Whether to close the toast when the action is clicked
 */

/**
 * @typedef {Object} ToastOptions
 * @property {string} [id] - Custom ID for the toast
 * @property {string} [title] - Optional title for the toast
 * @property {ToastAction} [action] - Optional action button configuration
 * @property {boolean} [autoClose=true] - Whether to auto-close the toast
 * @property {number} [duration=5000] - Duration in milliseconds before auto-close
 * @property {boolean} [showProgress=true] - Whether to show the progress bar
 * @property {string} [position='top-right'] - Position of the toast container
 * @property {number} [limit=5] - Maximum number of toasts to show
 * @property {string} [className] - Additional CSS class for the toast
 * @property {React.CSSProperties} [style] - Inline styles for the toast
 * @property {React.ReactNode} [icon] - Custom icon component
 * @property {boolean} [dismissible=true] - Whether the toast can be dismissed
 * @property {number} [pausedDuration=100] - Duration in ms to pause toast on hover
 */

/**
 * @typedef {'info' | 'success' | 'warning' | 'error' | 'default'} ToastType
 */

/**
 * @typedef {'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'} ToastPosition
 */

/**
 * @typedef {Object} ToastItem
 * @property {string} id
 * @property {string} message
 * @property {ToastType} type
 * @property {string} [title]
 * @property {ToastAction} [action]
 * @property {boolean} [autoClose]
 * @property {number} [duration]
 * @property {boolean} [showProgress]
 * @property {string} [className]
 * @property {React.CSSProperties} [style]
 * @property {React.ReactNode} [icon]
 * @property {boolean} [dismissible]
 */

/**
 * @type {React.Context<ToastContextType | null>}
 */
const ToastContext = createContext(null);

/**
 * Custom hook to use the toast context
 * @returns {ToastContextType}
 * @throws {Error} If used outside of a ToastProvider
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Toast notification component
 * @param {ToastProps} props - Component props
 */
// Default icons for each toast type
const iconMap = useMemo(() => ({
  info: <FiInfo className="toast-icon" aria-hidden="true" />,
  success: <FiCheckCircle className="toast-icon" aria-hidden="true" />,
  warning: <FiAlertTriangle className="toast-icon" aria-hidden="true" />,
  error: <FiAlertCircle className="toast-icon" aria-hidden="true" />,
  loading: <FiLoader className="toast-icon spin" aria-hidden="true" />,
  pause: <FiPause className="toast-icon" aria-hidden="true" />,
  play: <FiPlay className="toast-icon" aria-hidden="true" />,
}), []);

const Toast = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  onAction,
  actionLabel,
  secondaryAction,
  secondaryActionLabel,
  icon: CustomIcon,
  position = 'top-right',
  pauseOnHover = true,
  showCloseButton = true,
  showProgress = true,
  showTimer = false,
  className = '',
  style = {},
  role = 'status',
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true,
  closeOnClick = false,
  render,
  theme = 'auto',
  priority = 'normal',
  group,
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration);
  const [isMounted, setIsMounted] = useState(false);
  
  const toastRef = useRef(null);
  const progressRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const remainingTimeRef = useRef(duration);
  const animationFrameRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
    setIsVisible(true);
    
    if (duration !== Infinity) {
      startTimer(duration);
    }
    
    return () => {
      setIsMounted(false);
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [duration]);

  // Format remaining time for display
  const formatTime = (ms) => {
    if (ms === Infinity) return '∞';
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  // Get accessibility label based on type
  const getAriaLabel = () => {
    const typeLabels = {
      info: 'Information',
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
      loading: 'Loading',
    };
    
    const typeLabel = typeLabels[type] || 'Notification';
    return title ? `${typeLabel}: ${title}` : typeLabel;
  };

  // Handle click on the toast
  const handleClick = (e) => {
    if (closeOnClick && !e.defaultPrevented) {
      handleClose();
    }
  };

  // Handle pause on hover
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      setIsPaused(true);
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      if (startTimeRef.current) {
        const elapsedTime = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, duration - elapsedTime);
        setRemainingTime(remainingTimeRef.current);
      }
      
      // Pause any ongoing animations
      if (progressRef.current) {
        progressRef.current.style.animationPlayState = 'paused';
      }
    }
  }, [duration, pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (!isPaused) return;

    // Small delay before resuming to prevent accidental hovers
    setTimeout(() => {
      setIsPaused(false);
    }, 100);
  }, [isPaused]);

  /**
   * Handle closing the toast
   * @param {MouseEvent} [event] - Optional click event
   */
  const handleClose = useCallback((e) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!isMounted) return;
    
    // Trigger exit animation
    setIsExiting(true);
    
    // Wait for animation to complete before calling onClose
    const timer = setTimeout(() => {
      if (onClose) {
        onClose(id);
      }
    }, 300); // Match this with CSS transition duration
    
    return () => clearTimeout(timer);
  }, [id, onClose, isMounted]);

  /**
   * Start the timer for the toast
   * @param {number} timeLeft - Time left in milliseconds
   */
  const startTimer = useCallback((timeLeft) => {
    if (timeLeft <= 0) {
      handleClose();
      return;
    }
    
    startTimeRef.current = Date.now();
    remainingTimeRef.current = timeLeft;
    setRemainingTime(timeLeft);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      handleClose();
    }, timeLeft);
    
    // Start progress bar animation
    if (showProgress && progressRef.current) {
      const progressTransition = `transform ${timeLeft}ms linear`;
      progressRef.current.style.transition = progressTransition;
      progressRef.current.style.transform = 'scaleX(0)';
      progressRef.current.style.animation = 'none';
      progressRef.current.offsetHeight; // Force reflow
      progressRef.current.style.transform = 'scaleX(0)';
      
      // For browsers that support the Web Animations API
      if (progressRef.current.animate) {
        progressRef.current.animate(
          [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
          { duration: timeLeft, easing: 'linear' }
        );
      }
    }
    
    // Start the update loop for the timer
    lastUpdateTimeRef.current = Date.now();
    
    const updateTimer = () => {
      if (!isPaused && isMounted) {
        const now = Date.now();
        const elapsed = now - lastUpdateTimeRef.current;
        lastUpdateTimeRef.current = now;
        
        setRemainingTime(prev => {
          const newTime = Math.max(0, prev - elapsed);
          remainingTimeRef.current = newTime;
          return newTime;
        });
        
        if (remainingTimeRef.current > 0) {
          animationFrameRef.current = requestAnimationFrame(updateTimer);
        }
      }
    };
    
    if (showTimer) {
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showProgress, showTimer, isPaused, isMounted]);

  // Build class names
  const toastClasses = [
    'toast',
    `toast-${type}`,
    isExiting ? 'exiting' : '',
    isPaused ? 'paused' : '',
    showProgress ? 'toast-has-progress' : '',
    (onAction || secondaryAction) ? 'toast-has-actions' : '',
    group ? `toast-group-${group}` : '',
    `toast-priority-${priority}`,
    `toast-theme-${theme}`,
    className,
  ].filter(Boolean).join(' ');
  
  const containerClasses = [
    'toast-container',
    `toast-${position}`,
    `toast-theme-${theme}`,
  ].filter(Boolean).join(' ');
  
  // ARIA attributes
  const ariaProps = {
    role,
    'aria-live': ariaLive,
    'aria-atomic': ariaAtomic,
    'aria-label': getAriaLabel(),
  };
  
  // If it's a custom render, let the render function handle everything
  if (typeof render === 'function') {
    return (
      <div className={containerClasses}>
        {render({
          id,
          type,
          title,
          message,
          duration,
          remainingTime,
          isPaused,
          isExiting,
          onClose: handleClose,
          onAction,
          actionLabel,
          onPause: () => setIsPaused(true),
          onResume: () => setIsPaused(false),
          togglePause: () => setIsPaused(!isPaused),
        })}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div
        ref={toastRef}
        className={toastClasses}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        {...ariaProps}
        {...rest}
      >
        <div className="toast-icon" aria-hidden="true">
          {CustomIcon || iconMap[type] || iconMap.info}
        </div>
        
        <div className="toast-content">
          <div className="toast-header">
            {title && <div className="toast-title">{title}</div>}
            <div className="toast-header-actions">
              {showTimer && remainingTime !== Infinity && (
                <div className="toast-timer" aria-hidden="true">
                  <FiClock size={12} />
                  <span>{formatTime(remainingTime)}</span>
                </div>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  className="toast-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  aria-label="Close notification"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          </div>
          
          {message && <div className="toast-message">{message}</div>}
          
          {(onAction || secondaryAction) && (
            <div className="toast-actions">
              {onAction && (
                <button
                  type="button"
                  className="toast-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction();
                    handleClose();
                  }}
                >
                  {actionLabel || 'Action'}
                </button>
              )}
              {secondaryAction && (
                <button
                  type="button"
                  className="toast-action toast-action-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    secondaryAction();
                    if (secondaryActionLabel !== 'Dismiss') {
                      handleClose();
                    }
                  }}
                >
                  {secondaryActionLabel || 'Dismiss'}
                </button>
              )}
            </div>
          )}
        </div>
        
        {showProgress && duration !== Infinity && (
          <div className="toast-progress-container">
            <div
              ref={progressRef}
              className="toast-progress"
              style={{
                backgroundColor: `var(--toast-${type})`,
                transform: 'scaleX(1)',
                transformOrigin: 'left center',
              }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      )}
    </div>
  );
};

/**
 * ToastContainer component to manage multiple toasts
 * @param {Object} props
 * @param {ToastPosition} [props.position='top-right'] - Position of the toast container
 * @param {number} [props.limit=5] - Maximum number of toasts to show
 * @param {string} [props.className] - Additional CSS class for the container
 * @param {React.CSSProperties} [props.style] - Inline styles for the container
 */
// Toast queue management
const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      // If toast with same ID exists, update it
      const existingToastIndex = state.findIndex(t => t.id === action.toast.id);
      if (existingToastIndex >= 0) {
        const updatedToasts = [...state];
        updatedToasts[existingToastIndex] = {
          ...updatedToasts[existingToastIndex],
          ...action.toast,
          // Preserve these values if not overridden
          id: action.toast.id || updatedToasts[existingToastIndex].id,
          onClose: action.toast.onClose || updatedToasts[existingToastIndex].onClose,
        };
        return updatedToasts;
      }
      // Add new toast and respect the limit
      return [...state, action.toast].slice(-action.limit);
      
    case 'REMOVE_TOAST':
      return state.filter(toast => toast.id !== action.id);
      
    case 'CLEAR_TOASTS':
      return [];
      
    default:
      return state;
  }
};

const ToastContainer = ({
  position = 'top-right',
  limit = 5,
  className = '',
  style = {},
  toastComponent: ToastComponent = Toast,
}) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const toastQueue = useRef([]);
  const isProcessingQueue = useRef(false);

  const processQueue = useCallback(() => {
    if (isProcessingQueue.current || toastQueue.current.length === 0) return;
    
    isProcessingQueue.current = true;
    
    while (toastQueue.current.length > 0 && toasts.length < limit) {
      const toast = toastQueue.current.shift();
      dispatch({ type: 'ADD_TOAST', toast, limit });
    }
    
    isProcessingQueue.current = false;
  }, [toasts.length, limit]);

  const addToast = useCallback((type, message, options = {}) => {
    const id = options.id || Math.random().toString(36).substr(2, 9);
    const toast = {
      id,
      type,
      message,
      autoClose: true,
      duration: 5000,
      showProgress: true,
      dismissible: true,
      ...options,
    };

    if (toasts.length >= limit) {
      // Add to queue if we're at the limit
      toastQueue.current.push(toast);
      return id;
    }

    dispatch({ type: 'ADD_TOAST', toast, limit });
    return id;
  }, [limit, toasts.length]);

  const removeToast = useCallback((id) => {
    const toastToRemove = toasts.find(t => t.id === id);
    if (toastToRemove?.onClose) {
      toastToRemove.onClose();
    }
    
    dispatch({ type: 'REMOVE_TOAST', id });
    
    // Process queue after removal
    processQueue();
  }, [toasts, processQueue]);

  const clearToasts = useCallback(() => {
    // Call onClose for all toasts being removed
    toasts.forEach(toast => {
      if (toast.onClose) {
        toast.onClose();
      }
    });
    
    dispatch({ type: 'CLEAR_TOASTS' });
    toastQueue.current = [];
  }, [toasts]);

  // Create methods object with memoization
  const methods = useMemo(
    () => ({
      info: (message, options) => addToast('info', message, options),
      success: (message, options) => addToast('success', message, options),
      warning: (message, options) => addToast('warning', message, options),
      error: (message, options) => addToast('error', message, options),
      default: (message, options) => addToast('default', message, options),
      promise: (promise, messages, options = {}) => {
        const id = addToast('info', messages.loading, {
          ...options,
          isLoading: true,
          autoClose: false,
          dismissible: false,
        });
        
        return promise
          .then(result => {
            removeToast(id);
            if (messages.success) {
              addToast('success', messages.success, {
                ...options,
                duration: 3000,
              });
            }
            return result;
          })
          .catch(error => {
            removeToast(id);
            const errorMessage = messages.error || 'An error occurred';
            addToast('error', typeof errorMessage === 'function' ? errorMessage(error) : errorMessage, {
              ...options,
              duration: 5000,
            });
            throw error;
          });
      },
      remove: removeToast,
      clear: clearToasts,
    }),
    [addToast, removeToast, clearToasts]
  );

  // Process queue when toasts change
  useEffect(() => {
    processQueue();
  }, [toasts.length, processQueue]);

  return (
    <ToastContext.Provider value={methods}>
      <div
        className={`toast-container toast-${position} ${className}`}
        style={style}
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        <TransitionGroup component={null}>
          {toasts.map((toast) => (
            <CSSTransition
              key={toast.id}
              timeout={300}
              classNames="toast"
              unmountOnExit
            >
              <ToastComponent
                {...toast}
                onClose={removeToast}
              />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
    </ToastContext.Provider>
  );
};

ToastContainer.propTypes = {
  /** Position of the toast container */
  position: PropTypes.oneOf([
    'top-right',
    'top-left',
    'bottom-right',
    'bottom-left',
    'top-center',
    'bottom-center',
  ]),
  /** Maximum number of toasts to show at once */
  limit: PropTypes.number,
  /** Additional CSS class name */
  className: PropTypes.string,
  /** Inline styles */
  style: PropTypes.object,
  /** Custom toast component to render */
  toastComponent: PropTypes.elementType,
  /** Whether to pause toast timers when window loses focus */
  pauseOnFocusLoss: PropTypes.bool,
};

ToastContainer.defaultProps = {
  position: 'top-right',
  limit: 5,
  className: '',
  style: {},
};

// PropTypes for the Toast component
Toast.propTypes = {
  /** Unique identifier for the toast */
  id: PropTypes.string.isRequired,
  /** Type of toast notification */
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error', 'default']),
  /** Message to display in the toast */
  message: PropTypes.string.isRequired,
  /** Optional title for the toast */
  title: PropTypes.string,
  /** Callback function when toast is closed */
  onClose: PropTypes.func.isRequired,
  /** Whether the toast should auto-close */
  autoClose: PropTypes.bool,
  /** Duration in milliseconds before auto-closing */
  duration: PropTypes.number,
  /** Whether to show the progress bar */
  showProgress: PropTypes.bool,
  /** Action button configuration */
  action: PropTypes.shape({
    /** Text to display on the action button */
    text: PropTypes.string.isRequired,
    /** Callback when action button is clicked */
    onClick: PropTypes.func.isRequired,
    /** ARIA label for the action button */
    ariaLabel: PropTypes.string,
    /** Whether to close the toast after action is clicked */
    closeOnClick: PropTypes.bool,
  }),
  /** Additional CSS class name */
  className: PropTypes.string,
  /** Inline styles */
  style: PropTypes.object,
  /** Custom icon component */
  icon: PropTypes.node,
  /** Whether the toast can be dismissed */
  dismissible: PropTypes.bool,
  /** Duration in milliseconds to pause toast on hover */
  pausedDuration: PropTypes.number,
};

// Default props for the Toast component
Toast.defaultProps = {
  type: 'info',
  autoClose: true,
  duration: 5000,
  showProgress: true,
  dismissible: true,
  pausedDuration: 100,
};

export { 
  Toast, 
  ToastContainer, 
  ToastContext, 
  useToast 
};

export default ToastContainer;