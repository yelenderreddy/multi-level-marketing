# Product Image API Integration Guide

This guide explains how to integrate and use the Product Image API with photo upload functionality in your multi-level marketing application.

## 🚀 Quick Start

### Prerequisites
- Node.js server running on `http://localhost:3000`
- Valid JWT authentication token
- Image files (jpg, jpeg, png, gif, webp) under 5MB

### Base URL
```
http://localhost:3000/product
```

## 📋 API Endpoints Overview

| Method | Endpoint | Authentication | Description |
|--------|----------|----------------|-------------|
| GET | `/all` | ❌ Public | Get all products with photo URLs |
| GET | `/:id` | ❌ Public | Get specific product with photo URL |
| POST | `/add-with-photo` | ✅ Required | Add product with photo upload |
| POST | `/add-multiple` | ✅ Required | Add multiple products (no photos) |
| PUT | `/update/:id` | ✅ Required | Update product details |
| DELETE | `/deleteProduct/:id` | ✅ Required | Delete product and its photo |

## 🔐 Authentication

Most endpoints require JWT authentication. Include your token in the request header:

```javascript
const headers = {
  'Authorization': 'Bearer your-jwt-token-here',
  'Content-Type': 'application/json'
};
```

## 📸 Photo Upload Features

### Supported File Types
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **WebP** (.webp)

### File Size Limit
- **Maximum**: 5MB per file

### File Storage
- Files stored in `uploads/` directory
- Unique filenames generated automatically
- Accessible via: `http://localhost:3000/uploads/filename`

## 🛠️ Implementation Examples

### 1. Frontend JavaScript Integration

#### Upload Product with Photo
```javascript
async function uploadProductWithPhoto(productData, photoFile) {
  const formData = new FormData();
  
  // Add product data
  formData.append('productName', productData.name);
  formData.append('productCount', productData.count.toString());
  formData.append('productCode', productData.code.toString());
  formData.append('productPrice', productData.price.toString());
  formData.append('description', productData.description || '');
  
  // Add photo file
  if (photoFile) {
    formData.append('photo', photoFile);
  }
  
  try {
    const response = await fetch('http://localhost:3000/product/add-with-photo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Product created successfully:', result.data);
      return result.data;
    } else {
      console.error('❌ Error creating product:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    throw error;
  }
}

// Usage example
const productData = {
  name: 'Premium Product',
  count: 50,
  code: 12345,
  price: 1000,
  description: 'High-quality product with amazing features'
};

const fileInput = document.getElementById('photo-input');
const photoFile = fileInput.files[0];

uploadProductWithPhoto(productData, photoFile)
  .then(product => {
    console.log('Product created:', product);
    // Handle success (e.g., show success message, redirect)
  })
  .catch(error => {
    console.error('Failed to create product:', error);
    // Handle error (e.g., show error message)
  });
```

#### Get All Products (with photos)
```javascript
async function getAllProducts() {
  try {
    const response = await fetch('http://localhost:3000/product/all');
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Products fetched:', result.data);
      return result.data;
    } else {
      console.error('❌ Error fetching products:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    throw error;
  }
}

// Usage example
getAllProducts()
  .then(products => {
    products.forEach(product => {
      console.log(`Product: ${product.productName}`);
      console.log(`Photo URL: ${product.photoUrl || 'No photo'}`);
    });
  })
  .catch(error => {
    console.error('Failed to fetch products:', error);
  });
```

#### Get Specific Product
```javascript
async function getProductById(productId) {
  try {
    const response = await fetch(`http://localhost:3000/product/${productId}`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Product fetched:', result.data);
      return result.data;
    } else {
      console.error('❌ Error fetching product:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    throw error;
  }
}

// Usage example
getProductById(1)
  .then(product => {
    console.log(`Product: ${product.productName}`);
    console.log(`Photo URL: ${product.photoUrl || 'No photo'}`);
  })
  .catch(error => {
    console.error('Failed to fetch product:', error);
  });
