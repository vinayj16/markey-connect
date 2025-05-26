const React = require('react');
require('./FoodGroceries.css');

const FoodGroceries = ({ products = [], onAddToCart, onQuickView }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [viewMode, setViewMode] = React.useState('grid');
  const [sortBy, setSortBy] = React.useState('name');
  const [priceRange, setPriceRange] = React.useState({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState([]);

  const categories = React.useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return ['all', ...uniqueCategories];
  }, [products]);

  const availableTags = React.useMemo(() => {
    const tags = new Set();
    products.forEach(product => {
      if (product.is_vegetarian) tags.add('vegetarian');
      if (product.is_vegan) tags.add('vegan');
      if (product.is_gluten_free) tags.add('gluten-free');
      if (product.is_organic) tags.add('organic');
    });
    return Array.from(tags);
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => product[`is_${tag}`]);
      return matchesSearch && matchesCategory && matchesPrice && matchesTags;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'discount':
          return (b.discount || 0) - (a.discount || 0);
        default:
          return 0;
      }
    });
  }, [products, searchQuery, selectedCategory, sortBy, priceRange, selectedTags]);

  const featuredItems = filteredProducts.filter(product => product.is_featured).slice(0, 4);
  const organicSelection = filteredProducts.filter(product => product.is_organic).slice(0, 3);
  const specialOffers = filteredProducts.filter(product => product.discount > 0).slice(0, 2);
  const recentlyViewed = filteredProducts.slice(-2);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('name');
    setPriceRange({ min: 0, max: 1000 });
    setSelectedTags([]);
  };

  const createItemCard = (item, index) => {
    return React.createElement('div', { className: 'item-card', key: index },
      React.createElement('div', { className: 'item-image' },
        React.createElement('img', {
          src: item.image_url || '/placeholder-food.jpg',
          alt: item.name
        }),
        item.discount > 0 && React.createElement('div', { className: 'discount-badge' },
          `-${item.discount}%`
        )
      ),
      React.createElement('div', { className: 'item-content' },
        React.createElement('h3', null, item.name),
        React.createElement('p', { className: 'item-description' }, item.description),
        React.createElement('div', { className: 'item-meta' },
          item.is_vegetarian && React.createElement('span', { className: 'tag vegetarian' }, 'Vegetarian'),
          item.is_vegan && React.createElement('span', { className: 'tag vegan' }, 'Vegan'),
          item.is_gluten_free && React.createElement('span', { className: 'tag gluten-free' }, 'Gluten Free'),
          item.is_organic && React.createElement('span', { className: 'tag organic' }, 'Organic')
        ),
        React.createElement('p', { className: 'item-price' }, `$${item.price.toFixed(2)}`),
        React.createElement('div', { className: 'item-actions' },
          React.createElement('button', { 
            className: 'add-to-cart',
            onClick: () => onAddToCart && onAddToCart(item.id)
          }, 'Add to Cart'),
          React.createElement('button', { 
            className: 'details',
            onClick: () => onQuickView && onQuickView(item)
          }, 'Quick View')
        )
      )
    );
  };

  const createTableRow = (item, index) => {
    return React.createElement('tr', { key: index },
      React.createElement('td', null,
        React.createElement('div', { className: 'product-cell' },
          React.createElement('img', {
            src: item.image_url || '/placeholder-food.jpg',
            alt: item.name,
            className: 'product-thumbnail'
          }),
          React.createElement('div', { className: 'product-info' },
            React.createElement('h4', null, item.name),
            React.createElement('p', null, item.description)
          )
        )
      ),
      React.createElement('td', null, `$${item.price.toFixed(2)}`),
      React.createElement('td', null, item.category),
      React.createElement('td', null, 
        React.createElement('span', { 
          className: `stock-status ${item.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`
        }, 
        item.stock_quantity > 0 ? 'In Stock' : 'Out of Stock')
      ),
      React.createElement('td', null,
        React.createElement('div', { className: 'action-buttons' },
          React.createElement('button', { 
            className: 'add-to-cart',
            onClick: () => onAddToCart && onAddToCart(item.id)
          }, 'Add to Cart'),
          React.createElement('button', { 
            className: 'details',
            onClick: () => onQuickView && onQuickView(item)
          }, 'Quick View')
        )
      )
    );
  };

  return React.createElement('div', { className: 'food-groceries-container' },
    React.createElement('header', { className: 'food-groceries-header' },
      React.createElement('h1', null, 'Food & Groceries'),
      React.createElement('p', null, 'Discover quality food products for your daily needs'),
      React.createElement('div', { className: 'search-filters' },
        React.createElement('input', {
          type: 'text',
          placeholder: 'Search for food & groceries...',
          className: 'search-bar',
          value: searchQuery,
          onChange: handleSearch
        }),
        React.createElement('select', {
          className: 'category-select',
          value: selectedCategory,
          onChange: handleCategoryChange
        },
          categories.map(category =>
            React.createElement('option', { key: category, value: category },
              category.charAt(0).toUpperCase() + category.slice(1)
            )
          )
        ),
        React.createElement('select', {
          className: 'sort-select',
          value: sortBy,
          onChange: handleSortChange
        },
          React.createElement('option', { value: 'name' }, 'Sort by Name'),
          React.createElement('option', { value: 'price-asc' }, 'Price: Low to High'),
          React.createElement('option', { value: 'price-desc' }, 'Price: High to Low'),
          React.createElement('option', { value: 'discount' }, 'Best Discount')
        ),
        React.createElement('button', {
          className: 'filter-toggle',
          onClick: () => setShowFilters(!showFilters)
        }, showFilters ? 'Hide Filters' : 'Show Filters'),
        React.createElement('div', { className: 'view-toggle' },
          React.createElement('button', {
            className: `view-btn ${viewMode === 'grid' ? 'active' : ''}`,
            onClick: () => setViewMode('grid')
          }, 'Grid'),
          React.createElement('button', {
            className: `view-btn ${viewMode === 'list' ? 'active' : ''}`,
            onClick: () => setViewMode('list')
          }, 'List')
        )
      ),
      showFilters && React.createElement('div', { className: 'advanced-filters' },
        React.createElement('div', { className: 'price-range' },
          React.createElement('h3', null, 'Price Range'),
          React.createElement('div', { className: 'price-inputs' },
            React.createElement('input', {
              type: 'number',
              name: 'min',
              value: priceRange.min,
              onChange: handlePriceChange,
              min: 0,
              placeholder: 'Min'
            }),
            React.createElement('span', null, 'to'),
            React.createElement('input', {
              type: 'number',
              name: 'max',
              value: priceRange.max,
              onChange: handlePriceChange,
              min: 0,
              placeholder: 'Max'
            })
          )
        ),
        React.createElement('div', { className: 'tag-filters' },
          React.createElement('h3', null, 'Dietary Preferences'),
          React.createElement('div', { className: 'tag-buttons' },
            availableTags.map(tag =>
              React.createElement('button', {
                key: tag,
                className: `tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`,
                onClick: () => handleTagToggle(tag)
              }, tag.charAt(0).toUpperCase() + tag.slice(1))
            )
          )
        ),
        React.createElement('button', {
          className: 'clear-filters',
          onClick: clearFilters
        }, 'Clear All Filters')
      )
    ),

    featuredItems.length > 0 && React.createElement('section', { className: 'featured-food-products' },
      React.createElement('h2', null, 'Featured Food Products'),
      React.createElement('div', { className: `item-grid ${viewMode}` },
        featuredItems.map(createItemCard)
      )
    ),

    organicSelection.length > 0 && React.createElement('section', { className: 'organic-selection' },
      React.createElement('h2', null, 'Organic Selection'),
      React.createElement('div', { className: 'image-grid' },
        organicSelection.map((item, index) =>
          React.createElement('div', { key: index, className: 'organic-item' },
            React.createElement('img', {
              src: item.image_url || '/placeholder-food.jpg',
              alt: item.name
            }),
            React.createElement('div', { className: 'organic-overlay' },
              React.createElement('h3', null, item.name),
              React.createElement('p', null, `$${item.price.toFixed(2)}`),
              React.createElement('button', {
                className: 'view-details',
                onClick: () => onQuickView && onQuickView(item)
              }, 'View Details')
            )
          )
        )
      )
    ),

    React.createElement('section', { className: 'all-food-products' },
      React.createElement('h2', null, 'All Food Products'),
      viewMode === 'grid' ? (
        React.createElement('div', { className: 'item-grid' },
          filteredProducts.map(createItemCard)
        )
      ) : (
        React.createElement('table', null,
          React.createElement('thead', null,
            React.createElement('tr', null,
              React.createElement('th', null, 'Product'),
              React.createElement('th', null, 'Price'),
              React.createElement('th', null, 'Category'),
              React.createElement('th', null, 'Status'),
              React.createElement('th', null, 'Actions')
            )
          ),
          React.createElement('tbody', null,
            filteredProducts.map(createTableRow)
          )
        )
      ),
      React.createElement('button', { className: 'load-more' }, 'Load More')
    ),

    specialOffers.length > 0 && React.createElement('section', { className: 'special-offers' },
      React.createElement('h2', null, 'Special Offers'),
      React.createElement('div', { className: 'item-grid' },
        specialOffers.map(createItemCard)
      )
    ),

    recentlyViewed.length > 0 && React.createElement('section', { className: 'recently-viewed' },
      React.createElement('h2', null, 'Recently Viewed'),
      React.createElement('ul', null,
        recentlyViewed.map((item, index) =>
          React.createElement('li', { key: index },
            React.createElement('div', { className: 'recent-item' },
              React.createElement('img', {
                src: item.image_url || '/placeholder-food.jpg',
                alt: item.name
              }),
              React.createElement('div', { className: 'recent-item-info' },
                React.createElement('h4', null, item.name),
                React.createElement('p', null, `$${item.price.toFixed(2)}`)
              )
            )
          )
        )
      )
    )
  );
};

module.exports = FoodGroceries;
