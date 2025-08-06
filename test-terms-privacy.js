const API_BASE_URL = "http://localhost:3000";

// Test Terms API
async function testTermsAPI() {
  console.log("🧪 Testing Terms API...");
  
  try {
    // Create terms
    const createResponse = await fetch(`${API_BASE_URL}/terms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Terms & Conditions",
        content: "This is a test terms and conditions content.",
        status: "active"
      }),
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log("✅ Terms created:", createData);
    } else {
      console.log("❌ Failed to create terms:", createResponse.status);
    }

    // Get all terms
    const getAllResponse = await fetch(`${API_BASE_URL}/terms`);
    if (getAllResponse.ok) {
      const getAllData = await getAllResponse.json();
      console.log("✅ All terms retrieved:", getAllData);
    } else {
      console.log("❌ Failed to get all terms:", getAllResponse.status);
    }

    // Get active terms
    const getActiveResponse = await fetch(`${API_BASE_URL}/terms/active`);
    if (getActiveResponse.ok) {
      const getActiveData = await getActiveResponse.json();
      console.log("✅ Active terms retrieved:", getActiveData);
    } else {
      console.log("❌ Failed to get active terms:", getActiveResponse.status);
    }

  } catch (error) {
    console.error("❌ Error testing terms API:", error);
  }
}

// Test Privacy API
async function testPrivacyAPI() {
  console.log("\n🧪 Testing Privacy API...");
  
  try {
    // Create privacy policy
    const createResponse = await fetch(`${API_BASE_URL}/privacy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Privacy Policy",
        content: "This is a test privacy policy content.",
        status: "active"
      }),
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log("✅ Privacy policy created:", createData);
    } else {
      console.log("❌ Failed to create privacy policy:", createResponse.status);
    }

    // Get all privacy policies
    const getAllResponse = await fetch(`${API_BASE_URL}/privacy`);
    if (getAllResponse.ok) {
      const getAllData = await getAllResponse.json();
      console.log("✅ All privacy policies retrieved:", getAllData);
    } else {
      console.log("❌ Failed to get all privacy policies:", getAllResponse.status);
    }

    // Get active privacy policy
    const getActiveResponse = await fetch(`${API_BASE_URL}/privacy/active`);
    if (getActiveResponse.ok) {
      const getActiveData = await getActiveResponse.json();
      console.log("✅ Active privacy policy retrieved:", getActiveData);
    } else {
      console.log("❌ Failed to get active privacy policy:", getActiveResponse.status);
    }

  } catch (error) {
    console.error("❌ Error testing privacy API:", error);
  }
}

// Run tests
async function runTests() {
  console.log("🚀 Starting API Tests...\n");
  
  await testTermsAPI();
  await testPrivacyAPI();
  
  console.log("\n✅ All tests completed!");
}

runTests(); 