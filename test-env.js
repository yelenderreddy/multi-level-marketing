#!/usr/bin/env node

/**
 * Environment Variables Test Script
 * Run this to verify all required environment variables are set
 */

require('dotenv').config();

console.log('🧪 Testing Environment Variables...\n');

const requiredVars = {
  // Database (either DATABASE_URL or individual params)
  DATABASE_URL: process.env.DATABASE_URL,
  HOST: process.env.HOST,
  PORT: process.env.PORT,
  USER: process.env.USER,
  PASSWORD: process.env.PASSWORD,
  DATABASE: process.env.DATABASE,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  
  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  
  // Server
  NODE_ENV: process.env.NODE_ENV,
  
  // File Upload
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
  UPLOAD_PATH: process.env.UPLOAD_PATH,
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  
  // Security
  BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS,
};

let allGood = true;

console.log('📋 Environment Variables Status:\n');

// Check database configuration
if (requiredVars.DATABASE_URL) {
  console.log('✅ DATABASE_URL is set');
  console.log(`   Format: ${requiredVars.DATABASE_URL.substring(0, 30)}...`);
} else {
  console.log('⚠️  DATABASE_URL is not set');
  console.log('   Checking individual database parameters...');
  
  const dbParams = ['HOST', 'PORT', 'USER', 'PASSWORD', 'DATABASE'];
  const missingDbParams = [];
  
  for (const param of dbParams) {
    if (requiredVars[param]) {
      console.log(`   ✅ ${param}: ${param === 'PASSWORD' ? '***' : requiredVars[param]}`);
    } else {
      console.log(`   ❌ ${param}: MISSING`);
      missingDbParams.push(param);
      allGood = false;
    }
  }
  
  if (missingDbParams.length > 0) {
    console.log(`\n❌ Missing database parameters: ${missingDbParams.join(', ')}`);
  }
}

console.log('\n🔐 JWT Configuration:');
if (requiredVars.JWT_SECRET) {
  console.log('   ✅ JWT_SECRET is set');
} else {
  console.log('   ❌ JWT_SECRET is missing');
  allGood = false;
}

if (requiredVars.JWT_EXPIRES_IN) {
  console.log('   ✅ JWT_EXPIRES_IN is set');
} else {
  console.log('   ⚠️  JWT_EXPIRES_IN is not set (will use default: 1h)');
}

console.log('\n💳 Razorpay Configuration:');
if (requiredVars.RAZORPAY_KEY_ID) {
  console.log('   ✅ RAZORPAY_KEY_ID is set');
} else {
  console.log('   ❌ RAZORPAY_KEY_ID is missing');
  allGood = false;
}

if (requiredVars.RAZORPAY_KEY_SECRET) {
  console.log('   ✅ RAZORPAY_KEY_SECRET is set');
} else {
  console.log('   ❌ RAZORPAY_KEY_SECRET is missing');
  allGood = false;
}

console.log('\n🌐 Server Configuration:');
if (requiredVars.NODE_ENV) {
  console.log(`   ✅ NODE_ENV: ${requiredVars.NODE_ENV}`);
} else {
  console.log('   ⚠️  NODE_ENV is not set (will use default: development)');
}

console.log('\n📁 File Upload Configuration:');
if (requiredVars.MAX_FILE_SIZE) {
  console.log(`   ✅ MAX_FILE_SIZE: ${requiredVars.MAX_FILE_SIZE}`);
} else {
  console.log('   ⚠️  MAX_FILE_SIZE is not set (will use default: 5MB)');
}

if (requiredVars.UPLOAD_PATH) {
  console.log(`   ✅ UPLOAD_PATH: ${requiredVars.UPLOAD_PATH}`);
} else {
  console.log('   ⚠️  UPLOAD_PATH is not set (will use default: ./uploads)');
}

console.log('\n🔒 Security Configuration:');
if (requiredVars.BCRYPT_ROUNDS) {
  console.log(`   ✅ BCRYPT_ROUNDS: ${requiredVars.BCRYPT_ROUNDS}`);
} else {
  console.log('   ⚠️  BCRYPT_ROUNDS is not set (will use default: 12)');
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 All required environment variables are set!');
  console.log('✅ Ready for Railway deployment');
} else {
  console.log('❌ Some required environment variables are missing');
  console.log('📖 Please check RAILWAY_ENV_SETUP.md for setup instructions');
  process.exit(1);
}
