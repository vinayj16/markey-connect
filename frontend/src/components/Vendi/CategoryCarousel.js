import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CategoryCarousel.css';

const CategoryCarousel = ({ categories }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef(null);

  const handlePrevClick = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextClick = () => {
    if (currentIndex < categories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: currentIndex * carouselRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  return (
    <div className="category-carousel-container">
      <button 
        className="carousel-button prev"
        onClick={handlePrevClick}
        disabled={currentIndex === 0}
        aria-label="Previous categories"
      >
        ‹
      </button>

      <div 
        className="category-carousel"
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {categories.map((category) => (
          <Link 
            key={category.id}
            to={`/vendi/category/${category.id}`}
            className="category-card"
          >
            <div className="category-image">
              {category.image_url ? (
                <img src={category.image_url} alt={category.name} />
              ) : (
                <div className="category-icon">
                  {category.icon || '📦'}
                </div>
              )}
            </div>
            <h3 className="category-name">{category.name}</h3>
            {category.product_count && (
              <span className="product-count">
                {category.product_count} products
              </span>
            )}
          </Link>
        ))}
      </div>

      <button 
        className="carousel-button next"
        onClick={handleNextClick}
        disabled={currentIndex >= categories.length - 1}
        aria-label="Next categories"
      >
        ›
      </button>
    </div>
  );
};

export default CategoryCarousel; 