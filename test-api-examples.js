const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Configuration
const BASE_URL = 'http://localhost:3000';
const JWT_TOKEN = 'your-jwt-token-here'; // Replace with your actual JWT token

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    console.log(`✅ ${method.toUpperCase()} ${endpoint} - Success:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method.toUpperCase()} ${endpoint} - Error:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testGetAllProducts = async () => {
  console.log('\n📋 Testing GET /product/all (Public endpoint)');
  try {
    const response = await axios.get(`${BASE_URL}/product/all`);
    console.log('✅ GET /product/all - Success:', response.data);
  } catch (error) {
    console.error('❌ GET /product/all - Error:', error.response?.data || error.message);
  }
};

const testGetProductById = async (id = 1) => {
  console.log(`\n📋 Testing GET /product/${id} (Public endpoint)`);
  try {
    const response = await axios.get(`${BASE_URL}/product/${id}`);
    console.log(`✅ GET /product/${id} - Success:`, response.data);
  } catch (error) {
    console.error(`❌ GET /product/${id} - Error:`, error.response?.data || error.message);
  }
};

const testAddProductWithPhoto = async () => {
  console.log('\n📋 Testing POST /product/add-with-photo');
  
  // Create a test image file if it doesn't exist
  const testImagePath = './test-image.jpg';
  if (!fs.existsSync(testImagePath)) {
    console.log('Creating test image file...');
    // Create a simple test image (1x1 pixel JPEG)
    const testImageData = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
      0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
      0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
      0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0x00,
      0x07, 0xFF, 0xD9
    ]);
    fs.writeFileSync(testImagePath, testImageData);
  }

  try {
    const formData = new FormData();
    formData.append('productName', 'Test Product with Photo');
    formData.append('productCount', '25');
    formData.append('productCode', '12345');
    formData.append('productPrice', '1500');
    formData.append('description', 'This is a test product with photo upload');
    formData.append('photo', fs.createReadStream(testImagePath));

    const response = await axios.post(`${BASE_URL}/product/add-with-photo`, formData, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ POST /product/add-with-photo - Success:', response.data);
    return response.data.data?.id; // Return the created product ID
  } catch (error) {
    console.error('❌ POST /product/add-with-photo - Error:', error.response?.data || error.message);
    throw error;
  }
};

const testAddMultipleProducts = async () => {
  console.log('\n📋 Testing POST /product/add-multiple');
  
  const productsData = {
    products: [
      {
        productName: "Product 1",
        productCount: 10,
        productCode: 12346,
        productPrice: 1000,
        description: "First test product"
      },
      {
        productName: "Product 2",
        productCount: 20,
        productCode: 12347,
        productPrice: 2000,
        description: "Second test product"
      }
    ]
  };

  await makeRequest('POST', '/product/add-multiple', productsData);
};

const testUpdateProduct = async (productId = 1) => {
  console.log(`\n📋 Testing PUT /product/update/${productId}`);
  
  const updateData = {
    productName: "Updated Product Name",
    productPrice: 2500,
    productCount: 75,
    description: "Updated description for testing"
  };

  await makeRequest('PUT', `/product/update/${productId}`, updateData);
};

const testOrderProduct = async () => {
  console.log('\n📋 Testing POST /product/order');
  
  const orderData = {
    userId: 1,
    productName: "Test Product with Photo",
    quantity: 2
  };

  await makeRequest('POST', '/product/order', orderData);
};

const testGetOrderHistory = async (userId = 1) => {
  console.log(`\n📋 Testing GET /product/order-history/${userId}`);
  await makeRequest('GET', `/product/order-history/${userId}`);
};

const testUpdateOrderStatus = async (orderId = 1) => {
  console.log(`\n📋 Testing PUT /product/order-status/${orderId}`);
  
  const statusData = {
    status: "shipped"
  };

  await makeRequest('PUT', `/product/order-status/${orderId}`, statusData);
};

const testGetAllOrderDetails = async () => {
  console.log('\n📋 Testing GET /product/order-details/all');
  await makeRequest('GET', '/product/order-details/all?page=1&limit=10');
};

const testDeleteProduct = async (productId = 1) => {
  console.log(`\n📋 Testing DELETE /product/deleteProduct/${productId}`);
  await makeRequest('DELETE', `/product/deleteProduct/${productId}`);
};

// Main test function
const runAllTests = async () => {
  console.log('🚀 Starting Product Image API Tests');
  console.log('=====================================');
  
  try {
    // Test public endpoints first
    await testGetAllProducts();
    await testGetProductById(1);
    
    // Test authenticated endpoints
    let createdProductId;
    
    // Test product creation with photo
    try {
      createdProductId = await testAddProductWithPhoto();
    } catch (error) {
      console.log('⚠️ Skipping photo upload test due to error');
    }
    
    // Test multiple products creation
    await testAddMultipleProducts();
    
    // Test product update
    await testUpdateProduct(createdProductId || 1);
    
    // Test order operations
    await testOrderProduct();
    await testGetOrderHistory(1);
    await testUpdateOrderStatus(1);
    await testGetAllOrderDetails();
    
    // Test product deletion (comment out if you want to keep the product)
    // await testDeleteProduct(createdProductId || 1);
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
};

// Export functions for individual testing
module.exports = {
  testGetAllProducts,
  testGetProductById,
  testAddProductWithPhoto,
  testAddMultipleProducts,
  testUpdateProduct,
  testOrderProduct,
  testGetOrderHistory,
  testUpdateOrderStatus,
  testGetAllOrderDetails,
  testDeleteProduct,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
} 