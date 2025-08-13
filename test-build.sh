#!/bin/bash

echo "🧪 Testing build process locally..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run build
echo "🔨 Running build..."
npm run build

# Check if dist directory exists
if [ -d "dist" ]; then
    echo "✅ Build successful - dist directory created"
    echo "📁 Contents of dist directory:"
    ls -la dist/
    
    # Check if main.js exists
    if [ -f "dist/main.js" ]; then
        echo "✅ main.js file found - build is complete"
    else
        echo "❌ main.js file not found in dist directory"
        exit 1
    fi
else
    echo "❌ Build failed - dist directory not created"
    exit 1
fi

echo "🎉 Build test completed successfully!"
