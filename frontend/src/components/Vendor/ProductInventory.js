import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductInventory.css'; // Ensure you have a corresponding CSS file for styling

const ProductInventory = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: { min: '', max: '' },
    dateAdded: '',
    status: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/vendor/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [name]: value
      }
    }));
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(filteredProducts.map(product => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleDelete = async (productId) => {
    setDeleteProductId(productId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint
      const response = await fetch(`/api/vendor/products/${deleteProductId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      setProducts(prev => prev.filter(product => product.id !== deleteProductId));
      setShowDeleteConfirm(false);
      setDeleteProductId(null);
      setError(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = filteredProducts.map(product => ({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status
    }));

    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-inventory.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target.result;
        const rows = csv.split('\n');
        const headers = rows[0].split(',');
        const data = rows.slice(1).map(row => {
          const values = row.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim();
            return obj;
          }, {});
        });

        // TODO: Replace with actual API endpoint
        const response = await fetch('/api/vendor/products/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('Failed to import products');
        }

        await fetchProducts();
        setError(null);
      } catch (err) {
        console.error('Error importing products:', err);
        setError('Failed to import products. Please check the file format and try again.');
      }
    };
    reader.readAsText(file);
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesStatus = !filters.status || product.status === filters.status;
      const matchesPrice = (!filters.priceRange.min || product.price >= parseFloat(filters.priceRange.min)) &&
                          (!filters.priceRange.max || product.price <= parseFloat(filters.priceRange.max));
      return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.direction === 'ascending') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  return (
    <div className="product-inventory-container">
      <h1>Product Inventory</h1>
      <p>Manage your product listings, track inventory, and update product information</p>

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      <div className="inventory-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search inventory..."
            className="search-bar"
            value={searchTerm}
            onChange={handleSearch}
            disabled={loading}
          />
        </div>
        <div className="action-buttons">
          <button
            className="add-product-btn"
            onClick={() => navigate('/vendor/products/add')}
            disabled={loading}
          >
            Add New Product
          </button>
          <label className="import-btn">
            Import
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              style={{ display: 'none' }}
              disabled={loading}
            />
          </label>
          <button
            className="export-btn"
            onClick={handleExport}
            disabled={loading || filteredProducts.length === 0}
          >
            Export
          </button>
        </div>
      </div>

      <div className="filters">
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="filter-dropdown"
          disabled={loading}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Audio">Audio</option>
          <option value="Wearables">Wearables</option>
          <option value="Computers">Computers</option>
          <option value="Tablets">Tablets</option>
          <option value="Accessories">Accessories</option>
        </select>

        <div className="price-range">
          <input
            type="number"
            name="min"
            placeholder="Min Price"
            value={filters.priceRange.min}
            onChange={handlePriceRangeChange}
            className="price-input"
            disabled={loading}
          />
          <span>-</span>
          <input
            type="number"
            name="max"
            placeholder="Max Price"
            value={filters.priceRange.max}
            onChange={handlePriceRangeChange}
            className="price-input"
            disabled={loading}
          />
        </div>

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="filter-dropdown"
          disabled={loading}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Out of Stock">Out of Stock</option>
          <option value="Low Stock">Low Stock</option>
        </select>
      </div>

      <div className="product-list">
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">No products found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length}
                    onChange={handleSelectAll}
                    disabled={loading}
                  />
                </th>
                <th onClick={() => handleSort('name')}>
                  Product Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('category')}>
                  Category {sortConfig.key === 'category' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('price')}>
                  Price {sortConfig.key === 'price' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('stock')}>
                  Stock {sortConfig.key === 'stock' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('status')}>
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className={product.stock < 10 ? 'low-stock' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductSelect(product.id)}
                      disabled={loading}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={`status-badge ${product.status.toLowerCase().replace(' ', '-')}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/vendor/products/${product.id}/edit`)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(product.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="inventory-summary">
        <h2>Inventory Summary</h2>
        <div className="summary-box">
          <div className="summary-item">
            <span className="summary-label">Total Products:</span>
            <span className="summary-value">{products.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Active Listings:</span>
            <span className="summary-value">{products.filter(p => p.status === 'Active').length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Out of Stock:</span>
            <span className="summary-value">{products.filter(p => p.status === 'Out of Stock').length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Low Stock:</span>
            <span className="summary-value">{products.filter(p => p.stock < 10).length}</span>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteProductId(null);
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInventory;
