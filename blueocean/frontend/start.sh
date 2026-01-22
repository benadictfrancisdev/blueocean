#!/bin/bash

# Frontend startup script for DataForge AI BlueOcean

echo "🚀 Starting DataForge AI BlueOcean Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the frontend directory"
    echo "   cd frontend && ./start.sh"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if backend is running
echo "🔍 Checking if backend API is running on localhost:8000..."
if ! curl -s http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    echo "⚠️  Backend API is not running on localhost:8000"
    echo "   Please start the backend first:"
    echo "   cd ../backend && ./start.sh"
    echo ""
    echo "   The frontend will still start, but API calls will fail."
fi

# Start the development server
echo "🎯 Starting development server..."
echo "   Frontend will be available at: http://localhost:3000"
echo "   API requests will be proxied to: http://localhost:8000"
echo ""
echo "   Press Ctrl+C to stop the server"
echo ""

npm run dev