```

### 2. HTML Integration

#### Product Upload Form
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Upload</title>
    <style>
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .form-group input, .form-group textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .submit-btn {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .submit-btn:hover {
            background-color: #0056b3;
        }
        .preview-image {
            max-width: 200px;
            max-height: 200px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <h1>Add New Product</h1>
    
    <form id="productForm">
        <div class="form-group">
            <label for="productName">Product Name *</label>
            <input type="text" id="productName" name="productName" required>
        </div>
        
        <div class="form-group">
            <label for="productCount">Available Quantity *</label>
            <input type="number" id="productCount" name="productCount" min="0" required>
        </div>
        
        <div class="form-group">
            <label for="productCode">Product Code *</label>
            <input type="number" id="productCode" name="productCode" required>
        </div>
        
        <div class="form-group">
            <label for="productPrice">Price *</label>
            <input type="number" id="productPrice" name="productPrice" min="0" step="0.01" required>
        </div>
        
        <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description" rows="3"></textarea>
        </div>
        
        <div class="form-group">
            <label for="photo">Product Photo</label>
            <input type="file" id="photo" name="photo" accept="image/*" onchange="previewImage(this)">
            <img id="imagePreview" class="preview-image" style="display: none;">
        </div>
        
        <button type="submit" class="submit-btn">Add Product</button>
    </form>
    
    <div id="message"></div>
    
    <script>
        // Image preview functionality
        function previewImage(input) {
            const preview = document.getElementById('imagePreview');
            const file = input.files[0];
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            } else {
                preview.style.display = 'none';
            }
        }
        
        // Form submission
        document.getElementById('productForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('productName', document.getElementById('productName').value);
            formData.append('productCount', document.getElementById('productCount').value);
            formData.append('productCode', document.getElementById('productCode').value);
            formData.append('productPrice', document.getElementById('productPrice').value);
            formData.append('description', document.getElementById('description').value);
            
            const photoFile = document.getElementById('photo').files[0];
            if (photoFile) {
                formData.append('photo', photoFile);
            }
            
            try {
                const response = await fetch('http://localhost:3000/product/add-with-photo', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
                    },
                    body: formData
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    document.getElementById('message').innerHTML = 
                        `<div style="color: green; padding: 10px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px;">
                            ✅ Product created successfully! ID: ${result.data.id}
                        </div>`;
                    document.getElementById('productForm').reset();
                    document.getElementById('imagePreview').style.display = 'none';
                } else {
                    document.getElementById('message').innerHTML = 
                        `<div style="color: red; padding: 10px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
                            ❌ Error: ${result.message}
                        </div>`;
                }
            } catch (error) {
                document.getElementById('message').innerHTML = 
                    `<div style="color: red; padding: 10px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
                        ❌ Network error: ${error.message}
                    </div>`;
            }
        });
    </script>
</body>
</html>
```

#### Product Display Component
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Catalog</title>
    <style>
        .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
        }
        .product-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .product-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .product-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .product-price {
            font-size: 16px;
            color: #007bff;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .product-description {
            color: #666;
            margin-bottom: 10px;
        }
        .product-stock {
            color: #28a745;
            font-size: 14px;
        }
        .no-image {
            width: 100%;
            height: 200px;
            background-color: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
            border-radius: 4px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <h1>Product Catalog</h1>
    <div id="productGrid" class="product-grid">
        <!-- Products will be loaded here -->
    </div>
    
    <script>
        async function loadProducts() {
            try {
                const response = await fetch('http://localhost:3000/product/all');
                const result = await response.json();
                
                if (response.ok) {
                    displayProducts(result.data);
                } else {
                    console.error('Error loading products:', result.message);
                }
            } catch (error) {
                console.error('Network error:', error);
            }
        }
        
        function displayProducts(products) {
            const grid = document.getElementById('productGrid');
            grid.innerHTML = '';
            
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                
                const imageHtml = product.photoUrl 
                    ? `<img src="${product.photoUrl}" alt="${product.productName}" class="product-image">`
                    : `<div class="no-image">No Image Available</div>`;
                
                card.innerHTML = `
                    ${imageHtml}
                    <div class="product-name">${product.productName}</div>
                    <div class="product-price">₹${product.productPrice}</div>
                    <div class="product-description">${product.description || 'No description available'}</div>
                    <div class="product-stock">In Stock: ${product.productCount}</div>
                `;
                
                grid.appendChild(card);
            });
        }
        
        // Load products when page loads
        loadProducts();
    </script>
