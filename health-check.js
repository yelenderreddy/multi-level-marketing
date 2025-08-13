#!/usr/bin/env node

/**
 * Health Check Script
 * This script can be used to test the health endpoint of the application
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`Health Check Status: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('✅ Application is healthy');
    process.exit(0);
  } else {
    console.log('❌ Application health check failed');
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error('❌ Health check error:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();
