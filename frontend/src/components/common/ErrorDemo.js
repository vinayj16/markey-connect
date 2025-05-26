import React from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import { Button, Typography, Box, Paper } from '@mui/material';

// A component that throws an error when the button is clicked
const ErrorProneComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('This is a simulated error!');
  }

  return (
    <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, mt: 2 }}>
      <Typography variant="h6">Safe Component</Typography>
      <Typography>This component is working correctly.</Typography>
    </Box>
  );
};

// A demo component to show different error boundary usages
const ErrorDemo = () => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Error Boundary Demo
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          1. Basic Error Boundary
        </Typography>
        <ErrorBoundary 
          componentName="ErrorDemo/Basic"
          navigate={navigate}
          customMessage="Something went wrong in the demo component"
        >
          <ErrorProneComponent shouldThrow={false} />
        </ErrorBoundary>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          2. Error Boundary with Error
        </Typography>
        <Typography color="error" gutterBottom>
          Click the button to simulate an error
        </Typography>
        <ErrorBoundary 
          componentName="ErrorDemo/WithError"
          navigate={navigate}
        >
          <ErrorProneComponent shouldThrow={false} />
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => { throw new Error('Button click error!'); }}
            sx={{ mt: 2 }}
          >
            Throw Error
          </Button>
        </ErrorBoundary>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          3. Error Boundary with Custom Fallback
        </Typography>
        <ErrorBoundary 
          componentName="ErrorDemo/WithCustomFallback"
          fallback={(error, resetError) => (
            <Box sx={{ p: 2, bgcolor: '#fff8e1', borderRadius: 1 }}>
              <Typography color="error" variant="h6">
                Custom Error Handler
              </Typography>
              <Typography>{error?.message}</Typography>
              <Button 
                onClick={resetError}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              >
                Reset Error
              </Button>
            </Box>
          )}
        >
          <ErrorProneComponent shouldThrow={true} />
        </ErrorBoundary>
      </Paper>
    </Box>
  );
};

export default ErrorDemo;
