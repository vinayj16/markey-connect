import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI, publicAPI } from '../../utils/api';
import './ShoppingAssistant.css';

const ShoppingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Initial greeting message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: 'assistant',
        text: "Hi there! I'm your shopping assistant. How can I help you today?",
        timestamp: new Date()
      }
    ]);
    
    // Load suggested queries
    setSuggestions([
      "Find electronics under $100",
      "What's trending in fashion?",
      "Help me choose a laptop",
      "Show me sustainable products"
    ]);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async (text = inputValue) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Get AI response
      const response = await simulateAIResponse(text);
      
      // Add assistant message
      const assistantMessage = {
        id: messages.length + 2,
        sender: 'assistant',
        text: response.text,
        products: response.products,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error getting AI response:', err);
      
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        sender: 'assistant',
        text: "I'm sorry, I encountered an error. Please try again.",
        isError: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const simulateAIResponse = async (query) => {
    // This is a placeholder for a real AI service
    // In a production app, this would call a backend API
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple keyword matching for demo purposes
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('laptop') || lowerQuery.includes('computer')) {
      try {
        const response = await publicAPI.searchProducts('laptop');
        return {
          text: "I found some laptops that might interest you. Here are a few options:",
          products: response.data.slice(0, 3)
        };
      } catch (err) {
        return {
          text: "I can help you find a laptop. What's your budget and what will you be using it for?",
          products: []
        };
      }
    } else if (lowerQuery.includes('electronics') || lowerQuery.includes('gadget')) {
      return {
        text: "We have a great selection of electronics! Are you looking for something specific like smartphones, headphones, or smart home devices?",
        products: []
      };
    } else if (lowerQuery.includes('fashion') || lowerQuery.includes('clothing') || lowerQuery.includes('wear')) {
      return {
        text: "Our fashion collection has the latest trends. Are you shopping for men's, women's, or children's clothing?",
        products: []
      };
    } else if (lowerQuery.includes('sustainable') || lowerQuery.includes('eco')) {
      return {
        text: "We're proud of our sustainable product selection! These items are made with eco-friendly materials and ethical manufacturing practices.",
        products: []
      };
    } else if (lowerQuery.includes('trending') || lowerQuery.includes('popular')) {
      try {
        const response = await publicAPI.getTrendingProducts();
        return {
          text: "Here are some trending products right now:",
          products: response.data.slice(0, 3)
        };
      } catch (err) {
        return {
          text: "I can show you what's trending. Would you like to see trending items in a specific category?",
          products: []
        };
      }
    } else if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('expensive')) {
      return {
        text: "We have products at various price points. Could you tell me your budget range so I can find the best options for you?",
        products: []
      };
    } else if (lowerQuery.includes('compare') || lowerQuery.includes('difference')) {
      return {
        text: "Comparing products is a great way to make the right choice! Tell me which specific items you're considering, and I can highlight the key differences.",
        products: []
      };
    } else if (lowerQuery.includes('thank')) {
      return {
        text: "You're welcome! Is there anything else I can help you with today?",
        products: []
      };
    } else if (lowerQuery.includes('bye') || lowerQuery.includes('goodbye')) {
      return {
        text: "Thank you for chatting! Feel free to come back if you have more questions. Happy shopping!",
        products: []
      };
    } else {
      return {
        text: "I'd be happy to help with that. Could you provide a bit more detail about what you're looking for?",
        products: []
      };
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleProductClick = (productId) => {
    navigate(`/vendi/product/${productId}`);
    setIsOpen(false);
  };

  return (
    <div className={`shopping-assistant ${isOpen ? 'open' : ''}`}>
      <button 
        className="assistant-toggle"
        onClick={toggleAssistant}
        aria-label={isOpen ? 'Close shopping assistant' : 'Open shopping assistant'}
      >
        {isOpen ? '×' : '💬'}
      </button>

      <div className="assistant-container">
        <div className="assistant-header">
          <h3>Shopping Assistant</h3>
          <button 
            className="close-button"
            onClick={toggleAssistant}
            aria-label="Close shopping assistant"
          >
            ×
          </button>
        </div>

        <div className="assistant-messages">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
            >
              {message.sender === 'assistant' && (
                <div className="assistant-avatar">AI</div>
              )}
              
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                
                {message.products && message.products.length > 0 && (
                  <div className="product-suggestions">
                    {message.products.map(product => (
                      <div 
                        key={product.id}
                        className="suggested-product"
                        onClick={() => handleProductClick(product.id)}
                      >
                        <div className="product-image">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} />
                          ) : (
                            <div className="placeholder-image">No Image</div>
                          )}
                        </div>
                        
                        <div className="product-details">
                          <h4>{product.name}</h4>
                          <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message assistant typing">
              <div className="assistant-avatar">AI</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-button"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="assistant-input">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about products..."
            disabled={isTyping}
          />
          <button 
            className="send-button"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingAssistant;