import React from 'react';
import { Link } from 'react-router-dom';
import './CategoriesSection.css';

const CategoriesSection = () => {
  const categories = [
    {
      id: 'food',
      name: 'Food & Groceries',
      image: '/images/categories/food.svg',
      subcategories: [
        { id: 'fresh-produce', name: 'Fresh Produce' },
        { id: 'dairy', name: 'Dairy & Eggs' },
        { id: 'bakery', name: 'Bakery' },
        { id: 'meat', name: 'Meat & Seafood' },
        { id: 'pantry', name: 'Pantry Items' },
        { id: 'snacks', name: 'Snacks & Beverages' }
      ]
    },
    {
      id: 'electronics',
      name: 'Electronics',
      image: '/images/categories/electronics.jpg',
      link: '/products/electronics'
    },
    {
      id: 'fashion',
      name: 'Fashion',
      image: '/images/categories/fashion.jpg',
      link: '/products/fashion'
    },
    {
      id: 'home',
      name: 'Home & Kitchen',
      image: '/images/categories/home.jpg',
      link: '/products/home'
    }
  ];

  return (
    <section className="categories-section">
      <h2 className="section-title">Shop by Category</h2>
      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <Link to={`/vendi/${category.id}`}>
              <div className="category-image">
                <img src={category.image} alt={category.name} />
              </div>
              <h3>{category.name}</h3>
            </Link>
            {category.subcategories && (
              <div className="subcategories">
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/vendi/${category.id}/${sub.id}`}
                    className="subcategory-link"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection; 