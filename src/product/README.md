# Product API Documentation

This document describes the Product API endpoints for managing products with photo upload functionality.

## Base URL
```
/product
```

## Authentication
Most endpoints require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Products
**GET** `/all`

Retrieves all products with their photo URLs.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Products fetched successfully",
  "data": [
    {
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
  ]
}
```

### 2. Get Product by ID
**GET** `/:id`

Retrieves a specific product by ID.

**Parameters:**
- `id` (number, required): The ID of the product

**Response:**
```json
{
  "statusCode": 200,
  "message": "Product fetched successfully",
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

### 3. Add Multiple Products
**POST** `/add-multiple` (Requires Authentication)

Creates multiple products without photos.

**Request Body:**
```json
{
  "products": [
    {
      "productName": "Product 1",
      "productCount": 10,
      "productCode": 12345,
      "productPrice": 1000,
      "description": "Product description"
    }
  ]
}
```

### 4. Add Product with Photo
**POST** `/add-with-photo` (Requires Authentication)

Creates a single product with photo upload.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `productName` (string, required): Product name
  - `productCount` (number, required): Available quantity
  - `productCode` (number, required): Product code
  - `productPrice` (number, required): Product price
  - `description` (string, optional): Product description
  - `photo` (file, optional): Product image (jpg, jpeg, png, gif, webp, max 5MB)

**Example using FormData:**
```javascript
const formData = new FormData();
formData.append('productName', 'Sample Product');
formData.append('productCount', '50');
formData.append('productCode', '12345');
formData.append('productPrice', '1000');
formData.append('description', 'Product description');
formData.append('photo', fileInput.files[0]);

const response = await fetch('/product/add-with-photo', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  },
  body: formData
});
```

**Response:**
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

### 5. Update Product
**PUT** `/update/:id` (Requires Authentication)

Updates an existing product.

**Parameters:**
- `id` (number, required): The ID of the product

**Request Body:**
```json
{
  "productName": "Updated Product Name",
  "productPrice": 1500,
  "productCount": 75,
  "description": "Updated description"
}
```

### 6. Delete Product
**DELETE** `/deleteProduct/:id` (Requires Authentication)

Deletes a product and its associated photo file.

**Parameters:**
- `id` (number, required): The ID of the product

**Response:**
```json
{
  "statusCode": 200,
  "message": "Product deleted successfully",
  "data": {
    "id": 1,
    "productName": "Sample Product",
    "photo": "1703123456789-123456789.jpg",
    // ... other product fields
  }
}
```

### 7. Order Product
**POST** `/order` (Requires Authentication)

Places an order for a product.

**Request Body:**
```json
{
  "userId": 1,
  "productName": "Sample Product",
  "quantity": 2
}
```

### 8. Get Order History
**GET** `/order-history/:userId` (Requires Authentication)

Retrieves order history for a user.

**Parameters:**
- `userId` (number, required): The ID of the user

### 9. Update Order Status
**PUT** `/order-status/:orderId` (Requires Authentication)

Updates the status of an order.

**Parameters:**
- `orderId` (number, required): The ID of the order

**Request Body:**
```json
{
  "status": "shipped"
}
```

### 10. Get All Order Details
**GET** `/order-details/all` (Requires Authentication)

Retrieves all order details with pagination.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

## Photo Upload Features

### Supported File Types
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### File Size Limit
- Maximum file size: 5MB

### File Storage
- Files are stored in the `uploads/` directory
- Unique filenames are generated using timestamp and random number
- Files are accessible via `/uploads/filename` URL

### File Naming Convention
```
{timestamp}-{randomNumber}.{extension}
Example: 1703123456789-123456789.jpg
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid file type. Only image files are allowed!",
  "error": "Bad Request"
}
```

### 413 Payload Too Large
```json
{
  "statusCode": 413,
  "message": "File too large",
  "error": "Payload Too Large"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Product not found",
  "data": null
}
```

## Frontend Integration Examples

### Upload Product with Photo (JavaScript)
```javascript
const uploadProduct = async (productData, photoFile) => {
  const formData = new FormData();
  
  // Add product data
  Object.keys(productData).forEach(key => {
    formData.append(key, productData[key]);
  });
  
  // Add photo file
  if (photoFile) {
    formData.append('photo', photoFile);
  }
  
  const response = await fetch('/product/add-with-photo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};
```

### Display Product Image (HTML)
```html
<img src="http://localhost:3000/uploads/product-photo.jpg" 
     alt="Product Name" 
     style="max-width: 300px; height: auto;">
```

### cURL Examples

```bash
# Add product with photo
curl -X POST "http://localhost:3000/product/add-with-photo" \
  -H "Authorization: Bearer your-jwt-token" \
  -F "productName=Sample Product" \
  -F "productCount=50" \
  -F "productCode=12345" \
  -F "productPrice=1000" \
  -F "description=Product description" \
  -F "photo=@/path/to/image.jpg"

# Get all products
curl -X GET "http://localhost:3000/product/all"

# Get product by ID
curl -X GET "http://localhost:3000/product/1"
```

## Database Schema

### Products Table
```sql
CREATE TABLE "products" (
  "id" serial PRIMARY KEY NOT NULL,
  "productName" varchar(255) NOT NULL,
  "description" text,
  "photo" varchar(255),
  "productPrice" integer DEFAULT 0 NOT NULL,
  "productCount" integer DEFAULT 0 NOT NULL,
  "productStatus" product_status DEFAULT 'AVAILABLE' NOT NULL,
  "productCode" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

## Security Features

1. **File Type Validation**: Only image files are accepted
2. **File Size Limits**: Maximum 5MB per file
3. **Unique Filenames**: Prevents filename conflicts
4. **Authentication Required**: Most endpoints require JWT authentication
5. **Input Validation**: All inputs are validated before processing
6. **File Cleanup**: Photo files are deleted when products are deleted 