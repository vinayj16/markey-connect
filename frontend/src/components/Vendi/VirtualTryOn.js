import React, { useState, useRef, useEffect } from 'react';
import './VirtualTryOn.css';

const VirtualTryOn = ({ productId, productType, productImages }) => {
  const [tryOnActive, setTryOnActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [virtualImage, setVirtualImage] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Check if this product supports virtual try-on
  const supportsTryOn = ['glasses', 'hats', 'jewelry', 'makeup'].includes(productType);

  useEffect(() => {
    // Clean up camera stream when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startTryOn = async () => {
    setTryOnActive(true);
    setLoading(true);
    setError(null);
    
    try {
      // Request camera permission with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setCameraPermission(true);
      setCameraActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraPermission(false);
      setError(err.message || 'Failed to access camera. Please check your camera permissions.');
    } finally {
      setLoading(false);
    }
  };

  const stopTryOn = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
    setTryOnActive(false);
    setVirtualImage(null);
    setError(null);
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get the captured image as a data URL
      const imageDataUrl = canvas.toDataURL('image/png');
      
      // In a real implementation, you would send this image to a server
      // for processing with the selected product overlay
      // For demo purposes, we'll simulate processing time
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setVirtualImage(imageDataUrl);
      setCameraActive(false);
    } catch (err) {
      console.error('Error capturing image:', err);
      setError('Failed to capture image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectProductImage = (image) => {
    setSelectedImage(image);
    // Reset virtual image when selecting a new product
    setVirtualImage(null);
    if (cameraActive) {
      setCameraActive(false);
    }
  };

  const handleShare = async () => {
    if (!virtualImage) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Virtual Try-On Result',
          text: 'Check out my virtual try-on result!',
          files: [await fetch(virtualImage).then(r => r.blob())]
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        const link = document.createElement('a');
        link.href = virtualImage;
        link.download = 'virtual-try-on.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Error sharing:', err);
      setError('Failed to share image. Please try downloading instead.');
    }
  };

  if (!supportsTryOn) return null;

  return (
    <div className="virtual-try-on">
      {!tryOnActive ? (
        <button 
          className="try-on-button"
          onClick={startTryOn}
          aria-label="Start virtual try-on"
        >
          <i className="try-on-icon">👓</i>
          <span>Virtual Try-On</span>
        </button>
      ) : (
        <div className="try-on-modal">
          <div className="try-on-content">
            <div className="try-on-header">
              <h3>Virtual Try-On</h3>
              <button 
                className="close-try-on" 
                onClick={stopTryOn}
                aria-label="Close virtual try-on"
              >
                ×
              </button>
            </div>
            
            {error && (
              <div className="camera-permission-denied">
                <p>{error}</p>
                <button 
                  className="retry-button"
                  onClick={startTryOn}
                >
                  Retry
                </button>
              </div>
            )}
            
            {loading ? (
              <div className="try-on-loading">
                <div className="spinner"></div>
                <p>Processing your virtual try-on...</p>
              </div>
            ) : cameraPermission === false ? (
              <div className="camera-permission-denied">
                <p>Camera access is required for virtual try-on.</p>
                <p>Please allow camera access and try again.</p>
                <button 
                  className="retry-button"
                  onClick={startTryOn}
                >
                  Retry
                </button>
              </div>
            ) : virtualImage ? (
              <div className="try-on-result">
                <div className="result-image-container">
                  <img src={virtualImage} alt="Virtual try-on result" />
                </div>
                
                <div className="result-actions">
                  <button 
                    className="try-again-button"
                    onClick={() => {
                      setVirtualImage(null);
                      setCameraActive(true);
                    }}
                  >
                    Try Again
                  </button>
                  
                  <button 
                    className="share-result-button"
                    onClick={handleShare}
                  >
                    Share Result
                  </button>
                  
                  <button 
                    className="download-result-button"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = virtualImage;
                      link.download = 'virtual-try-on.png';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    Download
                  </button>
                </div>
              </div>
            ) : cameraActive ? (
              <div className="camera-container">
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  aria-label="Camera feed"
                />
                
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                <div className="camera-overlay">
                  <div className="face-guide"></div>
                </div>
                
                <div className="camera-controls">
                  <button 
                    className="capture-button"
                    onClick={captureImage}
                    aria-label="Capture image"
                  >
                    <span className="capture-icon"></span>
                  </button>
                </div>
                
                <p className="camera-instructions">
                  Position your face within the guide and click the button to capture
                </p>
              </div>
            ) : null}
            
            <div className="product-options">
              <h4>Select Style</h4>
              <div className="product-images">
                {productImages.map((image, index) => (
                  <div 
                    key={index}
                    className={`product-image-option ${selectedImage === image ? 'selected' : ''}`}
                    onClick={() => selectProductImage(image)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        selectProductImage(image);
                      }
                    }}
                    aria-label={`Select style ${index + 1}`}
                  >
                    <img src={image} alt={`Product style ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualTryOn;