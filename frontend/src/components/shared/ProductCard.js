import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Rating from './Rating';
import PriceDisplay from './PriceDisplay';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const {
    id,
    name,
    image_url,
    rating,
    review_count,
    price,
    original_price,
    discount_percentage,
    is_new,
    free_shipping
  } = product;

  return (
    <Link to={`/vendi/product/${id}`} className="product-card">
      <div className="product-image">
        {image_url ? (
          <img src={image_url} alt={name} />
        ) : (
          <div className="placeholder-image">No Image</div>
        )}
        
        {discount_percentage > 0 && (
          <div className="discount-badge">-{discount_percentage}%</div>
        )}
        
        {is_new && (
          <div className="new-badge">New</div>
        )}
      </div>
      
      <div className="product-details">
        <h3 className="product-name">{name}</h3>
        
        <Rating rating={rating} reviewCount={review_count} />
        
        <PriceDisplay 
          price={price}
          originalPrice={original_price}
        />
        
        {free_shipping && (
          <div className="free-shipping-label">Free Shipping</div>
        )}
      </div>
    </Link>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    image_url: PropTypes.string,
    rating: PropTypes.number,
    review_count: PropTypes.number,
    price: PropTypes.number.isRequired,
    original_price: PropTypes.number,
    discount_percentage: PropTypes.number,
    is_new: PropTypes.bool,
    free_shipping: PropTypes.bool
  }).isRequired
};

export default ProductCard;