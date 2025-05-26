import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash, FaTimes, FaLightbulb, FaSun, FaMoon } from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';
import './VoiceSearch.css';

// Default commands that the voice search can recognize
const DEFAULT_COMMANDS = {
  SEARCH: ['search for', 'find', 'look for', 'show me', 'where can i find'],
  NAVIGATE: ['go to', 'open', 'navigate to', 'take me to', 'show me the'],
  CART: ['cart', 'shopping cart', 'my cart', 'view cart'],
  CHECKOUT: ['checkout', 'buy now', 'purchase', 'complete purchase', 'proceed to checkout'],
  HELP: ['help', 'support', 'assistance', 'how to'],
  ACCOUNT: ['my account', 'account', 'profile', 'my profile'],
  SETTINGS: ['settings', 'preferences', 'options'],
  SEARCH_HISTORY: ['history', 'recent searches', 'previous searches'],
  FAVORITES: ['favorites', 'saved items', 'wishlist', 'my list'],
  ORDERS: ['my orders', 'order history', 'recent orders']
};

// Available languages for speech recognition
const LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Español' },
  { code: 'fr-FR', name: 'Français' },
  { code: 'de-DE', name: 'Deutsch' },
  { code: 'it-IT', name: 'Italiano' },
  { code: 'pt-BR', name: 'Português' },
  { code: 'ru-RU', name: 'Русский' },
  { code: 'zh-CN', name: '中文' },
  { code: 'ja-JP', name: '日本語' },
  { code: 'ko-KR', name: '한국어' },
  { code: 'hi-IN', name: 'हिन्दी' },
  { code: 'ar-SA', name: 'العربية' }
];

