const React = require('react');
const { Link } = require('react-router-dom');
require('./FoodProductCard.css');

const FoodProductCard = ({ product }) => {
  const [showNutrition, setShowNutrition] = React.useState(false);
  const nutritionFacts = JSON.parse(product.nutrition_facts || '{}');

  const dietaryIcons = [
    { key: 'is_vegetarian', icon: '🥬', label: 'Vegetarian' },
    { key: 'is_vegan', icon: '🌱', label: 'Vegan' },
    { key: 'is_gluten_free', icon: '🌾', label: 'Gluten Free' },
    { key: 'is_organic', icon: '🌿', label: 'Organic' }
  ];

  return React.createElement('div', { className: 'food-product-card' },
    React.createElement('div', { className: 'product-image' },
      React.createElement('img', { src: product.image_url, alt: product.name }),
      React.createElement('div', { className: 'dietary-badges' },
        dietaryIcons.map(({ key, icon, label }) => 
          product[key] && React.createElement('span', {
            key,
            className: 'dietary-badge',
            title: label
          }, icon)
        )
      )
    ),
    React.createElement('div', { className: 'product-info' },
      React.createElement(Link, {
        to: `/product/${product.id}`,
        className: 'product-name'
      }, product.name),
      React.createElement('p', { className: 'vendor-name' }, `by ${product.vendor_name}`),
      React.createElement('p', { className: 'product-price' }, `$${product.price.toFixed(2)}`),
      React.createElement('div', { className: 'nutrition-toggle' },
        React.createElement('button', {
          onClick: () => setShowNutrition(!showNutrition),
          className: 'nutrition-btn'
        }, showNutrition ? 'Hide' : 'Show', ' Nutrition Facts')
      ),
      showNutrition && React.createElement('div', { className: 'nutrition-facts' },
        React.createElement('h4', null, 'Nutrition Facts'),
        React.createElement('div', { className: 'nutrition-grid' },
          Object.entries(nutritionFacts).map(([key, value]) =>
            React.createElement('div', { key, className: 'nutrition-item' },
              React.createElement('span', { className: 'nutrition-label' },
                key.replace(/_/g, ' ')
              ),
              React.createElement('span', { className: 'nutrition-value' }, value)
            )
          )
        )
      ),
      React.createElement('div', { className: 'product-actions' },
        React.createElement('button', { className: 'add-to-cart-btn' }, 'Add to Cart'),
        React.createElement('button', { className: 'quick-view-btn' }, 'Quick View')
      )
    )
  );
};

module.exports = FoodProductCard; 