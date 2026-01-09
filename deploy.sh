#!/bin/bash

# Quick Vercel Deployment Script
# Fixes pnpm lockfile issues and deploys to Vercel

echo "🚀 Starting Vercel Deployment Fix..."

# Step 1: Clean up old lockfiles
echo "📁 Cleaning up old lockfiles..."
rm -f pnpm-lock.yaml package-lock.json

# Step 2: Install dependencies with npm (more reliable for Vercel)
echo "📦 Installing dependencies with npm..."
npm install

# Step 3: Test build
echo "🔨 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Step 4: Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    npx vercel --prod
    
    echo "✅ Deployment completed!"
else
    echo "❌ Build failed. Please check errors above."
    exit 1
fi
