# Swagger Documentation Usage Guide

This guide explains how to use the Swagger UI to test your complete Multi-Level Marketing API endpoints.

## 📁 Files Created

1. **`swagger-product-api.yaml`** - Complete OpenAPI 3.0 specification with all APIs
2. **`swagger-ui.html`** - Interactive Swagger UI interface
3. **`test-api-examples.js`** - Node.js test script with examples

## 🚀 How to Use Swagger UI

### Method 1: Open HTML File Directly

1. **Start your server first:**
   ```bash
   npm run start:dev
   ```

2. **Open the Swagger UI:**
   - Double-click `swagger-ui.html` or open it in your browser
   - Or serve it using a simple HTTP server:
     ```bash
     # Using Python
     python -m http.server 8080
     
     # Using Node.js
     npx http-server -p 8080
     ```
   - Then visit: `http://localhost:8080/swagger-ui.html`

### Method 2: Use Online Swagger Editor

1. Go to [Swagger Editor](https://editor.swagger.io/)
2. Copy the contents of `swagger-product-api.yaml`
3. Paste it into the editor
4. The documentation will be automatically generated

## 🔐 Authentication Setup

### In Swagger UI:

1. **Click the "🔑 Set JWT Token" button** (top-right corner)
2. **Enter your JWT token** when prompted
3. **Click "Authorize"** in the Swagger UI interface
4. **Enter your token** in the format: `Bearer your-token-here`

### Get a JWT Token:

You'll need to get a valid JWT token from your authentication system. If you don't have one:

1. **Check your existing auth endpoints** (login/signup)
2. **Or create a test token** for development purposes

## 📋 Testing Endpoints

### Public Endpoints (No Authentication Required)

1. **GET /product/all** - Get all products
2. **GET /product/{id}** - Get specific product
3. **GET /faq/getAllFaqs** - Get all FAQs
4. **POST /api/users/createUsers** - Create new user
5. **POST /api/users/login** - User login
6. **POST /api/admin/login** - Admin login
7. **POST /api/payments/create-order** - Create Razorpay order
8. **POST /api/payments/webhook** - Razorpay webhook

### Protected Endpoints (Authentication Required)

#### Product Management
1. **POST /product/add-with-photo** - Add product with photo upload
2. **POST /product/add-multiple** - Add multiple products
3. **PUT /product/update/{id}** - Update product
4. **DELETE /product/deleteProduct/{id}** - Delete product

#### Order Management
5. **POST /product/order** - Place order
6. **GET /product/order-history/{userId}** - Get order history
7. **PUT /product/order-status/{orderId}** - Update order status
8. **GET /product/order-details/all** - Get all order details

#### User Management
9. **GET /api/users/getUserById/{id}** - Get user by ID
10. **GET /api/users/all** - Get all users
11. **POST /api/users/updateUser/{id}** - Update user details
12. **POST /api/users/updatePassword/{id}** - Update user password
13. **POST /api/users/delete/{id}** - Delete user
14. **GET /api/users/referredBy/{referralCode}** - Get users referred by code
15. **GET /api/users/referral-stats/{referralCode}** - Get referral statistics
16. **POST /api/users/updateWalletBalance/{id}** - Update wallet balance
17. **POST /api/users/updateWalletBalanceByReferralCode/{referralCode}** - Update wallet by referral
18. **GET /api/users/walletBalance/{id}** - Get wallet balance

#### FAQ Management
19. **POST /faq/createFaq** - Create FAQ
20. **PUT /faq/updateFaq/{id}** - Update FAQ
21. **DELETE /faq/deleteFaq/{id}** - Delete FAQ

#### Admin Management
22. **POST /api/admin/reward-target** - Add reward target
23. **GET /api/admin/getAll-reward-targets** - Get all reward targets
24. **POST /api/admin/reward-target/update/{id}** - Update reward target
25. **DELETE /api/admin/reward-target/{id}** - Delete reward target
26. **GET /api/admin/users-by-referral-count/{count}** - Get users by referral count
27. **POST /api/admin/approve-reward/{userId}** - Approve user reward

#### Bank Details Management
28. **GET /api/bankDetails/getBankDetails/{userId}** - Get bank details
29. **POST /api/bankDetails/createBankDetails** - Create bank details
30. **PUT /api/bankDetails/updateBankDetails** - Update bank details
31. **DELETE /api/bankDetails/deleteBankDetails** - Delete bank details
32. **GET /api/bankDetails/checkBankDetails** - Check bank details existence
33. **POST /api/bankDetails/validateBankDetails** - Validate bank details

#### Wishlist Management
34. **POST /wishlist/add/{userId}** - Add to wishlist
35. **GET /wishlist/getWishListProducts/{userId}** - Get wishlist products

## 🧪 Testing with Examples

### 1. Test Public Endpoints

**Get All Products:**
- Click on `GET /product/all`
- Click "Try it out"
- Click "Execute"
- Check the response

**Get Product by ID:**
- Click on `GET /product/{id}`
- Click "Try it out"
- Enter product ID (e.g., `1`)
- Click "Execute"

### 2. Test Product Creation with Photo

**Add Product with Photo:**
- Click on `POST /product/add-with-photo`
- Click "Try it out"
- Fill in the form:
  ```json
  {
    "productName": "Test Product",
    "productCount": 50,
    "productCode": 12345,
    "productPrice": 1000,
    "description": "Test product description"
  }
  ```
- Upload a photo file (jpg, png, gif, webp, max 5MB)
- Click "Execute"

### 3. Test Multiple Products

**Add Multiple Products:**
- Click on `POST /product/add-multiple`
- Click "Try it out"
- Enter the request body:
  ```json
  {
    "products": [
      {
        "productName": "Product 1",
        "productCount": 10,
        "productCode": 12346,
        "productPrice": 1000,
        "description": "First product"
      },
      {
        "productName": "Product 2",
        "productCount": 20,
        "productCode": 12347,
        "productPrice": 2000,
        "description": "Second product"
      }
    ]
  }
  ```
- Click "Execute"

### 4. Test Product Update

**Update Product:**
- Click on `PUT /product/update/{id}`
- Click "Try it out"
- Enter product ID (e.g., `1`)
- Enter update data:
  ```json
  {
    "productName": "Updated Product Name",
    "productPrice": 1500,
    "productCount": 75,
    "description": "Updated description"
  }
  ```
- Click "Execute"

### 5. Test Order Operations

**Place Order:**
- Click on `POST /product/order`
- Click "Try it out"
- Enter order data:
  ```json
  {
    "userId": 1,
    "productName": "Test Product",
    "quantity": 2
  }
  ```
- Click "Execute"

## 🐛 Troubleshooting

### Common Issues:

1. **"Unauthorized" Error:**
   - Make sure you've set the JWT token
   - Check if the token is valid and not expired

2. **"File too large" Error:**
   - Ensure uploaded images are under 5MB
   - Use smaller test images

3. **"Invalid file type" Error:**
   - Only upload: jpg, jpeg, png, gif, webp files
   - Check file extension

4. **"Product not found" Error:**
   - Use valid product IDs
   - Create products first before testing other operations

5. **CORS Issues:**
   - Make sure your server is running on `http://localhost:3000`
   - Check if CORS is properly configured

### Server Not Running:

If you get connection errors:
```bash
# Start the server
npm run start:dev

# Check if server is running
curl http://localhost:3000/product/all
```

## 📊 Expected Responses

### Successful Product Creation:
```json
{
  "statusCode": 201,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "productName": "Test Product",
    "description": "Test description",
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

### Error Response:
```json
{
  "statusCode": 400,
  "message": "Invalid file type. Only image files are allowed!",
  "error": "Bad Request"
}
```

## 🧪 Using the Test Script

For automated testing, use the Node.js test script:

```bash
# Install dependencies
npm install axios form-data

# Update JWT token in test-api-examples.js
# Replace 'your-jwt-token-here' with your actual token

# Run all tests
node test-api-examples.js

# Or run individual tests
node -e "
const { testGetAllProducts, testAddProductWithPhoto } = require('./test-api-examples.js');
testGetAllProducts();
"
```

## 📝 Notes

- **File Upload**: The photo upload feature works with `multipart/form-data`
- **Authentication**: Most endpoints require JWT authentication
- **File Storage**: Images are stored in the `uploads/` directory
- **URL Access**: Images are accessible via `http://localhost:3000/uploads/filename`
- **Validation**: File size limit is 5MB, supported formats: jpg, jpeg, png, gif, webp

## 🎯 Quick Test Checklist

- [ ] Server is running on `http://localhost:3000`
- [ ] JWT token is set in Swagger UI
- [ ] Test GET `/product/all` (public endpoint)
- [ ] Test POST `/product/add-with-photo` (with image upload)
- [ ] Test GET `/product/{id}` with created product
- [ ] Test PUT `/product/update/{id}` to update product
- [ ] Test DELETE `/product/deleteProduct/{id}` to delete product

---

**Happy Testing! 🚀** 