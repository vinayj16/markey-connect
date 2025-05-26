/**
 * Custom request logger middleware
 * Logs request details for debugging and monitoring
 */

// Format the log message
const formatLogMessage = (req, res) => {
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('user-agent') || 'unknown';
  const contentLength = res.get('content-length') || 0;
  const responseTime = res.responseTime || 0;
  
  return {
    timestamp: new Date().toISOString(),
    method,
    url: originalUrl,
    status: res.statusCode,
    contentLength: `${contentLength} bytes`,
    responseTime: `${responseTime} ms`,
    ip,
    userAgent
  };
};

// Request logger middleware
const requestLogger = (req, res, next) => {
  // Record start time
  const start = Date.now();
  
  // Once the response is finished
  res.on('finish', () => {
    // Calculate response time
    res.responseTime = Date.now() - start;
    
    // Format and log the request details
    const logData = formatLogMessage(req, res);
    
    // Log differently based on status code
    if (res.statusCode >= 500) {
      console.error('SERVER ERROR:', JSON.stringify(logData));
    } else if (res.statusCode >= 400) {
      console.warn('CLIENT ERROR:', JSON.stringify(logData));
    } else {
      console.log('REQUEST:', JSON.stringify(logData));
    }
  });
  
  next();
};

module.exports = {
  requestLogger
};