const VoiceSearch = ({
  onCommandDetected,
  customCommands = {},
  position = 'bottom-right',
  theme = 'auto',
  autoStart = false,
  showExamples = true,
  showConfidence = true,
  showLanguageSelector = true,
  showThemeToggle = true,
  className = '',
  style = {}
}) => {
  const [isListening, setIsListening] = useState(autoStart);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState('');
  const [supported, setSupported] = useState(true);
  const [confidence, setConfidence] = useState(0);
  const [language, setLanguage] = useState('en-US');
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [recognitionError, setRecognitionError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinal, setIsFinal] = useState(false);
  const [interimResults, setInterimResults] = useState([]);
  const [finalResults, setFinalResults] = useState([]);
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const navigate = useNavigate();
  const modalRef = useRef(null);
  
  // Merge default commands with custom commands
  const commands = useMemo(() => ({
    ...DEFAULT_COMMANDS,
    ...customCommands
  }), [customCommands]);

  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  // Check for dark mode preference
  useEffect(() => {
    if (theme === 'auto' && isBrowser) {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => setIsDarkMode(e.matches);
      
      setIsDarkMode(darkModeMediaQuery.matches);
      darkModeMediaQuery.addListener(handleChange);
      
      return () => darkModeMediaQuery.removeListener(handleChange);
    } else {
      setIsDarkMode(theme === 'dark');
    }
  }, [theme]);
  
  // Add dark mode class to document
  useEffect(() => {
    if (isBrowser) {
      if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }, [isDarkMode, isBrowser]);
  
  // Initialize speech recognition
  useEffect(() => {
    if (!isBrowser) return;
    
    const initSpeechRecognition = () => {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
          setSupported(false);
          setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
          return null;
        }
        
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;
        
        // Set up audio context for volume visualization
        if (window.AudioContext || window.webkitAudioContext) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          audioContextRef.current = new AudioContext();
          
          if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(console.error);
          }
          
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 32;
        }
        
        setSpeechRecognition(recognition);
        setIsInitialized(true);
        
        if (autoStart) {
          startListening();
        }
        
        return recognition;
      } catch (err) {
        console.error('Error initializing speech recognition:', err);
        setSupported(false);
        setError('Failed to initialize speech recognition. Please check your microphone permissions and try again.');
        return null;
      }
    };
    
    const recognition = initSpeechRecognition();
    recognitionRef.current = recognition;
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isBrowser, language, autoStart]);

  useEffect(() => {
    // Check if SpeechRecognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  // Set up event listeners for speech recognition
  useEffect(() => {
    if (!speechRecognition || !isInitialized) return;
    
    const handleResult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let finalResult = '';
      let newInterimResults = [];
      let newFinalResults = [];
      let finalConfidence = 0;
      let resultCount = 0;
      
      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript || '';
        const isFinal = result.isFinal;
        const confidence = result[0]?.confidence || 0;
        
        if (isFinal) {
          finalTranscript += text + ' ';
          finalResult = text;
          finalConfidence += confidence;
          resultCount++;
          newFinalResults = [...newFinalResults, { text, confidence }];
        } else {
          interimTranscript += text + ' ';
          newInterimResults = [...newInterimResults, { text, confidence }];
        }
      }
      
      // Update state
      setTranscript(interimTranscript.trim());
      setInterimResults(newInterimResults);
      
      if (finalResult) {
        setFinalTranscript(finalResult.trim());
        setFinalResults(prev => [...prev, ...newFinalResults].slice(-10)); // Keep last 10 results
        setConfidence(resultCount > 0 ? finalConfidence / resultCount : 0);
        setIsFinal(true);
        
        // Process the final command
        processCommand(finalResult.trim());
      } else {
        setIsFinal(false);
      }
      
      // Update volume visualization
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average / 255);
      }
    };
    
    const handleError = (event) => {
      console.error('Speech recognition error:', event.error);
      setRecognitionError(event.error);
      
      let errorMessage = `Error: ${event.error}`;
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech was detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone was found or microphone is disabled.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
          break;
        case 'language-not-supported':
          errorMessage = 'The selected language is not supported.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service is not allowed. Please check your browser settings.';
          break;
        case 'aborted':
          // Don't show error for aborted events (happens when stopping manually)
          return;
      }
      
      setError(errorMessage);
      setIsListening(false);
      setIsSpeaking(false);
    };
    
    const handleStart = () => {
      setIsListening(true);
      setIsSpeaking(true);
      setError('');
      setRecognitionError(null);
    };
    
    const handleEnd = () => {
      if (!isPaused) {
        setIsListening(false);
        setIsSpeaking(false);
      }
    };
    
    speechRecognition.onresult = handleResult;
    speechRecognition.onerror = handleError;
    speechRecognition.onstart = handleStart;
    speechRecognition.onend = handleEnd;
    
    return () => {
      speechRecognition.onresult = null;
      speechRecognition.onerror = null;
      speechRecognition.onstart = null;
      speechRecognition.onend = null;
    };
  }, [speechRecognition, isInitialized, isPaused]);

  // Handle auto-start
  useEffect(() => {
    if (autoStart && isInitialized && !isListening) {
      startListening();
    }
  }, [autoStart, isInitialized, isListening]);
  
  // Handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        stopListening();
      }
    };
    
    if (isListening) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isListening]);

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    setFinalTranscript('');
    setError('');
    setConfidence(0);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;
    
    recognition.onstart = () => {
      console.log('Voice recognition started');
    };
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscriptValue = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          finalTranscriptValue += transcript;
          setConfidence(confidence);
        } else {
          interimTranscript += transcript;
        }
      }
      
      setTranscript(interimTranscript);
      
      if (finalTranscriptValue) {
        setFinalTranscript(finalTranscriptValue);
      }
    };
    
    recognition.onerror = (event) => {
      let errorMessage = `Error occurred in recognition: ${event.error}`;
      
      // Provide more user-friendly error messages
      if (event.error === 'no-speech') {
        errorMessage = 'No speech was detected. Please try again.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'No microphone was found or microphone is disabled.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Microphone permission was denied. Please allow microphone access.';
      }
      
      setError(errorMessage);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    try {
      recognition.start();
    } catch (err) {
      setError('Failed to start voice recognition. Please try again.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const processCommand = (text) => {
    const lowerText = text.toLowerCase().trim();
    const commands = allCommands();
    
    // Check for search commands
    for (const searchTerm of commands.SEARCH) {
      if (lowerText.startsWith(searchTerm)) {
        const query = lowerText.replace(searchTerm, '').trim();
        if (query) {
          handleSearch(query);
          return;
        }
      }
    }
    
    // Check for navigation commands
    for (const navTerm of commands.NAVIGATE) {
      if (lowerText.startsWith(navTerm)) {
        const destination = lowerText.replace(navTerm, '').trim();
        handleNavigation(destination);
        return;
      }
    }
    
    // Check for cart command
    if (commands.CART.some(term => lowerText.includes(term))) {
      navigate('/vendi/cart');
      return;
    }
    
    // Check for checkout command
    if (commands.CHECKOUT.some(term => lowerText.includes(term))) {
      navigate('/vendi/checkout');
      return;
    }
    
    // Check for help command
    if (commands.HELP.some(term => lowerText.includes(term))) {
      navigate('/email-support');
      return;
    }
    
    // If no command is detected, treat as a search
    handleSearch(lowerText);
    
    // Notify parent component about the command
    if (onCommandDetected) {
      onCommandDetected({
        type: 'search',
        text: lowerText,
        confidence
      });
    }
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/vendi/search?q=${encodeURIComponent(query.trim())}`);
    }
  };
  
  const handleNavigation = (destination) => {
    // Map common spoken destinations to routes
    const routeMap = {
      'home': '/',
      'products': '/vendi/products/all',
      'electronics': '/vendi/products/electronics',
      'clothing': '/vendi/products/clothing',
      'sports': '/vendi/products/sports-outdoor',
      'beauty': '/vendi/products/beauty',
      'food': '/vendi/products/food',
      'dashboard': '/vendi/dashboard',
      'profile': '/vendi/profile-settings',
      'about': '/about',
      'contact': '/contact'
    };
    
    // Check if the destination matches any known route
    for (const [key, route] of Object.entries(routeMap)) {
      if (destination.includes(key)) {
        navigate(route);
        return;
      }
    }
    
    // If no match, search for the destination
    handleSearch(destination);
  };

  // Helper function to render command examples
  const renderCommandExamples = () => {
    return (
      <div className="voice-command-examples">
        <h4>Try saying:</h4>
        <ul>
          <li>"Search for blue shirts"</li>
          <li>"Go to electronics"</li>
          <li>"Show me sports equipment"</li>
          <li>"Open my cart"</li>
        </ul>
      </div>
    );
  };

  if (!supported) {
    return (
      <div className="voice-search-container">
        <button className="voice-search-button disabled" disabled title="Voice search not supported on your browser">
          <i className="mic-icon">🎤</i>
        </button>
        <div className="voice-search-unsupported">
          <p>Voice search is not supported in your browser.</p>
          <p>Try using Chrome, Edge, or Safari for this feature.</p>
        </div>
      </div>
    );
  }

  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Toggle pause/resume
  const togglePause = () => {
    if (isPaused) {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
    setIsPaused(!isPaused);
  };

  return (
    <div 
      className={`voice-search-container ${className} ${isDarkMode ? 'dark' : ''}`}
      style={style}
      data-theme={isDarkMode ? 'dark' : 'light'}
    >
      {/* Main microphone button */}
      <button 
        className={`voice-search-button ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
        onClick={toggleListening}
        onMouseDown={(e) => e.preventDefault()} // Prevent focus outline on click
        aria-label={isListening ? 'Stop listening' : 'Start voice search'}
        aria-pressed={isListening}
        disabled={!isInitialized}
        title={isListening ? 'Stop listening' : 'Start voice search'}
      >
        {isListening ? (
          <FaMicrophoneSlash className="mic-icon" />
        ) : (
          <FaMicrophone className="mic-icon" />
        )}
        {isSpeaking && (
          <div className="volume-indicator" style={{
            transform: `scale(${1 + (volume * 0.5)})`,
            opacity: volume * 0.7 + 0.3
          }} />
        )}
        <span className="sr-only">
          {isListening ? 'Stop listening' : 'Start voice search'}
        </span>
      </button>
      
      {/* Voice search modal */}
      {isListening && (
        <div className="voice-search-modal" ref={modalRef}>
          <div className="voice-search-header">
            <div className="header-left">
              <h3>Voice Search</h3>
              {isSpeaking && (
                <span className="recording-indicator">
                  <span className="pulse-dot"></span>
                  Recording
                </span>
              )}
            </div>
            
            <div className="header-actions">
              {showLanguageSelector && (
                <div className="language-selector">
                  <select 
                    value={language} 
                    onChange={(e) => changeLanguage(e.target.value)}
                    disabled={isListening && !isPaused}
                    aria-label="Select language"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <button 
                className="icon-button settings-button"
                onClick={toggleSettings}
                aria-label="Settings"
                aria-expanded={showSettings}
              >
                <IoMdSettings />
              </button>
              
              <button 
                className="icon-button close-button" 
                onClick={stopListening}
                aria-label="Close voice search"
              >
                <FaTimes />
              </button>
            </div>
          </div>
          
          {/* Settings panel */}
          {showSettings && (
            <div className="settings-panel">
              <h4>Settings</h4>
              <div className="setting-option">
                <label>
                  <input 
                    type="checkbox" 
                    checked={showExamples}
                    onChange={() => {}}
                    disabled={isListening && !isPaused}
                  />
                  Show command examples
                </label>
              </div>
              <div className="setting-option">
                <label>
                  <input 
                    type="checkbox" 
                    checked={showConfidence}
                    onChange={() => {}}
                    disabled={isListening && !isPaused}
                  />
                  Show confidence level
                </label>
              </div>
              <div className="setting-option">
                <label>
                  <input 
                    type="checkbox" 
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                  />
                  Dark mode
                </label>
              </div>
            </div>
          )}
          
          <div className="voice-search-content">
            {/* Listening indicator */}
            <div className="listening-indicator">
              <div className="wave-animation">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span 
                    key={i} 
                    style={{
                      height: `${20 + (volume * 40 * (i % 2 === 0 ? 1 : 0.7))}px`,
                      animationDelay: `${i * 0.1}s`,
                      opacity: 0.7 + (volume * 0.3)
                    }}
                  />
                ))}
              </div>
              <p>{isPaused ? 'Paused' : isSpeaking ? 'Listening...' : 'Ready'}</p>
              
              {confidence > 0 && showConfidence && (
                <div className="confidence-display">
                  Confidence: {Math.round(confidence * 100)}%
                </div>
              )}
            </div>
            
            {/* Transcript */}
            {(transcript || finalTranscript) && (
              <div className="transcript-container">
                <div className="transcript-header">
                  <h4>Transcript</h4>
                  <div className="transcript-actions">
                    {isSpeaking && (
                      <button 
                        className="icon-button"
                        onClick={togglePause}
                        aria-label={isPaused ? 'Resume' : 'Pause'}
                      >
                        {isPaused ? '▶️' : '⏸️'}
                      </button>
                    )}
                    <button 
                      className="icon-button"
                      onClick={() => {
                        setTranscript('');
                        setFinalTranscript('');
                        setInterimResults([]);
                        setFinalResults([]);
                      }}
                      aria-label="Clear transcript"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="transcript-content">
                  {finalTranscript ? (
                    <div className="final-transcript">
                      <p>{finalTranscript}</p>
                      {showConfidence && confidence > 0 && (
                        <div 
                          className="confidence-meter" 
                          title={`Confidence: ${Math.round(confidence * 100)}%`}
                        >
                          <div 
                            className="confidence-bar" 
                            style={{ 
                              width: `${Math.min(100, Math.max(10, confidence * 100))}%`,
                              backgroundColor: confidence > 0.8 ? '#10b981' : 
                                             confidence > 0.5 ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : transcript ? (
                    <div className="interim-transcript">
                      <p>{transcript}</p>
                      <div className="wave-preview">
                        {Array(20).fill(0).map((_, i) => (
                          <span 
                            key={i}
                            style={{
                              height: `${5 + Math.random() * 15}px`,
                              animationDelay: `${i * 0.05}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="no-transcript">
                      <p>Speak now or say "help" for commands</p>
                    </div>
                  )}
                </div>
                
                {finalResults.length > 0 && (
                  <div className="transcript-history">
                    <h5>Previous commands</h5>
                    <ul>
                      {[...finalResults].reverse().map((result, i) => (
                        <li 
                          key={i}
                          className="history-item"
                          onClick={() => processCommand(result.text)}
                          title={`Confidence: ${Math.round(result.confidence * 100)}%`}
                        >
                          {result.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <div className="error-actions">
                  <button 
                    className="retry-button" 
                    onClick={startListening}
                  >
                    Try Again
                  </button>
                  <button 
                    className="dismiss-button"
                    onClick={() => setError('')}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
            
            {/* Command examples */}
            {showExamples && !error && (
              <div className="command-examples">
                <h4>Try saying:</h4>
                <div className="example-grid">
                  <div className="example-category">
                    <h5>Search</h5>
                    <ul>
                      <li>"Search for blue shirts"</li>
                      <li>"Find wireless headphones"</li>
                      <li>"Show me deals on laptops"</li>
                    </ul>
                  </div>
                  <div className="example-category">
                    <h5>Navigate</h5>
                    <ul>
                      <li>"Go to electronics"</li>
                      <li>"Open my cart"</li>
                      <li>"Show me my orders"</li>
                    </ul>
                  </div>
                  <div className="example-category">
                    <h5>Actions</h5>
                    <ul>
                      <li>"Add to cart"</li>
                      <li>"Checkout"</li>
                      <li>"Help"</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <p className="voice-search-hint">
              {transcript ? 'Keep speaking...' : 'Say what you\'re looking for...'}
            </p>
          </div>
          
          <div className="voice-search-footer">
            <button className="cancel-button" onClick={stopListening}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;