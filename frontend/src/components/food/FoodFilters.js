const React = require('react');
require('./FoodFilters.css');

const FoodFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = React.useState({
    dietary: [],
    priceRange: [0, 1000]
  });

  const dietaryOptions = [
    { id: 'is_vegetarian', label: 'Vegetarian' },
    { id: 'is_vegan', label: 'Vegan' },
    { id: 'is_gluten_free', label: 'Gluten Free' },
    { id: 'is_organic', label: 'Organic' }
  ];

  const handleDietaryChange = (optionId) => {
    const newDietary = filters.dietary.includes(optionId)
      ? filters.dietary.filter(id => id !== optionId)
      : [...filters.dietary, optionId];

    const newFilters = { ...filters, dietary: newDietary };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (min, max) => {
    const newFilters = { ...filters, priceRange: [min, max] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return React.createElement('div', { className: 'food-filters' },
    React.createElement('div', { className: 'filter-section' },
      React.createElement('h3', null, 'Dietary Preferences'),
      React.createElement('div', { className: 'dietary-options' },
        dietaryOptions.map(option =>
          React.createElement('label', {
            key: option.id,
            className: 'dietary-option'
          },
            React.createElement('input', {
              type: 'checkbox',
              checked: filters.dietary.includes(option.id),
              onChange: () => handleDietaryChange(option.id)
            }),
            React.createElement('span', null, option.label)
          )
        )
      )
    ),
    React.createElement('div', { className: 'filter-section' },
      React.createElement('h3', null, 'Price Range'),
      React.createElement('div', { className: 'price-range' },
        React.createElement('input', {
          type: 'range',
          min: '0',
          max: '1000',
          value: filters.priceRange[1],
          onChange: (e) => handlePriceChange(filters.priceRange[0], parseInt(e.target.value)),
          className: 'price-slider'
        }),
        React.createElement('div', { className: 'price-inputs' },
          React.createElement('input', {
            type: 'number',
            value: filters.priceRange[0],
            onChange: (e) => handlePriceChange(parseInt(e.target.value), filters.priceRange[1]),
            min: '0',
            max: filters.priceRange[1]
          }),
          React.createElement('span', null, 'to'),
          React.createElement('input', {
            type: 'number',
            value: filters.priceRange[1],
            onChange: (e) => handlePriceChange(filters.priceRange[0], parseInt(e.target.value)),
            min: filters.priceRange[0],
            max: '1000'
          })
        )
      )
    )
  );
};

module.exports = FoodFilters; 