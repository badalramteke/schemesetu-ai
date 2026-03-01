#!/bin/bash

# SchemeSetu AI - Firebase Deployment Script

echo "🚀 SchemeSetu AI - Firebase Deployment"
echo "======================================"

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

echo "✓ Firebase CLI found"
echo "✓ Node.js found: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo ""
echo "🔨 Building Next.js app..."
npm run build

if [ ! -d ".next" ]; then
    echo "❌ Build failed. .next directory not found."
    exit 1
fi

echo "✓ Build successful"

# Check authentication
echo ""
echo "🔐 Checking Firebase authentication..."
if firebase list --json &> /dev/null; then
    echo "✓ Already authenticated with Firebase"
else
    echo "⚠️  Not authenticated. Running: firebase login"
    firebase login
fi

# Show deployment options
echo ""
echo "📋 Deployment Options:"
echo "1. Firebase Hosting (static files)"
echo "2. Cloud Run (full Node.js app - recommended)"
echo "3. Full Firebase deployment (hosting + functions)"
echo ""
read -p "Choose deployment option (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📤 Deploying to Firebase Hosting..."
        firebase deploy --only hosting
        ;;
    2)
        echo ""
        echo "🐳 Preparing for Cloud Run deployment..."
        echo "Run these commands:"
        echo "docker build -t gcr.io/schemesetu-ai/schemesetu-ai ."
        echo "docker push gcr.io/schemesetu-ai/schemesetu-ai"
        echo "gcloud run deploy schemesetu-ai --image gcr.io/schemesetu-ai/schemesetu-ai --platform managed --region us-central1"
        ;;
    3)
        echo ""
        echo "📤 Deploying to Firebase (hosting + functions)..."
        firebase deploy
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📚 For detailed instructions, see: FIREBASE_DEPLOYMENT.md"
