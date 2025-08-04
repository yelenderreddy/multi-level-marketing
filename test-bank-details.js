const axios = require('axios');

// Test data from the image
const testBankDetails = {
  bankName: "IndusInd Bank",
  accountNumber: "100273186118",
  ifscCode: "INDB0001522",
  accountHolderName: "DUNABOINA ANITHA LAKSHMI PRASNNA"
};

async function testBankDetailsAPI() {
  try {
    console.log('🧪 Testing Bank Details API...\n');
    
    // Test 1: Validate bank details
    console.log('1️⃣ Testing validateBankDetails endpoint...');
    try {
      const validateResponse = await axios.post('http://localhost:3000/api/bankDetails/validateBankDetails', testBankDetails);
      console.log('✅ Validation successful:', validateResponse.data);
    } catch (error) {
      console.log('❌ Validation failed:', error.response?.data || error.message);
    }
    
    console.log('\n2️⃣ Testing createOrUpdateBankDetails endpoint...');
    try {
      const createResponse = await axios.post('http://localhost:3000/api/bankDetails/createOrUpdateBankDetails/1', testBankDetails);
      console.log('✅ Create/Update successful:', createResponse.data);
    } catch (error) {
      console.log('❌ Create/Update failed:', error.response?.data || error.message);
    }
    
    console.log('\n3️⃣ Testing getBankDetails endpoint...');
    try {
      const getResponse = await axios.get('http://localhost:3000/api/bankDetails/getBankDetails/1');
      console.log('✅ Get bank details successful:', getResponse.data);
    } catch (error) {
      console.log('❌ Get bank details failed:', error.response?.data || error.message);
    }
    
    console.log('\n4️⃣ Testing checkBankDetails endpoint...');
    try {
      const checkResponse = await axios.get('http://localhost:3000/api/bankDetails/checkBankDetails/1');
      console.log('✅ Check bank details successful:', checkResponse.data);
    } catch (error) {
      console.log('❌ Check bank details failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Note: This test requires authentication. You'll need to add a valid JWT token
console.log('⚠️  Note: This test requires authentication. Add a valid JWT token to the Authorization header.');
console.log('Example: Authorization: Bearer <your-jwt-token>\n');

testBankDetailsAPI(); 