</body>
</html>
```

### 3. React Integration

#### Product Upload Component
```jsx
import React, { useState } from 'react';
import axios from 'axios';

const ProductUpload = () => {
  const [formData, setFormData] = useState({
    productName: '',
    productCount: '',
    productCode: '',
    productPrice: '',
    description: ''
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const uploadData = new FormData();
      uploadData.append('productName', formData.productName);
      uploadData.append('productCount', formData.productCount);
      uploadData.append('productCode', formData.productCode);
      uploadData.append('productPrice', formData.productPrice);
      uploadData.append('description', formData.description);
      
      if (photo) {
        uploadData.append('photo', photo);
      }

      const response = await axios.post(
        'http://localhost:3000/product/add-with-photo',
        uploadData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage(`✅ Product created successfully! ID: ${response.data.data.id}`);
      setFormData({
        productName: '',
        productCount: '',
        productCode: '',
        productPrice: '',
        description: ''
      });
      setPhoto(null);
      setPreview(null);
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-upload">
      <h2>Add New Product</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name *</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Available Quantity *</label>
          <input
            type="number"
            name="productCount"
            value={formData.productCount}
            onChange={handleInputChange}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Product Code *</label>
          <input
            type="number"
            name="productCode"
            value={formData.productCode}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Price *</label>
          <input
            type="number"
            name="productPrice"
            value={formData.productPrice}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Product Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{ maxWidth: '200px', marginTop: '10px' }}
            />
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Add Product'}
        </button>
      </form>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ProductUpload;
```

#### Product List Component
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/product/all');
      setProducts(response.data.data);
    } catch (error) {
      setError('Failed to load products');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-list">
      <h2>Product Catalog</h2>
      
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            {product.photoUrl ? (
              <img
                src={product.photoUrl}
                alt={product.productName}
                className="product-image"
              />
            ) : (
              <div className="no-image">No Image Available</div>
            )}
            
            <div className="product-info">
              <h3 className="product-name">{product.productName}</h3>
              <p className="product-price">₹{product.productPrice}</p>
              <p className="product-description">
                {product.description || 'No description available'}
              </p>
              <p className="product-stock">In Stock: {product.productCount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
```

### 4. cURL Examples

#### Upload Product with Photo
```bash
curl -X POST "http://localhost:3000/product/add-with-photo" \
  -H "Authorization: Bearer your-jwt-token-here" \
  -F "productName=Premium Product" \
  -F "productCount=50" \
  -F "productCode=12345" \
  -F "productPrice=1000" \
  -F "description=High-quality product with amazing features" \
  -F "photo=@/path/to/your/image.jpg"
```

#### Get All Products
```bash
curl -X GET "http://localhost:3000/product/all"
```

#### Get Specific Product
```bash
curl -X GET "http://localhost:3000/product/1"
```

#### Update Product
```bash
curl -X PUT "http://localhost:3000/product/update/1" \
  -H "Authorization: Bearer your-jwt-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Updated Product Name",
    "productPrice": 1500,
    "productCount": 75,
    "description": "Updated description"
  }'
```

#### Delete Product
```bash
curl -X DELETE "http://localhost:3000/product/deleteProduct/1" \
  -H "Authorization: Bearer your-jwt-token-here"
```

## 🔧 Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid file type. Only image files are allowed!",
  "error": "Bad Request"
}
```

#### 413 Payload Too Large
```json
{
  "statusCode": 413,
  "message": "File too large",
  "error": "Payload Too Large"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Product not found",
  "data": null
}
```

### Error Handling in JavaScript
```javascript
async function handleApiCall(apiFunction) {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || 'Server error';
      const statusCode = error.response.status;
      
      switch (statusCode) {
        case 400:
          console.error('Bad request:', errorMessage);
          break;
        case 401:
          console.error('Unauthorized - please login again');
          // Redirect to login page
          break;
        case 413:
          console.error('File too large - please use a smaller image');
          break;
        case 404:
          console.error('Product not found');
          break;
        default:
          console.error('Server error:', errorMessage);
      }
      
      return { success: false, error: errorMessage, statusCode };
    } else if (error.request) {
      // Network error
      console.error('Network error - please check your connection');
      return { success: false, error: 'Network error' };
    } else {
      // Other error
      console.error('Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Usage
const result = await handleApiCall(() => uploadProductWithPhoto(productData, photoFile));
if (result.success) {
  console.log('Success:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## 🛡️ Security Best Practices

1. **File Validation**: Always validate file types and sizes on both client and server
2. **Authentication**: Ensure all sensitive endpoints require valid JWT tokens
3. **File Size Limits**: Implement reasonable file size limits (5MB in this case)
4. **Unique Filenames**: Use unique filenames to prevent conflicts
5. **Error Handling**: Don't expose sensitive information in error messages
6. **HTTPS**: Use HTTPS in production for secure file uploads

## 📱 Mobile Integration

### React Native Example
```javascript
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const uploadProductFromMobile = async (productData) => {
  // Request permissions
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }
  }

  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    const photoUri = result.assets[0].uri;
    
    // Create form data
    const formData = new FormData();
    formData.append('productName', productData.name);
    formData.append('productCount', productData.count.toString());
    formData.append('productCode', productData.code.toString());
    formData.append('productPrice', productData.price.toString());
    formData.append('description', productData.description || '');
    
    // Add photo
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'product-photo.jpg',
    });

    try {
      const response = await fetch('http://localhost:3000/product/add-with-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('jwt-token')}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('Product created:', result.data);
      } else {
        console.error('Error:', result.message);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  }
};
```

## 🧪 Testing

### Test with Sample Data
```javascript
// Test product data
const testProduct = {
  name: 'Test Product',
  count: 10,
  code: 99999,
  price: 500,
  description: 'This is a test product for API testing'
};

// Test without photo
uploadProductWithPhoto(testProduct, null)
  .then(product => console.log('Product created:', product))
  .catch(error => console.error('Error:', error));
```

### Test File Upload
```javascript
// Create a test file
const testFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

uploadProductWithPhoto(testProduct, testFile)
  .then(product => console.log('Product with photo created:', product))
  .catch(error => console.error('Error:', error));
```

## 📊 Response Format

### Successful Response
```json
{
  "statusCode": 201,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "productName": "Sample Product",
    "description": "Product description",
    "photo": "1703123456789-123456789.jpg",
    "photoUrl": "http://localhost:3000/uploads/1703123456789-123456789.jpg",
    "productPrice": 1000,
    "productCount": 50,
    "productStatus": "AVAILABLE",
    "productCode": 12345,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🚀 Production Deployment

### Environment Variables
```bash
# .env file
BASE_URL=https://your-domain.com
UPLOAD_PATH=./uploads/
MAX_FILE_SIZE=5242880
```

### File Storage Considerations
- Consider using cloud storage (AWS S3, Google Cloud Storage) for production
- Implement CDN for faster image delivery
- Set up proper backup strategies
- Monitor disk space usage

### Performance Optimization
- Implement image compression
- Use different image sizes for different use cases
- Implement lazy loading for product images
- Consider using WebP format for better compression

## 📞 Support

For issues or questions regarding the Product Image API:

1. Check the error messages in the response
2. Verify your JWT token is valid
3. Ensure file size is under 5MB
4. Confirm file type is supported (jpg, jpeg, png, gif, webp)
5. Check network connectivity

---

**Happy coding! 🎉** 