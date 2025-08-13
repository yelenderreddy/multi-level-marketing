#!/usr/bin/env node

/**
 * Build Success Script
 * This script runs after successful NestJS build
 */

try {
  const timestamp = new Date().toLocaleString();
  console.log('\n✅ Build completed successfully!');
  console.log('📁 Output directory: ./dist');
  console.log('🚀 Ready for production deployment!');
  console.log(`⏰ Build time: ${timestamp}\n`);
  
  // Exit successfully
  process.exit(0);
} catch (error) {
  console.error('❌ Build success script error:', error.message);
  // Exit with success anyway since the main build succeeded
  process.exit(0);
} 