import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { publicAPI, customerAPI, isCustomerLoggedIn } from '../../utils/api';
import MainLayout from '../layout/MainLayout';
import SocialSharing from '../Vendi/SocialSharing';
import ARProductViewer from '../Vendi/ARProductViewer';
import VirtualTryOn from '../Vendi/VirtualTryOn';
import StockAlert from '../Vendi/StockAlert';
import SustainabilityBadge from '../Vendi/SustainabilityBadge';
import './ProductDetail.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [inComparison, setInComparison] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllSpecifications, setShowAllSpecifications] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef(null);
  const isLoggedIn = isCustomerLoggedIn();
  const productUrl = window.location.href;

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Fetch product details
        const productResponse = await publicAPI.getProductDetails(productId);
        setProduct(productResponse.data);
        
        // Set default variant if available
        if (productResponse.data.variants?.length > 0) {
          setSelectedVariant(productResponse.data.variants[0]);
        }
        
        // Set initial quantity
        setQuantity(productResponse.data.stock_quantity > 0 ? 1 : 0);
        
        // Fetch related data
        const [relatedResponse, reviewsResponse] = await Promise.all([
          publicAPI.getRelatedProducts(productId),
          publicAPI.getProductReviews(productId)
        ]);
        
        setRelatedProducts(relatedResponse.data);
        setReviews(reviewsResponse.data);
        
        // Check product status for logged-in users
        if (isLoggedIn) {
          const [wishlistResponse, comparisonResponse] = await Promise.all([
            customerAPI.checkWishlistStatus(productId),
            customerAPI.checkComparisonStatus(productId)
          ]);
          
          setInWishlist(wishlistResponse.data.inWishlist);
          setInComparison(comparisonResponse.data.inComparison);
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
    }
    
    return () => {
      setSelectedImage(0);
      setQuantity(1);
      setSelectedVariant(null);
      setZoomActive(false);
      setAddToCartSuccess(false);
    };
  }, [productId, isLoggedIn]);

  const handleQuantityChange = (newQuantity) => {
    const maxQuantity = selectedVariant?.stock_quantity || product?.stock_quantity;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    if (variant.stock_quantity < quantity) {
      setQuantity(1);
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate('/vendi/login', { state: { from: `/vendi/product/${productId}` } });
      return;
    }
    
    try {
      setAddingToCart(true);
      await customerAPI.addToCart(productId, quantity, selectedVariant?.id);
      setAddToCartSuccess(true);
      
      setTimeout(() => setAddToCartSuccess(false), 3000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add product to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      navigate('/vendi/login', { state: { from: `/vendi/product/${productId}` } });
      return;
    }
    
    try {
      await handleAddToCart();
      navigate('/vendi/checkout');
    } catch (err) {
      console.error('Error processing buy now:', err);
      setError('Failed to process purchase. Please try again.');
    }
  };

  const handleImageZoom = (e) => {
    if (!imageRef.current || !zoomActive) return;
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="product-detail-loading">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="product-detail-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </MainLayout>
    );
  }

  if (!product) return null;

  return (
    <MainLayout>
      <div className="product-detail-container">
        <div className="product-detail-grid">
          {/* Product Images */}
          <div className="product-images">
            <div 
              className={`main-image ${zoomActive ? 'zoom-active' : ''}`}
              onMouseMove={handleImageZoom}
              onMouseEnter={() => setZoomActive(true)}
              onMouseLeave={() => setZoomActive(false)}
              ref={imageRef}
              style={zoomActive ? {
                '--zoom-x': `${zoomPosition.x}%`,
                '--zoom-y': `${zoomPosition.y}%`
              } : {}}
            >
              <img 
                src={product.images[selectedImage]}
                alt={product.name}
                loading="lazy"
              />
            </div>
            <div className="image-thumbnails">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${product.name} - View ${index + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-meta">
              <SustainabilityBadge score={product.sustainability_score} />
              <div className="product-rating">
                <span className="stars">{'★'.repeat(Math.floor(product.rating))}</span>
                <span className="rating-count">({product.review_count} reviews)</span>
              </div>
            </div>

            <div className="product-price">
              {product.discount_price ? (
                <>
                  <span className="original-price">${product.price}</span>
                  <span className="discount-price">${product.discount_price}</span>
                  <span className="discount-percentage">
                    {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <span className="regular-price">${product.price}</span>
              )}
            </div>

            {/* Variants Selection */}
            {product.variants?.length > 0 && (
              <div className="variants-section">
                <h3>Available Options</h3>
                <div className="variants-grid">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      className={`variant-btn ${selectedVariant?.id === variant.id ? 'selected' : ''}`}
                      onClick={() => handleVariantChange(variant)}
                      disabled={variant.stock_quantity === 0}
                    >
                      {variant.name}
                      {variant.stock_quantity === 0 && <span className="out-of-stock">Out of Stock</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="quantity-section">
              <label htmlFor="quantity">Quantity:</label>
              <div className="quantity-controls">
                <button 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                  min="1"
                  max={selectedVariant?.stock_quantity || product.stock_quantity}
                />
                <button 
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= (selectedVariant?.stock_quantity || product.stock_quantity)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock_quantity === 0}
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={addingToCart || product.stock_quantity === 0}
              >
                Buy Now
              </button>
            </div>

            {addToCartSuccess && (
              <div className="success-message">
                Product added to cart successfully!
              </div>
            )}

            {/* Additional Features */}
            <div className="additional-features">
              {/* Sample 3D model URL - Replace with actual model URL from your product data */}
              <ARProductViewer modelUrl={product.model3d_url || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'} />
              <VirtualTryOn product={product} />
              <StockAlert product={product} />
              <SocialSharing url={productUrl} title={product.name} />
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="product-details-tabs">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-content">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="specifications-content">
                <table className="specs-table">
                  <tbody>
                    {Object.entries(product.specifications || {}).map(([key, value]) => (
                      <tr key={key}>
                        <th>{key}</th>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-content">
                {reviews.slice(0, showAllReviews ? undefined : 3).map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <span className="review-author">{review.author}</span>
                      <span className="review-rating">{'★'.repeat(review.rating)}</span>
                      <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <p className="review-text">{review.content}</p>
                  </div>
                ))}
                {reviews.length > 3 && (
                  <button
                    className="show-more-btn"
                    onClick={() => setShowAllReviews(!showAllReviews)}
                  >
                    {showAllReviews ? 'Show Less' : 'Show More Reviews'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="related-products-grid">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/vendi/product/${relatedProduct.id}`}
                  className="related-product-card"
                >
                  <img src={relatedProduct.images[0]} alt={relatedProduct.name} loading="lazy" />
                  <h3>{relatedProduct.name}</h3>
                  <p className="related-product-price">${relatedProduct.price}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProductDetail;