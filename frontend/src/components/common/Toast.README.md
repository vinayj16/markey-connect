# React Toast Notifications

A flexible, accessible, and customizable toast notification system for React applications.

## Features

- 🎨 Multiple toast types: info, success, warning, and error
- ⚡ Smooth animations with CSS transitions
- ♿ Built with accessibility in mind (ARIA attributes, keyboard navigation)
- 📱 Responsive design that works on all screen sizes
- 🎭 Customizable appearance and behavior
- ⏳ Auto-dismiss with progress indicator
- 🎯 Promise support with loading states
- 🚦 Queue system for handling many notifications
- 🛠 TypeScript support with detailed type definitions
- 🎨 Custom render props for complete control

## Installation

```bash
npm install react-transition-group @types/react-transition-group react-icons
```

## Basic Usage

### 1. Add the ToastContainer to your app

```jsx
import { ToastContainer } from './components/common/Toast';

function App() {
  return (
    <div className="app">
      <YourAppContent />
      <ToastContainer position="top-right" limit={5} />
    </div>
  );
}
```

### 2. Use the useToast hook to show notifications

```jsx
import { useToast } from './components/common/Toast';

function MyComponent() {
  const toast = useToast();

  const handleClick = () => {
    // Basic usage
    toast.success('Operation completed successfully!');
    
    // With options
    toast.info('Profile updated', {
      title: 'Success',
      duration: 3000,
      dismissible: true
    });
    
    // With action
    toast.warning('Item will be deleted', {
      action: {
        text: 'Undo',
        onClick: () => console.log('Undo delete'),
        closeOnClick: true
      }
    });
  };

  return <button onClick={handleClick}>Show Toast</button>;
}
```

## Advanced Usage

### Promise Handling

```jsx
const fetchData = async () => {
  const promise = fetch('/api/data').then(res => res.json());
  
  return toast.promise(promise, {
    loading: 'Loading data...',
    success: (data) => `Fetched ${data.items.length} items`,
    error: (err) => `Error: ${err.message}`
  });
};
```

### Custom Toast Component

```jsx
function CustomToast({ message, onClose, type }) {
  return (
    <div className={`custom-toast ${type}`}>
      <div className="custom-content">{message}</div>
      <button onClick={onClose} aria-label="Close">×</button>
    </div>
  );
}

// Usage
<ToastContainer 
  toastComponent={CustomToast}
  position="bottom-center"
/>
```

### Using Render Props

```jsx
toast.info('Custom render', {
  render: ({ message, onClose, isPaused }) => (
    <div className="custom-toast">
      <div>{message}</div>
      <button onClick={onClose}>Close</button>
      <div>Paused: {isPaused ? 'Yes' : 'No'}</div>
    </div>
  )
});
```

## API Reference

### ToastContainer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| position | 'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left' \| 'top-center' \| 'bottom-center' | 'top-right' | Position of the toast container |
| limit | number | 5 | Maximum number of toasts to show at once |
| className | string | '' | Additional CSS class name |
| style | CSSProperties | {} | Inline styles |
| toastComponent | React.ComponentType<ToastProps> | Toast | Custom toast component |
| pauseOnFocusLoss | boolean | true | Whether to pause toast timers when window loses focus |
| showQueueCount | boolean | false | Whether to show the number of queued toasts |

### useToast() Methods

| Method | Description |
|--------|-------------|
| info(message, options) | Show an info toast |
| success(message, options) | Show a success toast |
| warning(message, options) | Show a warning toast |
| error(message, options) | Show an error toast |
| default(message, options) | Show a default toast |
| promise(promise, messages, options) | Handle a promise with loading/error states |
| remove(id) | Remove a toast by ID |
| clear() | Remove all toasts |
| queueCount | Number of toasts in the queue |

### Toast Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| id | string | auto-generated | Unique ID for the toast |
| title | string | undefined | Optional title |
| action | { text: string, onClick: () => void, ariaLabel?: string, closeOnClick?: boolean } | undefined | Action button configuration |
| autoClose | boolean | true | Whether to auto-close the toast |
| duration | number | 5000 | Duration in milliseconds before auto-close |
| showProgress | boolean | true | Whether to show the progress bar |
| className | string | '' | Additional CSS class name |
| style | CSSProperties | {} | Inline styles |
| icon | ReactNode | undefined | Custom icon component |
| dismissible | boolean | true | Whether the toast can be dismissed |
| pausedDuration | number | 100 | Duration in milliseconds to pause toast on hover |
| onClose | () => void | undefined | Callback when the toast is closed |
| isLoading | boolean | false | Whether the toast is in a loading state |
| render | (props: ToastRenderProps) => ReactNode | undefined | Custom render function |
| pauseOnFocusLoss | boolean | true | Whether to pause timers when window loses focus |

## Accessibility

The toast component is built with accessibility in mind:

- Proper ARIA attributes for screen readers
- Keyboard navigation support (Escape to dismiss, Enter to click action)
- Reduced motion support
- Focus management
- High contrast mode support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE 11 (with polyfills)

## License

MIT
