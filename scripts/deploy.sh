#!/bin/bash

# Fuzzy's Home School Deployment Script
echo "🚀 Starting Fuzzy's Home School Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run build
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Check if we want to deploy
read -p "🌐 Do you want to deploy to production? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying to production..."
    
    # Check if Vercel CLI is installed
    if command -v vercel &> /dev/null; then
        echo "📤 Deploying to Vercel..."
        vercel --prod
    elif command -v netlify &> /dev/null; then
        echo "📤 Deploying to Netlify..."
        netlify deploy --prod
    else
        echo "⚠️  No deployment CLI found. Please install Vercel or Netlify CLI"
        echo "   Vercel: npm i -g vercel"
        echo "   Netlify: npm i -g netlify-cli"
    fi
else
    echo "🏠 Starting local production server..."
    npm run start
fi

echo "✅ Deployment complete!"
