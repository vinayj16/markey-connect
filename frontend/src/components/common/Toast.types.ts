import { ReactNode, CSSProperties, ComponentType } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'default';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

export interface ToastAction {
  /** The button text */
  text: string;
  /** Callback function when the action button is clicked */
  onClick: () => void;
  /** Optional ARIA label for the action button (defaults to the button text) */
  ariaLabel?: string;
  /** Whether to close the toast after the action is clicked (defaults to true) */
  closeOnClick?: boolean;
}

export interface ToastOptions {
  /** Optional unique ID for the toast */
  id?: string;
  /** Optional title for the toast */
  title?: string;
  /** Optional action button configuration */
  action?: ToastAction;
  /** Whether to auto-close the toast (defaults to true) */
  autoClose?: boolean;
  /** Duration in milliseconds before auto-close (defaults to 5000) */
  duration?: number;
  /** Whether to show the progress bar (defaults to true) */
  showProgress?: boolean;
  /** Position of the toast container (defaults to 'top-right') */
  position?: ToastPosition;
  /** Maximum number of toasts to show at once (defaults to 5) */
  limit?: number;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Custom icon component */
  icon?: ReactNode;
  /** Whether the toast can be dismissed (defaults to true) */
  dismissible?: boolean;
  /** Duration in milliseconds to pause toast on hover (defaults to 100) */
  pausedDuration?: number;
  /** Callback function when the toast is closed */
  onClose?: () => void;
  /** Whether the toast is in a loading state */
  isLoading?: boolean;
  /** Custom render function for the toast */
  render?: (props: ToastRenderProps) => ReactNode;
  /** Whether to pause toast timers when window loses focus */
  pauseOnFocusLoss?: boolean;
}

export interface ToastProps extends Omit<ToastOptions, 'position' | 'limit' | 'onClose'> {
  /** Unique identifier for the toast */
  id: string;
  /** The message to display */
  message: string;
  /** The type of toast */
  type: ToastType;
  /** Callback function when the toast is closed */
  onClose: (id: string) => void;
}

export interface ToastRenderProps extends Omit<ToastProps, 'onClose' | 'type'> {
  /** Function to close the toast */
  onClose: () => void;
  /** Whether the toast is currently paused */
  isPaused: boolean;
  /** Current progress (0-100) of the toast */
  progress: number;
}

export interface ToastContainerProps {
  /** Position of the toast container (defaults to 'top-right') */
  position?: ToastPosition;
  /** Maximum number of toasts to show at once (defaults to 5) */
  limit?: number;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Custom toast component to render */
  toastComponent?: ComponentType<ToastProps>;
  /** Whether to pause toast timers when window loses focus */
  pauseOnFocusLoss?: boolean;
  /** Whether to show the number of queued toasts */
  showQueueCount?: boolean;
}

export interface PromiseMessages<T = any> {
  /** Message to show while the promise is pending */
  loading: string | ReactNode;
  /** Message to show when the promise resolves */
  success?: string | ReactNode | ((data: T) => string | ReactNode);
  /** Message to show when the promise rejects */
  error?: string | ReactNode | ((error: any) => string | ReactNode);
}

export interface ToastContextType {
  /** Show an info toast */
  info: (message: string | ReactNode, options?: Omit<ToastOptions, 'type'>) => string;
  /** Show a success toast */
  success: (message: string | ReactNode, options?: Omit<ToastOptions, 'type'>) => string;
  /** Show a warning toast */
  warning: (message: string | ReactNode, options?: Omit<ToastOptions, 'type'>) => string;
  /** Show an error toast */
  error: (message: string | ReactNode, options?: Omit<ToastOptions, 'type'>) => string;
  /** Show a default toast */
  default: (message: string | ReactNode, options?: Omit<ToastOptions, 'type'>) => string;
  /** Handle a promise with loading/error states */
  promise: <T = any>(
    promise: Promise<T>,
    messages: PromiseMessages<T>,
    options?: Omit<ToastOptions, 'type' | 'autoClose' | 'dismissible'>
  ) => Promise<T>;
  /** Remove a toast by ID */
  remove: (id: string) => void;
  /** Remove all toasts */
  clear: () => void;
  /** Get the number of toasts currently in the queue */
  queueCount: number;
}
