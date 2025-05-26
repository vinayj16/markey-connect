import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../../utils/api';
import './FlashSale.css';

const FlashSale = () => {
  const [flashSales, setFlashSales] = useState([]);
  const [activeFlashSale, setActiveFlashSale] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        setLoading(true);
        const response = await publicAPI.getActiveFlashSales();
        setFlashSales(response.data);
        
        if (response.data.length > 0) {
          setActiveFlashSale(response.data[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching flash sales:', err);
        setLoading(false);
      }
    };

    fetchFlashSales();
  }, []);

  useEffect(() => {
    if (!activeFlashSale) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const endTime = new Date(activeFlashSale.end_time);
      const timeDiff = endTime - now;
      
      if (timeDiff <= 0) {
        // Flash sale has ended
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        
        // Move to the next flash sale if available
        const nextSale = flashSales.find(sale => 
          new Date(sale.end_time) > now && sale.id !== activeFlashSale.id
        );
        
        if (nextSale) {
          setActiveFlashSale(nextSale);
        } else {
          setActiveFlashSale(null);
        }
        
        return;
      }
      
      // Calculate hours, minutes, seconds
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setTimeRemaining({ hours, minutes, seconds });
    };

    // Calculate immediately and then set up interval
    calculateTimeRemaining();
    const intervalId = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(intervalId);
  }, [activeFlashSale, flashSales]);

  if (loading) {
    return <div className="flash-sale-loading">Loading deals...</div>;
  }

  if (!activeFlashSale) return null;

  const { hours, minutes, seconds } = timeRemaining;

  return (
    <div className="flash-sale-container">
      <div className="flash-sale-header">
        <div className="flash-sale-title">
          <h2>{activeFlashSale.name}</h2>
          <div className="flash-icon">⚡</div>
        </div>
        
        <div className="countdown-timer">
          <div className="timer-label">Ends in:</div>
          <div className="timer-units">
            <div className="timer-unit">
              <div className="time-value">{hours.toString().padStart(2, '0')}</div>
              <div className="time-label">Hours</div>
            </div>
            <div className="timer-separator">:</div>
            <div className="timer-unit">
              <div className="time-value">{minutes.toString().padStart(2, '0')}</div>
              <div className="time-label">Minutes</div>
            </div>
            <div className="timer-separator">:</div>
            <div className="timer-unit">
              <div className="time-value">{seconds.toString().padStart(2, '0')}</div>
              <div className="time-label">Seconds</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flash-sale-products">
        {activeFlashSale.products.map(product => (
          <Link to={`/vendi/product/${product.id}`} key={product.id} className="flash-sale-product">
            <div className="product-image">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} />
              ) : (
                <div className="placeholder-image">No Image</div>
              )}
              <div className="discount-badge">-{product.discount_percentage}%</div>
            </div>
            
            <div className="product-details">
              <h3 className="product-name">{product.name}</h3>
              
              <div className="product-price">
                <span className="original-price">${parseFloat(product.original_price).toFixed(2)}</span>
                <span className="sale-price">${parseFloat(product.sale_price).toFixed(2)}</span>
              </div>
              
              <div className="stock-info">
                <div className="stock-bar">
                  <div 
                    className="stock-progress" 
                    style={{ width: `${(product.available_stock / product.total_stock) * 100}%` }}
                  ></div>
                </div>
                <p className="stock-text">
                  {product.available_stock} of {product.total_stock} available
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="flash-sale-footer">
        <Link to="/vendi/flash-sales" className="view-all-button">
          View All Flash Sales
        </Link>
      </div>
    </div>
  );
};

export default FlashSale;