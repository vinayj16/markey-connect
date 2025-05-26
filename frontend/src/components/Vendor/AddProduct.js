import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discount: '',
    quantity: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    }
  });
  
  const [images, setImages] = useState({
    main: null,
    additional: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({
    main: null,
    additional: []
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrls.main) URL.revokeObjectURL(previewUrls.main);
      previewUrls.additional.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Product name is required';
      case 'description':
        return value.trim() ? '' : 'Product description is required';
      case 'category':
        return value ? '' : 'Please select a category';
      case 'price':
        return value && value > 0 ? '' : 'Please enter a valid price';
      case 'discount':
        return !value || (value >= 0 && value <= 100) ? '' : 'Discount must be between 0 and 100';
      case 'quantity':
        return !value || value >= 0 ? '' : 'Quantity must be a positive number';
      case 'weight':
        return !value || /^\d+(\.\d+)?\s*(kg|g|lb|oz)$/i.test(value) ? '' : 'Please enter a valid weight (e.g., 1.5 kg)';
      case 'dimensions.length':
      case 'dimensions.width':
      case 'dimensions.height':
        return !value || /^\d+(\.\d+)?\s*(cm|m|in|ft)$/i.test(value) ? '' : 'Please enter a valid dimension (e.g., 10 cm)';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    if (name.includes('dimensions.')) {
      const dimension = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimension]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Validate field
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      
      if (type === 'main') {
        // Cleanup old preview URL
        if (previewUrls.main) {
          URL.revokeObjectURL(previewUrls.main);
        }
        
        setImages(prev => ({ ...prev, main: file }));
        setPreviewUrls(prev => ({ ...prev, main: previewUrl }));
      } else {
        if (images.additional.length >= 5) {
          setError('Maximum 5 additional images allowed');
          return;
        }
        
        setImages(prev => ({
          ...prev,
          additional: [...prev.additional, file]
        }));
        
        setPreviewUrls(prev => ({
          ...prev,
          additional: [...prev.additional, previewUrl]
        }));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error handling image upload:', err);
      setError('Failed to process image. Please try again.');
    }
  };

  const removeImage = (type, index) => {
    if (type === 'main') {
      if (previewUrls.main) {
        URL.revokeObjectURL(previewUrls.main);
      }
      setImages(prev => ({ ...prev, main: null }));
      setPreviewUrls(prev => ({ ...prev, main: null }));
    } else {
      const urlToRemove = previewUrls.additional[index];
      URL.revokeObjectURL(urlToRemove);
      
      setImages(prev => ({
        ...prev,
        additional: prev.additional.filter((_, i) => i !== index)
      }));
      
      setPreviewUrls(prev => ({
        ...prev,
        additional: prev.additional.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (key === 'dimensions') {
        Object.keys(formData.dimensions).forEach(dim => {
          const error = validateField(`dimensions.${dim}`, formData.dimensions[dim]);
          if (error) errors[`dimensions.${dim}`] = error;
        });
      } else {
        const error = validateField(key, formData[key]);
        if (error) errors[key] = error;
      }
    });
    
    // Validate main image
    if (!images.main) {
      errors.mainImage = 'Main product image is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    setError(null);
    
    if (!isDraft && !validateForm()) {
      setError('Please fix the validation errors before submitting');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData object for file upload
      const submitData = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        if (key === 'dimensions') {
          submitData.append('dimensions', JSON.stringify(formData.dimensions));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      // Append images
      if (images.main) {
        submitData.append('mainImage', images.main);
      }
      
      images.additional.forEach((image, index) => {
        submitData.append(`additionalImage${index}`, image);
      });
      
      // Append draft status
      submitData.append('isDraft', isDraft);
      
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/products', {
        method: 'POST',
        body: submitData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }
      
      const data = await response.json();
      
      // Redirect to product page or dashboard
      navigate(`/products/${data.id}`);
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h2>Add New Product</h2>
      <nav className="breadcrumb">
        <a href="/">Home</a> &gt; <a href="/products">Products</a> &gt; Add New
      </nav>

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      <form className="product-form" onSubmit={(e) => handleSubmit(e, false)}>
        {/* Product Information */}
        <section>
          <h4>📝 Product Information</h4>
          <div>
            <input
              type="text"
              name="name"
              className={`form-control ${validationErrors.name ? 'error' : ''}`}
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleInputChange}
            />
            {validationErrors.name && (
              <span className="field-error">{validationErrors.name}</span>
            )}
          </div>
          
          <div>
            <textarea
              name="description"
              className={`form-control ${validationErrors.description ? 'error' : ''}`}
              rows="3"
              placeholder="Describe your product"
              value={formData.description}
              onChange={handleInputChange}
            />
            {validationErrors.description && (
              <span className="field-error">{validationErrors.description}</span>
            )}
          </div>
          
          <div>
            <select
              name="category"
              className={`form-control ${validationErrors.category ? 'error' : ''}`}
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Select category</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home & Garden</option>
              <option value="beauty">Beauty & Personal Care</option>
              <option value="sports">Sports & Outdoors</option>
            </select>
            {validationErrors.category && (
              <span className="field-error">{validationErrors.category}</span>
            )}
          </div>
        </section>

        {/* Pricing */}
        <section>
          <h4>💰 Pricing</h4>
          <div className="input-group">
            <div>
              <input
                type="number"
                name="price"
                className={`form-control ${validationErrors.price ? 'error' : ''}`}
                placeholder="Price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
              />
              {validationErrors.price && (
                <span className="field-error">{validationErrors.price}</span>
              )}
            </div>
            
            <div>
              <input
                type="number"
                name="discount"
                className={`form-control ${validationErrors.discount ? 'error' : ''}`}
                placeholder="Discount %"
                min="0"
                max="100"
                value={formData.discount}
                onChange={handleInputChange}
              />
              {validationErrors.discount && (
                <span className="field-error">{validationErrors.discount}</span>
              )}
            </div>
          </div>
        </section>

        {/* Inventory */}
        <section>
          <h4>📦 Inventory</h4>
          <div>
            <input
              type="number"
              name="quantity"
              className={`form-control ${validationErrors.quantity ? 'error' : ''}`}
              placeholder="Enter available quantity"
              min="0"
              value={formData.quantity}
              onChange={handleInputChange}
            />
            {validationErrors.quantity && (
              <span className="field-error">{validationErrors.quantity}</span>
            )}
          </div>
        </section>

        {/* Product Images */}
        <section className="image-upload-section">
          <h4>🖼️ Product Images</h4>
          <div className="image-box">
            <label>Main Product Image</label>
            <p>Upload a high-quality image (1000×1000px recommended)</p>
            {previewUrls.main ? (
              <div className="image-preview">
                <img src={previewUrls.main} alt="Main product preview" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => removeImage('main')}
                  aria-label="Remove main image"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="upload-button">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'main')}
                  style={{ display: 'none' }}
                />
                Upload Image
              </label>
            )}
            {validationErrors.mainImage && (
              <span className="field-error">{validationErrors.mainImage}</span>
            )}
          </div>
          
          <div className="image-box">
            <label>Additional Images</label>
            <p>Add up to 5 additional product images</p>
            <div className="additional-images">
              {previewUrls.additional.map((url, index) => (
                <div key={index} className="image-preview">
                  <img src={url} alt={`Additional preview ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => removeImage('additional', index)}
                    aria-label={`Remove additional image ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {previewUrls.additional.length < 5 && (
                <label className="upload-button">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'additional')}
                    style={{ display: 'none' }}
                  />
                  Add Image
                </label>
              )}
            </div>
          </div>
        </section>

        {/* Shipping Details */}
        <section>
          <h4>🚚 Shipping Details</h4>
          <div>
            <input
              type="text"
              name="weight"
              className={`form-control ${validationErrors.weight ? 'error' : ''}`}
              placeholder="Enter product weight (e.g., 1.5 kg)"
              value={formData.weight}
              onChange={handleInputChange}
            />
            {validationErrors.weight && (
              <span className="field-error">{validationErrors.weight}</span>
            )}
          </div>
          
          <div className="input-group">
            <div>
              <input
                type="text"
                name="dimensions.length"
                className={`form-control ${validationErrors['dimensions.length'] ? 'error' : ''}`}
                placeholder="Length"
                value={formData.dimensions.length}
                onChange={handleInputChange}
              />
              {validationErrors['dimensions.length'] && (
                <span className="field-error">{validationErrors['dimensions.length']}</span>
              )}
            </div>
            
            <div>
              <input
                type="text"
                name="dimensions.width"
                className={`form-control ${validationErrors['dimensions.width'] ? 'error' : ''}`}
                placeholder="Width"
                value={formData.dimensions.width}
                onChange={handleInputChange}
              />
              {validationErrors['dimensions.width'] && (
                <span className="field-error">{validationErrors['dimensions.width']}</span>
              )}
            </div>
            
            <div>
              <input
                type="text"
                name="dimensions.height"
                className={`form-control ${validationErrors['dimensions.height'] ? 'error' : ''}`}
                placeholder="Height"
                value={formData.dimensions.height}
                onChange={handleInputChange}
              />
              {validationErrors['dimensions.height'] && (
                <span className="field-error">{validationErrors['dimensions.height']}</span>
              )}
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="save-btn"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="submit"
            className="publish-btn"
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
