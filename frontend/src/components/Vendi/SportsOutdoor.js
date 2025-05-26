import React from 'react';
import './SportsOutdoor.css'; // Ensure you have a corresponding CSS file for styling

const SportsOutdoor = () => {
  const featuredItems = [
    { name: 'Basketball', price: 59.99 },
    { name: 'Yoga Mat', price: 29.99 },
    { name: 'Running Shoes', price: 79.99 },
    { name: 'Tennis Racket', price: 49.99 },
  ];

  const bestSellers = [
    { name: 'Camping Tent', price: 149.99, image: 'path-to-tent.jpg' },
    { name: 'Hiking Boots', price: 99.99, image: 'path-to-boots.jpg' },
  ];

  const shopByCategory = [
    { name: 'Team Sports', subcategories: ['Basketball', 'Soccer', 'Baseball'] },
    { name: 'Fitness Equipment', subcategories: ['Weights', 'Cardio Machines', 'Yoga Equipment'] },
    { name: 'Outdoor Gear', subcategories: ['Camping', 'Hiking', 'Cycling'] },
    { name: 'Sports Apparel', subcategories: ['Running', 'Swimming', 'Cycling'] },
  ];

  const teamActivities = [
    { name: 'Football', price: 14.99, status: 'In Stock' },
    { name: 'Basketball Jersey', price: 29.99, status: 'In Stock' },
    { name: 'Soccer Ball', price: 19.99, status: 'In Stock' },
    { name: 'Tennis Racket', price: 39.99, status: 'Low Stock' },
  ];

  const popularBrands = [
    { name: 'Nike', image: 'path-to-nike.jpg' },
    { name: 'Adidas', image: 'path-to-adidas.jpg' },
    { name: 'Under Armour', image: 'path-to-ua.jpg' },
  ];

  return (
    <div className="sports-outdoor-container">
      <header className="sports-outdoor-header">
        <h1>Sports & Outdoor Equipment</h1>
        <p>High-quality gear for athletes and outdoor enthusiasts</p>
        <input type="text" placeholder="Search sports equipment..." className="search-bar" />
      </header>

      <section className="featured-items">
        <h2>Featured Sports Equipment</h2>
        <div className="item-grid">
          {featuredItems.map((item, index) => (
            <div className="item-card" key={index}>
              <h3>{item.name}</h3>
              <p>${item.price.toFixed(2)}</p>
              <button className="add-to-cart">Add to Cart</button>
              <button className="details">Details</button>
            </div>
          ))}
        </div>
      </section>

      <section className="best-sellers">
        <h2>Best Sellers</h2>
        <div className="image-grid">
          {bestSellers.map((item, index) => (
            <img key={index} src={item.image} alt={item.name} />
          ))}
        </div>
      </section>

      <section className="shop-by-category">
        <h2>Shop by Category</h2>
        <ul>
          {shopByCategory.map((category, index) => (
            <li key={index}>
              <strong>{category.name}</strong>
              <ul>
                {category.subcategories.map((subcategory, subIndex) => (
                  <li key={subIndex}>{subcategory}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="team-activities">
        <h2>Team Activities</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamActivities.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>{item.status}</td>
                <td>
                  <button className="add-to-cart">Add to Cart</button>
                  <button className="details">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="popular-brands">
        <h2>Popular Brands</h2>
        <div className="brand-grid">
          {popularBrands.map((brand, index) => (
            <img key={index} src={brand.image} alt={brand.name} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default SportsOutdoor;
